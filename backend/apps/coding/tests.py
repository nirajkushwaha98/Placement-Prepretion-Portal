from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import CodingProblem, CodingSubmission

User = get_user_model()

class CodingAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student_code@placement.com',
            username='student_code',
            password='Password@123',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)

        self.problem = CodingProblem.objects.create(
            title='Sample Sum',
            slug='sample-sum',
            difficulty='EASY',
            description='Calculate sum',
            input_format='Two numbers',
            output_format='Sum',
            sample_input='2 3',
            sample_output='5',
            starter_code={'python': 'print(5)'},
            test_cases=[
                {'input': '2 3', 'output': '5', 'is_hidden': False},
                {'input': '10 20', 'output': '30', 'is_hidden': True},
            ],
            points=20
        )

    def test_get_coding_problems(self):
        response = self.client.get('/api/coding/problems/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_run_code(self):
        response = self.client.post('/api/coding/run/', {
            'code': 'print("hello")',
            'language': 'python',
            'input': '',
            'expected_output': 'hello'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)

    def test_submit_code(self):
        response = self.client.post(f'/api/coding/problems/{self.problem.id}/submit/', {
            'code': 'print(5)',
            'language': 'python'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['problem_title'], 'Sample Sum')
