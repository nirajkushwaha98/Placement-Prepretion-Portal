from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AccountsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email='teststudent@placement.com',
            username='teststudent',
            password='Password@123',
            role='STUDENT',
            first_name='Test',
            last_name='Student'
        )
        self.admin = User.objects.create_user(
            email='testadmin@placement.com',
            username='testadmin',
            password='Password@123',
            role='ADMIN',
            first_name='Test',
            last_name='Admin'
        )

    def test_student_login(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'teststudent@placement.com',
            'password': 'Password@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'STUDENT')

    def test_admin_login(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'testadmin@placement.com',
            'password': 'Password@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['role'], 'ADMIN')

    def test_student_registration(self):
        response = self.client.post('/api/auth/register/', {
            'email': 'newstudent@placement.com',
            'username': 'newstudent',
            'password': 'Password@123',
            'first_name': 'New',
            'last_name': 'Student',
            'college': 'Test College',
            'degree': 'B.Tech',
            'branch': 'CSE',
            'graduation_year': 2026
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newstudent@placement.com').exists())

    def test_student_cannot_access_admin_endpoint(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/admin/students/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_profile_retrieval(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testadmin@placement.com')
        self.assertEqual(response.data['role'], 'ADMIN')
        self.assertNotIn('password', response.data)

    def test_admin_profile_update_name_and_department(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.put('/api/auth/profile/update/', {
            'first_name': 'Super',
            'last_name': 'Admin',
            'department': 'Corporate Relations',
            'designation': 'Head of Placements'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.first_name, 'Super')
        self.assertEqual(self.admin.last_name, 'Admin')
        self.assertEqual(self.admin.admin_profile.department, 'Corporate Relations')

    def test_admin_profile_update_email(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.put('/api/auth/profile/update/', {
            'email': 'updatedadmin@placement.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.email, 'updatedadmin@placement.com')
        # Verify can login with updated email
        login_res = self.client.post('/api/auth/login/', {
            'email': 'updatedadmin@placement.com',
            'password': 'Password@123'
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_admin_duplicate_email_rejected(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.put('/api/auth/profile/update/', {
            'email': 'teststudent@placement.com'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_admin_change_password_success(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'Password@123',
            'new_password': 'NewSecurePassword@456'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify can login with new password
        login_res = self.client.post('/api/auth/login/', {
            'email': 'testadmin@placement.com',
            'password': 'NewSecurePassword@456'
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_admin_change_password_incorrect_current(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'WrongPassword999',
            'new_password': 'NewSecurePassword@456'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_unauthenticated_profile_access_rejected(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
