from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CodingProblemViewSet, RunCodeView, SubmitCodeView,
    StudentSubmissionsListView, SubmissionDetailView
)

router = DefaultRouter()
router.register(r'problems', CodingProblemViewSet, basename='coding-problems')

urlpatterns = [
    path('run/', RunCodeView.as_view(), name='run-code'),
    path('submit/', SubmitCodeView.as_view(), name='submit-code'),
    path('problems/<int:pk>/submit/', SubmitCodeView.as_view(), name='problem-submit-code'),
    path('submissions/', StudentSubmissionsListView.as_view(), name='student-submissions'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
    path('', include(router.urls)),
]
