from django.urls import path
from .views import (
    StudentDashboardSummaryView, StudentProgressDetailView,
    AdminAnalyticsOverviewView, AdminStudentPerformanceReportView,
    AdminExportCSVView
)

urlpatterns = [
    path('summary/', StudentDashboardSummaryView.as_view(), name='dashboard-summary'),
    path('progress/', StudentProgressDetailView.as_view(), name='progress-detail'),
    path('admin/analytics/', AdminAnalyticsOverviewView.as_view(), name='admin-analytics'),
    path('admin/reports/', AdminStudentPerformanceReportView.as_view(), name='admin-reports'),
    path('admin/export-csv/', AdminExportCSVView.as_view(), name='admin-export-csv'),
]
