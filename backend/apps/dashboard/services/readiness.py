from typing import Dict, Any, List
from datetime import datetime, timedelta
from django.conf import settings
from django.db.models import Avg, Count
from django.contrib.auth import get_user_model
from apps.aptitude.models import TestAttempt, AptitudeCategory
from apps.coding.models import CodingSubmission, CodingProblem
from apps.resume.models import Resume, ResumeAnalysis
from apps.interview.models import InterviewAttempt
from apps.recommendations.services.recommender import RecommendationEngine

User = get_user_model()

class PlacementReadinessCalculator:
    @classmethod
    def get_tier(cls, score: float) -> str:
        if score >= 91.0:
            return "Excellent"
        elif score >= 76.0:
            return "Placement Ready"
        elif score >= 61.0:
            return "Good"
        elif score >= 41.0:
            return "Developing"
        else:
            return "Beginner"

    @classmethod
    def calculate_student_scores(cls, user) -> Dict[str, Any]:
        """
        Calculates individual module scores and composite readiness score for a single student.
        """
        weights = getattr(settings, 'PLACEMENT_WEIGHTS', {
            'APTITUDE': 0.25,
            'CODING': 0.30,
            'RESUME': 0.20,
            'INTERVIEW': 0.25,
        })

        # 1. Aptitude Score (average percentage of completed attempts)
        apt_attempts = TestAttempt.objects.filter(student=user)
        apt_avg = apt_attempts.aggregate(Avg('percentage'))['percentage__avg']
        aptitude_score = round(float(apt_avg), 1) if apt_avg is not None else 0.0

        # 2. Coding Score (percentage of available problems solved with ACCEPTED status)
        total_problems = CodingProblem.objects.count()
        solved_ids = CodingSubmission.objects.filter(
            student=user, status='ACCEPTED'
        ).values_list('problem_id', flat=True).distinct()
        solved_count = len(solved_ids)
        coding_score = round(min(100.0, (solved_count / max(1, total_problems)) * 100.0), 1) if total_problems > 0 else 0.0

        # 3. Resume Score (latest resume analysis overall score)
        latest_resume = Resume.objects.filter(student=user).select_related('analysis').order_by('-uploaded_at').first()
        resume_score = round(float(latest_resume.analysis.overall_score), 1) if (latest_resume and hasattr(latest_resume, 'analysis')) else 0.0

        # 4. Interview Score (average overall score across mock interview attempts)
        interview_attempts = InterviewAttempt.objects.filter(student=user)
        interview_avg = interview_attempts.aggregate(Avg('overall_score'))['overall_score__avg']
        interview_score = round(float(interview_avg), 1) if interview_avg is not None else 0.0

        # Composite Weighted Readiness Score
        w_apt = weights.get('APTITUDE', 0.25)
        w_code = weights.get('CODING', 0.30)
        w_res = weights.get('RESUME', 0.20)
        w_int = weights.get('INTERVIEW', 0.25)

        readiness_score = round(
            (aptitude_score * w_apt) +
            (coding_score * w_code) +
            (resume_score * w_res) +
            (interview_score * w_int),
            1
        )
        tier = cls.get_tier(readiness_score)

        return {
            'readiness_score': readiness_score,
            'tier': tier,
            'weights': {
                'aptitude': int(w_apt * 100),
                'coding': int(w_code * 100),
                'resume': int(w_res * 100),
                'interview': int(w_int * 100),
            },
            'module_scores': {
                'aptitude': aptitude_score,
                'coding': coding_score,
                'resume': resume_score,
                'interview': interview_score,
            },
            'stats': {
                'tests_attempted': apt_attempts.count(),
                'problems_solved': solved_count,
                'total_problems': total_problems,
                'resumes_uploaded': Resume.objects.filter(student=user).count(),
                'interviews_attempted': interview_attempts.count(),
            }
        }

    @classmethod
    def calculate_streak(cls, user) -> int:
        """
        Calculates consecutive active days with student activity.
        """
        dates = set()
        for d in TestAttempt.objects.filter(student=user).values_list('created_at', flat=True):
            dates.add(d.date())
        for d in CodingSubmission.objects.filter(student=user).values_list('created_at', flat=True):
            dates.add(d.date())
        for d in InterviewAttempt.objects.filter(student=user).values_list('created_at', flat=True):
            dates.add(d.date())
        for d in Resume.objects.filter(student=user).values_list('uploaded_at', flat=True):
            dates.add(d.date())

        if not dates:
            return 0

        today = datetime.now().date()
        streak = 0
        curr = today

        # Check if active today or yesterday to preserve streak
        if curr not in dates:
            curr = today - timedelta(days=1)
            if curr not in dates:
                return 0

        while curr in dates:
            streak += 1
            curr -= timedelta(days=1)

        return streak

    @classmethod
    def get_recent_activity(cls, user, limit: int = 6) -> List[Dict[str, Any]]:
        activities = []

        for att in TestAttempt.objects.filter(student=user).order_by('-created_at')[:limit]:
            title = att.test.title if att.test else (att.category.name if att.category else "Practice Drill")
            activities.append({
                'id': f"apt-{att.id}",
                'type': 'aptitude',
                'title': f"Completed Aptitude Test: {title}",
                'detail': f"Scored {att.score}/{att.total_marks} ({att.percentage:.1f}%)",
                'timestamp': att.created_at,
                'status': 'passed' if att.percentage >= 60 else 'reviewed',
                'link': f"/aptitude/review/{att.id}" if att.id else "/aptitude",
                'target_id': att.id,
            })

        for sub in CodingSubmission.objects.filter(student=user).order_by('-created_at')[:limit]:
            activities.append({
                'id': f"code-{sub.id}",
                'type': 'coding',
                'title': f"Solved: {sub.problem.title}",
                'detail': f"{sub.language.capitalize()} - {sub.passed_test_cases}/{sub.total_test_cases} Test Cases ({sub.status})",
                'timestamp': sub.created_at,
                'status': 'passed' if sub.status == 'ACCEPTED' else 'reviewed',
                'link': f"/coding/{sub.problem.id}",
                'target_id': sub.problem.id,
            })

        for res in Resume.objects.filter(student=user).order_by('-uploaded_at')[:limit]:
            score = res.analysis.overall_score if hasattr(res, 'analysis') else 0
            activities.append({
                'id': f"res-{res.id}",
                'type': 'resume',
                'title': f"Uploaded Resume: {res.file_name}",
                'detail': f"ATS Score: {score}/100",
                'timestamp': res.uploaded_at,
                'status': 'passed' if score >= 75 else 'reviewed',
                'link': '/resume',
                'target_id': res.id,
            })

        for iv in InterviewAttempt.objects.filter(student=user).order_by('-created_at')[:limit]:
            q_text = iv.question.question if iv.question else "Mock Interview Question"
            activities.append({
                'id': f"int-{iv.id}",
                'type': 'interview',
                'title': f"Practiced Interview: {q_text[:40]}...",
                'detail': f"Feedback Score: {iv.overall_score:.0f}/100",
                'timestamp': iv.created_at,
                'status': 'passed' if iv.overall_score >= 70 else 'reviewed',
                'link': f"/interview/practice/{iv.question.id}" if iv.question else "/interview",
                'target_id': iv.id,
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return activities[:limit]

    @classmethod
    def get_progress_timeline(cls, user) -> Dict[str, Any]:
        """
        Builds weekly/daily historical performance data for Recharts graphs
        based strictly on the student's actual database activity.
        """
        student_data = cls.calculate_student_scores(user)
        scores = student_data['module_scores']
        weights = getattr(settings, 'PLACEMENT_WEIGHTS', {
            'APTITUDE': 0.25,
            'CODING': 0.30,
            'RESUME': 0.20,
            'INTERVIEW': 0.25,
        })
        w_apt = weights.get('APTITUDE', 0.25)
        w_code = weights.get('CODING', 0.30)
        w_res = weights.get('RESUME', 0.20)
        w_int = weights.get('INTERVIEW', 0.25)

        total_problems = max(1, CodingProblem.objects.count())

        # Historical attempts
        apt_history = list(TestAttempt.objects.filter(student=user).order_by('created_at').values('percentage', 'created_at'))
        int_history = list(InterviewAttempt.objects.filter(student=user).order_by('created_at').values('overall_score', 'created_at'))

        line_chart_data = []
        now = datetime.now()

        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            day_str = day.strftime('%b %d')
            day_date = day.date()

            # 1. Aptitude up to this day
            apt_up_to_day = [x['percentage'] for x in apt_history if x['created_at'].date() <= day_date]
            apt_score = round(sum(apt_up_to_day) / len(apt_up_to_day), 1) if apt_up_to_day else 0.0

            # 2. Interview up to this day
            int_up_to_day = [x['overall_score'] for x in int_history if x['created_at'].date() <= day_date]
            int_score = round(sum(int_up_to_day) / len(int_up_to_day), 1) if int_up_to_day else 0.0

            # 3. Coding up to this day
            coding_solved_count = CodingSubmission.objects.filter(
                student=user, status='ACCEPTED', created_at__date__lte=day_date
            ).values_list('problem_id', flat=True).distinct().count()
            coding_score = round(min(100.0, (coding_solved_count / total_problems) * 100.0), 1)

            # 4. Resume up to this day
            latest_res = Resume.objects.filter(
                student=user, uploaded_at__date__lte=day_date
            ).select_related('analysis').order_by('-uploaded_at').first()
            resume_score = round(float(latest_res.analysis.overall_score), 1) if (latest_res and hasattr(latest_res, 'analysis')) else 0.0

            # Cumulative composite readiness on this day
            readiness_on_day = round(
                (apt_score * w_apt) +
                (coding_score * w_code) +
                (resume_score * w_res) +
                (int_score * w_int),
                1
            )

            line_chart_data.append({
                'date': day_str,
                'aptitude': apt_score,
                'interview': int_score,
                'readiness': readiness_on_day,
                'coding': coding_score,
                'resume': resume_score,
            })

        # Category Bar chart data (Real performance per category)
        categories = AptitudeCategory.objects.all()
        category_bar_data = []
        for cat in categories:
            cat_attempts = TestAttempt.objects.filter(student=user, category=cat)
            cat_avg = cat_attempts.aggregate(Avg('percentage'))['percentage__avg']
            category_bar_data.append({
                'category': cat.name,
                'score': round(float(cat_avg), 1) if cat_avg is not None else 0.0
            })

        # Radar chart data (Exact Module Scores)
        radar_chart_data = [
            {'subject': 'Quantitative & Logical', 'score': scores['aptitude'], 'fullMark': 100},
            {'subject': 'Problem Solving & DSA', 'score': scores['coding'], 'fullMark': 100},
            {'subject': 'Resume & ATS Quality', 'score': scores['resume'], 'fullMark': 100},
            {'subject': 'Technical Articulation', 'score': scores['interview'], 'fullMark': 100},
            {'subject': 'Behavioral & HR', 'score': scores['interview'], 'fullMark': 100},
        ]

        return {
            'line_chart_data': line_chart_data,
            'category_bar_data': category_bar_data,
            'radar_chart_data': radar_chart_data
        }
