from typing import Dict, Any, List
from django.db.models import Avg, Count
from apps.aptitude.models import TestAttempt, AptitudeQuestion
from apps.coding.models import CodingSubmission, CodingProblem
from apps.resume.models import Resume, ResumeAnalysis
from apps.interview.models import InterviewAttempt

class RecommendationEngine:
    @classmethod
    def get_recommendations_and_analytics(cls, user) -> Dict[str, Any]:
        """
        Analyzes student's cross-module performance and generates personalized
        recommendations, strengths, and weaknesses.
        """
        # 1. Aptitude stats
        apt_attempts = TestAttempt.objects.filter(student=user).order_by('-created_at')
        apt_count = apt_attempts.count()
        avg_aptitude = apt_attempts.aggregate(Avg('percentage'))['percentage__avg'] or 0.0

        # Topic breakdown from aptitude
        topic_accuracies = {}
        for att in apt_attempts[:5]:  # Recent 5 attempts
            breakdown = att.topic_breakdown or {}
            for topic, data in breakdown.items():
                if topic not in topic_accuracies:
                    topic_accuracies[topic] = {'correct': 0, 'total': 0}
                topic_accuracies[topic]['correct'] += data.get('correct', 0)
                topic_accuracies[topic]['total'] += data.get('total', 0)

        weak_topics = []
        strong_topics = []
        for topic, stat in topic_accuracies.items():
            if stat['total'] >= 2:
                acc = (stat['correct'] / stat['total']) * 100.0
                if acc < 50.0:
                    weak_topics.append(f"{topic} ({acc:.0f}% accuracy)")
                elif acc >= 75.0:
                    strong_topics.append(f"{topic} ({acc:.0f}% accuracy)")

        # 2. Coding stats
        submissions = CodingSubmission.objects.filter(student=user)
        total_subs = submissions.count()
        accepted_subs = submissions.filter(status='ACCEPTED')
        solved_problem_ids = accepted_subs.values_list('problem_id', flat=True).distinct()
        solved_count = len(solved_problem_ids)
        total_problems = CodingProblem.objects.count()
        coding_score = min(100.0, (solved_count / max(1, total_problems)) * 100.0) if total_problems > 0 else 0.0

        # 3. Resume stats
        latest_resume = Resume.objects.filter(student=user).select_related('analysis').order_by('-uploaded_at').first()
        resume_score = latest_resume.analysis.overall_score if (latest_resume and hasattr(latest_resume, 'analysis')) else 0.0
        resume_suggestions = latest_resume.analysis.suggestions if (latest_resume and hasattr(latest_resume, 'analysis')) else []

        # 4. Interview stats
        interview_attempts = InterviewAttempt.objects.filter(student=user)
        interview_count = interview_attempts.count()
        avg_interview = interview_attempts.aggregate(Avg('overall_score'))['overall_score__avg'] or 0.0

        # 5. Generate Dynamic Recommendations
        recommendations: List[Dict[str, str]] = []

        # Compare modules
        if coding_score < avg_aptitude and total_problems > 0:
            recommendations.append({
                'category': 'Coding Practice',
                'type': 'warning',
                'title': 'Bridge the Coding Gap',
                'description': f"Your coding score ({coding_score:.0f}%) is below your aptitude score ({avg_aptitude:.0f}%). Practice 2-3 medium problems in Data Structures today.",
                'action_label': 'Start Coding',
                'action_link': '/coding'
            })

        if weak_topics:
            recommendations.append({
                'category': 'Aptitude Focus',
                'type': 'danger',
                'title': 'Strengthen Weak Topics',
                'description': f"Your accuracy is low in {', '.join(weak_topics[:2])}. Take a focused 10-minute topic practice test.",
                'action_label': 'Take Practice Test',
                'action_link': '/aptitude'
            })

        if resume_score == 0:
            recommendations.append({
                'category': 'Resume Optimizer',
                'type': 'info',
                'title': 'Upload Your Resume',
                'description': "Upload your resume to receive AI ATS feedback, extract your skills, and identify missing keywords.",
                'action_label': 'Upload Resume',
                'action_link': '/resume'
            })
        elif resume_score < 75 and resume_suggestions:
            recommendations.append({
                'category': 'Resume Improvement',
                'type': 'warning',
                'title': 'Boost ATS Score',
                'description': f"Current resume score: {resume_score:.0f}/100. Tip: {resume_suggestions[0]}",
                'action_label': 'View Resume Feedback',
                'action_link': '/resume'
            })

        if interview_count < 3:
            recommendations.append({
                'category': 'Mock Interview',
                'type': 'primary',
                'title': 'Practice Technical & HR Questions',
                'description': "Sharpen your verbal responses and confidence with our instant AI interview evaluator.",
                'action_label': 'Practice Interview',
                'action_link': '/interview'
            })
        elif avg_interview < 70:
            recommendations.append({
                'category': 'Interview Performance',
                'type': 'warning',
                'title': 'Enhance Answer Structure',
                'description': f"Your average interview score is {avg_interview:.0f}/100. Focus on technical depth and structured STAR method delivery.",
                'action_label': 'Review Interview Feedback',
                'action_link': '/interview'
            })

        if not recommendations:
            recommendations.append({
                'category': 'Daily Routine',
                'type': 'success',
                'title': 'Maintain Your Momentum',
                'description': "You are performing consistently across all preparation tracks! Keep your daily practice streak alive.",
                'action_label': 'Explore Problems',
                'action_link': '/coding'
            })

        # Compile Weak & Strong Areas
        strong_areas = list(strong_topics)
        weak_areas = list(weak_topics)

        if avg_aptitude >= 75:
            strong_areas.append(f"Aptitude & Problem Solving ({avg_aptitude:.0f}%)")
        elif avg_aptitude > 0 and avg_aptitude < 55:
            weak_areas.append(f"Overall Aptitude Accuracy ({avg_aptitude:.0f}%)")

        if solved_count >= 5:
            strong_areas.append(f"Hands-on Coding ({solved_count} solved)")
        elif total_subs > 0 and solved_count < 2:
            weak_areas.append("Algorithmic Implementation & Edge Cases")

        if resume_score >= 80:
            strong_areas.append(f"Resume ATS Quality ({resume_score:.0f}/100)")
        elif 0 < resume_score < 65:
            weak_areas.append(f"Resume Keyword Optimization ({resume_score:.0f}/100)")

        if avg_interview >= 75:
            strong_areas.append(f"Interview Communication ({avg_interview:.0f}/100)")
        elif 0 < avg_interview < 60:
            weak_areas.append(f"Interview Technical Articulation ({avg_interview:.0f}/100)")

        if not strong_areas:
            strong_areas = ["Ready to begin building strengths across all four modules."]
        if not weak_areas:
            weak_areas = ["No critical weak areas identified yet. Continue practicing."]

        return {
            'recommendations': recommendations,
            'weak_areas': weak_areas,
            'strong_areas': strong_areas,
            'aptitude_avg': round(avg_aptitude, 1),
            'coding_score': round(coding_score, 1),
            'resume_score': round(resume_score, 1),
            'interview_avg': round(avg_interview, 1),
            'tests_attempted': apt_count,
            'problems_solved': solved_count
        }
