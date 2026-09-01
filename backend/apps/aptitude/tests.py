from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import AptitudeCategory, AptitudeQuestion, AptitudeTest, TestAttempt

User = get_user_model()

class AptitudeAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student_apt@placement.com',
            username='student_apt',
            password='Password@123',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)

        self.category = AptitudeCategory.objects.create(
            name='Quantitative Aptitude',
            slug='quant',
            description='Math'
        )
        self.q1 = AptitudeQuestion.objects.create(
            category=self.category,
            topic='Percentages',
            question_text='What is 20% of 100?',
            options=['10', '20', '30', '40'],
            correct_option_index=1,
            explanation='20% of 100 is 20.',
            difficulty='EASY',
            marks=1,
            negative_marks=0.25
        )

    def test_get_categories(self):
        response = self.client.get('/api/aptitude/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_submit_test_attempt(self):
        response = self.client.post('/api/aptitude/submit-attempt/', {
            'category_id': self.category.id,
            'time_taken_seconds': 30,
            'answers': [
                {'question_id': self.q1.id, 'selected_option_index': 1, 'time_spent': 15}
            ]
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['score'], 1.0)
        self.assertEqual(response.data['percentage'], 100.0)
        self.assertEqual(response.data['correct_count'], 1)
        self.assertIn('Outstanding performance', response.data['feedback_summary'])
