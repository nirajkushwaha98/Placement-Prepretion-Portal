from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewCategoryViewSet, InterviewQuestionViewSet,
    SubmitInterviewAttemptView, StudentInterviewHistoryView,
    InterviewAttemptDetailView
)

router = DefaultRouter()
router.register(r'categories', InterviewCategoryViewSet, basename='interview-categories')
router.register(r'questions', InterviewQuestionViewSet, basename='interview-questions')

urlpatterns = [
    path('submit-attempt/', SubmitInterviewAttemptView.as_view(), name='interview-submit-attempt'),
    path('history/', StudentInterviewHistoryView.as_view(), name='interview-history'),
    path('attempts/<int:pk>/', InterviewAttemptDetailView.as_view(), name='interview-attempt-detail'),
    path('', include(router.urls)),
]
