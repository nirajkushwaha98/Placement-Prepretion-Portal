from django.db import models
from django.conf import settings

class InterviewCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='MessageSquare')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Interview Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class InterviewQuestion(models.Model):
    DIFFICULTY_CHOICES = (
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    )

    category = models.ForeignKey(InterviewCategory, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    model_answer = models.TextField(help_text="Reference answer with high-quality structure")
    tips = models.TextField(blank=True, default='', help_text="Strategy and tips for answering")
    key_talking_points = models.JSONField(default=list, blank=True, help_text="Core points/keywords to cover")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    company_tag = models.CharField(max_length=100, blank=True, default='General', help_text="e.g. Google, Amazon, TCS, Infosys, Microsoft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'id']

    def __str__(self):
        return f"[{self.category.name}] {self.question[:60]}..."


class InterviewAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interview_attempts')
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name='attempts')
    student_answer = models.TextField()
    relevance_score = models.FloatField(default=0.0, help_text="0 to 10")
    clarity_score = models.FloatField(default=0.0, help_text="0 to 10")
    technical_score = models.FloatField(default=0.0, help_text="0 to 10")
    confidence_score = models.FloatField(default=0.0, help_text="0 to 10")
    overall_score = models.FloatField(default=0.0, help_text="0 to 100")
    feedback = models.JSONField(default=dict, blank=True, help_text="Detailed feedback breakdown")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} - Q{self.question.id} ({self.overall_score}/100)"
