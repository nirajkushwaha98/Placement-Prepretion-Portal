from django.urls import path
from .views import (
    ResumeUploadAndAnalyzeView, StudentResumeHistoryView,
    ResumeDetailView, JobMatchView, StudentJobMatchHistoryView
)

urlpatterns = [
    path('upload/', ResumeUploadAndAnalyzeView.as_view(), name='resume-upload'),
    path('history/', StudentResumeHistoryView.as_view(), name='resume-history'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('job-match/', JobMatchView.as_view(), name='job-match'),
    path('job-match/history/', StudentJobMatchHistoryView.as_view(), name='job-match-history'),
]
