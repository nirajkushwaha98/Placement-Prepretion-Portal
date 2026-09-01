from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import InterviewCategory, InterviewQuestion, InterviewAttempt
from .serializers import (
    InterviewCategorySerializer, InterviewQuestionSerializer, InterviewAttemptSerializer
)
from .services.evaluator import InterviewAnswerEvaluator
from apps.accounts.permissions import IsAdminUserOrReadOnly, IsPortalAdmin

class InterviewCategoryViewSet(viewsets.ModelViewSet):
    queryset = InterviewCategory.objects.all().order_by('order', 'name')
    serializer_class = InterviewCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]


class InterviewQuestionViewSet(viewsets.ModelViewSet):
    queryset = InterviewQuestion.objects.all().select_related('category')
    serializer_class = InterviewQuestionSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        queryset = InterviewQuestion.objects.all().select_related('category')
        question_id = self.request.query_params.get('id')
        category_id = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        company = self.request.query_params.get('company')
        search = self.request.query_params.get('search')

        if question_id:
            queryset = queryset.filter(id=question_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if company:
            queryset = queryset.filter(company_tag__icontains=company)
        if search:
            queryset = queryset.filter(question__icontains=search)

        return queryset


class SubmitInterviewAttemptView(APIView):
    """Submits student answer for instant AI evaluation & feedback."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question_id = request.data.get('question_id')
        student_answer = request.data.get('student_answer', '').strip()

        if not question_id:
            return Response({'error': 'Question ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not student_answer:
            return Response({'error': 'Please provide an answer.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = InterviewQuestion.objects.select_related('category').get(id=question_id)
        except InterviewQuestion.DoesNotExist:
            return Response({'error': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Run AI Evaluation
        eval_result = InterviewAnswerEvaluator.evaluate(
            student_answer=student_answer,
            question_obj=question
        )

        attempt = InterviewAttempt.objects.create(
            student=request.user,
            question=question,
            student_answer=student_answer,
            relevance_score=eval_result['relevance_score'],
            clarity_score=eval_result['clarity_score'],
            technical_score=eval_result['technical_score'],
            confidence_score=eval_result['confidence_score'],
            overall_score=eval_result['overall_score'],
            feedback=eval_result['feedback']
        )

        return Response(InterviewAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class StudentInterviewHistoryView(generics.ListAPIView):
    serializer_class = InterviewAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InterviewAttempt.objects.filter(student=self.request.user).select_related('question', 'question__category').order_by('-created_at')
        question_id = self.request.query_params.get('question_id')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        return queryset


class InterviewAttemptDetailView(generics.RetrieveAPIView):
    serializer_class = InterviewAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_portal_admin:
            return InterviewAttempt.objects.all().select_related('question', 'question__category')
        return InterviewAttempt.objects.filter(student=self.request.user).select_related('question', 'question__category')
