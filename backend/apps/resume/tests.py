from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.resume.services.nlp_engine import ResumeAnalyzerNLP
from apps.resume.services.job_matcher import JobDescriptionMatcher

User = get_user_model()

class ResumeNLPTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student_res@placement.com',
            username='student_res',
            password='Password@123',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)

    def test_resume_nlp_analysis(self):
        sample_resume = """
        Rahul Verma
        Email: rahul@example.com | Phone: +1 234 567 8900 | github.com/rahulverma
        Education:
        B.Tech in Computer Science and Engineering, 2026
        Technical Skills:
        Python, Django, React, PostgreSQL, Docker, Git, REST APIs, JavaScript
        Projects:
        Placement Preparation Portal: Architected end-to-end full stack web application reducing evaluation latency by 40%.
        Experience:
        Software Engineering Intern: Developed microservices and optimized SQL queries.
        Certifications:
        AWS Certified Developer Associate
        """

        result = ResumeAnalyzerNLP.analyze(sample_resume)
        self.assertGreaterEqual(result['overall_score'], 70.0)
        self.assertIn('Python', result['extracted_info']['skills'])
        self.assertIn('React', result['extracted_info']['skills'])
        self.assertIn('Django', result['extracted_info']['skills'])
        self.assertGreaterEqual(len(result['strengths']), 1)

    def test_job_description_matcher(self):
        resume_text = "Proficient in Python, Django, React, SQL, Git, and Docker."
        jd_text = "Looking for a Software Engineer with strong Python, Django, PostgreSQL, and AWS knowledge."

        match = JobDescriptionMatcher.match(resume_text, jd_text, ['Python', 'Django', 'React', 'SQL', 'Git', 'Docker'])
        self.assertGreater(match['match_score'], 40.0)
        self.assertIn('Python', match['matching_skills'])
        self.assertIn('Django', match['matching_skills'])
        self.assertIn('AWS', match['missing_skills'])
