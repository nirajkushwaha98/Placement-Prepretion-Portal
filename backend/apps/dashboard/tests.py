from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.dashboard.services.readiness import PlacementReadinessCalculator

User = get_user_model()

class DashboardAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email='student_dash@placement.com',
            username='student_dash',
            password='Password@123',
            role='STUDENT'
        )
        self.admin = User.objects.create_user(
            email='admin_dash@placement.com',
            username='admin_dash',
            password='Password@123',
            role='ADMIN'
        )

    def test_placement_readiness_calculator(self):
        scores = PlacementReadinessCalculator.calculate_student_scores(self.student)
        self.assertIn('readiness_score', scores)
        self.assertIn('tier', scores)
        self.assertIn('module_scores', scores)

    def test_student_dashboard_endpoint(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/dashboard/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('readiness_score', response.data)
        self.assertIn('recommendations', response.data)

    def test_admin_analytics_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/dashboard/admin/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', response.data)

    def test_admin_export_csv(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/dashboard/admin/export-csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
