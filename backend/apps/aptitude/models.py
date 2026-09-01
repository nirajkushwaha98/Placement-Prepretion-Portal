from django.db import models
from django.conf import settings

class AptitudeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='Brain')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Aptitude Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class AptitudeQuestion(models.Model):
    DIFFICULTY_CHOICES = (
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    )

    category = models.ForeignKey(AptitudeCategory, on_delete=models.CASCADE, related_name='questions')
    topic = models.CharField(max_length=100, default='General')
    question_text = models.TextField()
    options = models.JSONField(help_text="List of string options, e.g. ['A', 'B', 'C', 'D']")
    correct_option_index = models.PositiveSmallIntegerField(help_text="0-indexed correct option")
    explanation = models.TextField(help_text="Detailed solution explanation")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    marks = models.PositiveIntegerField(default=1)
    negative_marks = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.category.name} - {self.difficulty}] {self.question_text[:50]}..."


class AptitudeTest(models.Model):
    DIFFICULTY_CHOICES = (
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
        ('MIXED', 'Mixed'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(AptitudeCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='tests')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    duration_minutes = models.PositiveIntegerField(default=20)
    total_questions = models.PositiveIntegerField(default=15)
    passing_percentage = models.FloatField(default=60.0)
    questions = models.ManyToManyField(AptitudeQuestion, blank=True, related_name='tests')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class TestAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='aptitude_attempts')
    test = models.ForeignKey(AptitudeTest, on_delete=models.SET_NULL, null=True, blank=True, related_name='attempts')
    category = models.ForeignKey(AptitudeCategory, on_delete=models.SET_NULL, null=True, blank=True)
    score = models.FloatField(default=0.0)
    total_marks = models.FloatField(default=0.0)
    percentage = models.FloatField(default=0.0)
    correct_count = models.PositiveIntegerField(default=0)
    incorrect_count = models.PositiveIntegerField(default=0)
    unattempted_count = models.PositiveIntegerField(default=0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    feedback_summary = models.TextField(blank=True, default='')
    topic_breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} - {self.test.title if self.test else 'Custom Practice'} ({self.percentage:.1f}%)"


class TestAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE)
    selected_option_index = models.IntegerField(null=True, blank=True, help_text="null if unattempted")
    is_correct = models.BooleanField(default=False)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Attempt {self.attempt.id} - Q{self.question.id}: {'Correct' if self.is_correct else 'Incorrect'}"
