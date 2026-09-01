from rest_framework import serializers
from .models import Resume, ResumeAnalysis, JobDescriptionMatch

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'overall_score', 'category_scores', 'extracted_info',
            'strengths', 'weaknesses', 'suggestions', 'created_at'
        ]


class ResumeSerializer(serializers.ModelSerializer):
    analysis = ResumeAnalysisSerializer(read_only=True)
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = Resume
        fields = [
            'id', 'student', 'student_name', 'student_email', 'file',
            'file_name', 'file_size_kb', 'file_type', 'extracted_text',
            'uploaded_at', 'analysis'
        ]
        read_only_fields = ['id', 'student', 'extracted_text', 'file_size_kb', 'file_type', 'uploaded_at']


class JobDescriptionMatchSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    student_email = serializers.ReadOnlyField(source='student.email')
    resume_file_name = serializers.ReadOnlyField(source='resume.file_name')

    class Meta:
        model = JobDescriptionMatch
        fields = [
            'id', 'student', 'student_name', 'student_email', 'resume',
            'resume_file_name', 'job_title', 'company_name', 'jd_text',
            'match_score', 'matching_skills', 'missing_skills',
            'recommendations', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'match_score', 'matching_skills', 'missing_skills', 'recommendations', 'created_at']
