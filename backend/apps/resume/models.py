from django.db import models
from django.conf import settings

class Resume(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    file_name = models.CharField(max_length=255)
    file_size_kb = models.FloatField(default=0.0)
    file_type = models.CharField(max_length=50, default='application/pdf')
    extracted_text = models.TextField(blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.student.email} - {self.file_name}"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resume_analyses')
    overall_score = models.FloatField(default=0.0, help_text="Total score out of 100")
    category_scores = models.JSONField(
        default=dict,
        help_text="Scores for skills, education, projects, experience, certifications, keywords, structure, ats_compatibility"
    )
    extracted_info = models.JSONField(
        default=dict,
        help_text="Extracted contact info, skills, tools, languages, education, projects, etc."
    )
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis for {self.resume.file_name} - {self.overall_score}/100"


class JobDescriptionMatch(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_matches')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_matches')
    job_title = models.CharField(max_length=200, blank=True, default='Target Role')
    company_name = models.CharField(max_length=200, blank=True, default='')
    jd_text = models.TextField()
    match_score = models.FloatField(default=0.0, help_text="Match score percentage (0-100)")
    matching_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} vs {self.job_title} ({self.match_score}%)"
