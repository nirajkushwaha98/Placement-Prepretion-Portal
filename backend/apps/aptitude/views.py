import random
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AptitudeCategory, AptitudeQuestion, AptitudeTest, TestAttempt, TestAnswer
from .serializers import (
    AptitudeCategorySerializer, AptitudeQuestionAdminSerializer,
    AptitudeQuestionStudentSerializer, AptitudeTestSerializer,
    AptitudeTestAdminSerializer, TestAttemptSerializer
)
from apps.accounts.permissions import IsPortalAdmin, IsAdminUserOrReadOnly

class AptitudeCategoryViewSet(viewsets.ModelViewSet):
    queryset = AptitudeCategory.objects.all().order_by('order', 'name')
    serializer_class = AptitudeCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]


class AptitudeQuestionViewSet(viewsets.ModelViewSet):
    queryset = AptitudeQuestion.objects.all().select_related('category')
    permission_classes = [IsAdminUserOrReadOnly]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_portal_admin:
            return AptitudeQuestionAdminSerializer
        return AptitudeQuestionStudentSerializer

    def get_queryset(self):
        queryset = AptitudeQuestion.objects.all().select_related('category')
        category_id = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        topic = self.request.query_params.get('topic')
        search = self.request.query_params.get('search')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if topic:
            queryset = queryset.filter(topic__icontains=topic)
        if search:
            queryset = queryset.filter(question_text__icontains=search)
        return queryset


class AptitudeTestViewSet(viewsets.ModelViewSet):
    queryset = AptitudeTest.objects.filter(is_active=True).prefetch_related('questions')
    permission_classes = [IsAdminUserOrReadOnly]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_portal_admin:
            return AptitudeTestAdminSerializer
        return AptitudeTestSerializer

    def get_queryset(self):
        queryset = AptitudeTest.objects.all().prefetch_related('questions')
        if not (self.request.user.is_authenticated and self.request.user.is_portal_admin):
            queryset = queryset.filter(is_active=True)
        category_id = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        return queryset


class GeneratePracticeTestView(APIView):
    """Generates a dynamic practice test based on category and difficulty"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        category_id = request.data.get('category_id')
        difficulty = request.data.get('difficulty', 'MEDIUM')
        try:
            count = int(request.data.get('count', 20))
        except (ValueError, TypeError):
            count = 20

        # 1. Primary pool: matches exact category + difficulty
        qs = AptitudeQuestion.objects.all()
        if category_id:
            qs = qs.filter(category_id=category_id)
        if difficulty and difficulty != 'MIXED':
            qs = qs.filter(difficulty=difficulty)

        primary_ids = list(qs.values_list('id', flat=True))
        random.shuffle(primary_ids)

        # 2. Secondary pool: same category, different difficulty
        sec_ids = []
        if category_id:
            sec_ids = list(AptitudeQuestion.objects.filter(category_id=category_id).exclude(id__in=primary_ids).values_list('id', flat=True))
            random.shuffle(sec_ids)

        # 3. Tertiary pool: all remaining questions in DB
        ter_ids = list(AptitudeQuestion.objects.exclude(id__in=primary_ids + sec_ids).values_list('id', flat=True))
        random.shuffle(ter_ids)

        combined_ids = primary_ids + sec_ids + ter_ids
        if not combined_ids:
            return Response({'error': 'No questions available in database.'}, status=status.HTTP_404_NOT_FOUND)

        # Build exactly `count` items
        selected_ids = []
        while len(selected_ids) < count:
            for qid in combined_ids:
                if len(selected_ids) < count:
                    selected_ids.append(qid)
                else:
                    break

        questions_dict = {q.id: q for q in AptitudeQuestion.objects.filter(id__in=set(selected_ids)).select_related('category')}
        
        serialized_questions = []
        for idx, qid in enumerate(selected_ids, 1):
            if qid in questions_dict:
                q_data = AptitudeQuestionStudentSerializer(questions_dict[qid]).data
                serialized_questions.append(q_data)

        diff_label = difficulty.title() if difficulty != 'MIXED' else 'Comprehensive'

        return Response({
            'title': f"Practice Test - {diff_label}",
            'duration_minutes': max(10, int(len(serialized_questions) * 1.5)),
            'total_questions': len(serialized_questions),
            'questions': serialized_questions
        })


class SubmitTestAttemptView(APIView):
    """Evaluates student answers, calculates accuracy/percentage, and generates personalized feedback"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        test_id = data.get('test_id')
        category_id = data.get('category_id')
        time_taken_seconds = int(data.get('time_taken_seconds', 0))
        answers_data = data.get('answers', [])  # list of {question_id, selected_option_index, time_spent}

        if not answers_data:
            return Response({'error': 'No answers provided.'}, status=status.HTTP_400_BAD_REQUEST)

        question_ids = [item.get('question_id') for item in answers_data if item.get('question_id')]
        questions_map = {q.id: q for q in AptitudeQuestion.objects.filter(id__in=question_ids).select_related('category')}

        total_marks = 0.0
        earned_score = 0.0
        correct_count = 0
        incorrect_count = 0
        unattempted_count = 0
        topic_stats = {}  # topic: {correct: 0, total: 0}

        evaluated_answers = []

        for item in answers_data:
            q_id = item.get('question_id')
            selected_idx = item.get('selected_option_index')
            time_spent = int(item.get('time_spent', 0))

            question = questions_map.get(q_id)
            if not question:
                continue

            topic = question.topic or 'General'
            if topic not in topic_stats:
                topic_stats[topic] = {'correct': 0, 'total': 0, 'category': question.category.name}
            topic_stats[topic]['total'] += 1
            total_marks += question.marks

            is_correct = False
            if selected_idx is None or selected_idx < 0:
                unattempted_count += 1
            elif selected_idx == question.correct_option_index:
                is_correct = True
                correct_count += 1
                earned_score += question.marks
                topic_stats[topic]['correct'] += 1
            else:
                incorrect_count += 1
                earned_score -= question.negative_marks

            evaluated_answers.append({
                'question': question,
                'selected_option_index': selected_idx if (selected_idx is not None and selected_idx >= 0) else None,
                'is_correct': is_correct,
                'time_spent_seconds': time_spent
            })

        percentage = max(0.0, round((earned_score / total_marks * 100.0) if total_marks > 0 else 0.0, 2))
        earned_score = max(0.0, round(earned_score, 2))

        # Generate intelligent topic-level feedback
        weak_topics = []
        strong_topics = []
        for topic, stat in topic_stats.items():
            acc = (stat['correct'] / stat['total']) * 100.0
            if acc >= 70.0:
                strong_topics.append(topic)
            elif acc <= 50.0:
                weak_topics.append(topic)

        feedback_parts = []
        if percentage >= 80:
            feedback_parts.append(f"Outstanding performance! You scored {percentage}% with high accuracy.")
        elif percentage >= 60:
            feedback_parts.append(f"Good effort! You scored {percentage}%, showing solid conceptual understanding.")
        else:
            feedback_parts.append(f"You scored {percentage}%. Consistent practice will help raise your accuracy.")

        if strong_topics:
            feedback_parts.append(f"Your strengths: {', '.join(strong_topics)}.")
        if weak_topics:
            feedback_parts.append(f"Areas needing improvement: {', '.join(weak_topics)}. Focus on practicing these topics.")

        feedback_summary = " ".join(feedback_parts)

        test_obj = AptitudeTest.objects.filter(id=test_id).first() if test_id else None
        cat_obj = AptitudeCategory.objects.filter(id=category_id).first() if category_id else (test_obj.category if test_obj else None)

        attempt = TestAttempt.objects.create(
            student=user,
            test=test_obj,
            category=cat_obj,
            score=earned_score,
            total_marks=total_marks,
            percentage=percentage,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unattempted_count=unattempted_count,
            time_taken_seconds=time_taken_seconds,
            feedback_summary=feedback_summary,
            topic_breakdown=topic_stats
        )

        for ans in evaluated_answers:
            TestAnswer.objects.create(
                attempt=attempt,
                question=ans['question'],
                selected_option_index=ans['selected_option_index'],
                is_correct=ans['is_correct'],
                time_spent_seconds=ans['time_spent_seconds']
            )

        return Response(TestAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class StudentAttemptHistoryView(generics.ListAPIView):
    serializer_class = TestAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TestAttempt.objects.filter(student=self.request.user).order_by('-created_at')


class TestAttemptDetailView(generics.RetrieveAPIView):
    serializer_class = TestAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_portal_admin:
            return TestAttempt.objects.all()
        return TestAttempt.objects.filter(student=self.request.user)
