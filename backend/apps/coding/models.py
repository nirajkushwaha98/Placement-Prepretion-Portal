from django.db import models
from django.conf import settings

class CodingProblem(models.Model):
    DIFFICULTY_CHOICES = (
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    )

    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    tags = models.JSONField(default=list, blank=True, help_text="e.g. ['Arrays', 'Two Pointers', 'Dynamic Programming']")
    description = models.TextField()
    input_format = models.TextField(blank=True, default='')
    output_format = models.TextField(blank=True, default='')
    constraints = models.TextField(blank=True, default='')
    sample_input = models.TextField(blank=True, default='')
    sample_output = models.TextField(blank=True, default='')
    sample_explanation = models.TextField(blank=True, default='')
    starter_code = models.JSONField(default=dict, blank=True, help_text="Dictionary keyed by language (python, javascript, java, cpp)")
    test_cases = models.JSONField(
        default=list,
        help_text="List of test case dicts: [{'input': '...', 'output': '...', 'is_hidden': false}]"
    )
    points = models.PositiveIntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['difficulty', 'title']

    def __str__(self):
        return f"[{self.difficulty}] {self.title}"


class CodingSubmission(models.Model):
    STATUS_CHOICES = (
        ('ACCEPTED', 'Accepted'),
        ('WRONG_ANSWER', 'Wrong Answer'),
        ('TIME_LIMIT_EXCEEDED', 'Time Limit Exceeded'),
        ('COMPILATION_ERROR', 'Compilation Error'),
        ('RUNTIME_ERROR', 'Runtime Error'),
        ('PENDING', 'Pending'),
        ('ERROR', 'Error'),
    )

    LANGUAGE_CHOICES = (
        ('python', 'Python (3.8.1)'),
        ('javascript', 'JavaScript (Node.js 12.14.0)'),
        ('java', 'Java (OpenJDK 13.0.1)'),
        ('cpp', 'C++ (GCC 9.2.0)'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coding_submissions')
    problem = models.ForeignKey(CodingProblem, on_delete=models.CASCADE, related_name='submissions')
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='python')
    code = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    passed_test_cases = models.PositiveIntegerField(default=0)
    total_test_cases = models.PositiveIntegerField(default=0)
    execution_time_ms = models.FloatField(default=0.0)
    memory_kb = models.FloatField(default=0.0)
    error_message = models.TextField(blank=True, default='')
    test_case_results = models.JSONField(default=list, blank=True)
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} - {self.problem.title} ({self.status})"
