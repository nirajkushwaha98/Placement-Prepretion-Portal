from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AptitudeCategoryViewSet, AptitudeQuestionViewSet, AptitudeTestViewSet,
    GeneratePracticeTestView, SubmitTestAttemptView,
    StudentAttemptHistoryView, TestAttemptDetailView
)

router = DefaultRouter()
router.register(r'categories', AptitudeCategoryViewSet, basename='aptitude-categories')
router.register(r'questions', AptitudeQuestionViewSet, basename='aptitude-questions')
router.register(r'tests', AptitudeTestViewSet, basename='aptitude-tests')

urlpatterns = [
    path('generate-practice/', GeneratePracticeTestView.as_view(), name='generate-practice'),
    path('submit-attempt/', SubmitTestAttemptView.as_view(), name='submit-attempt'),
    path('history/', StudentAttemptHistoryView.as_view(), name='attempt-history'),
    path('attempts/<int:pk>/', TestAttemptDetailView.as_view(), name='attempt-detail'),
    path('', include(router.urls)),
]
