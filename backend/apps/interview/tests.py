from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import InterviewCategory, InterviewQuestion
from .services.evaluator import InterviewAnswerEvaluator

User = get_user_model()

class InterviewAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student_int@placement.com',
            username='student_int',
            password='Password@123',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)

        self.category = InterviewCategory.objects.create(
            name='Technical Interview',
            slug='tech-int',
            description='Tech'
        )
        self.question = InterviewQuestion.objects.create(
            category=self.category,
            question='Explain Object Oriented Programming principles.',
            model_answer='Encapsulation, Abstraction, Inheritance, and Polymorphism are the four core pillars of OOP.',
            tips='Cover all four concepts with real world examples.',
            key_talking_points=['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism']
        )

    def test_mock_interview_evaluation(self):
        student_ans = "The four main pillars of OOP are encapsulation, abstraction, inheritance, and polymorphism. For example, encapsulation bundles data and methods."
        eval_result = InterviewAnswerEvaluator.evaluate(student_ans, self.question)

        self.assertGreaterEqual(eval_result['overall_score'], 50.0)
        self.assertGreaterEqual(eval_result['relevance_score'], 6.0)
        self.assertIn('Encapsulation', eval_result['feedback']['matched_points'])
