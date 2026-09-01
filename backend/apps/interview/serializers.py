from rest_framework import serializers
from .models import InterviewCategory, InterviewQuestion, InterviewAttempt

class InterviewCategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = InterviewCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'question_count']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'category', 'category_name', 'question', 'model_answer',
            'tips', 'key_talking_points', 'difficulty', 'company_tag',
            'created_at', 'updated_at'
        ]


class InterviewAttemptSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.question')
    category_name = serializers.ReadOnlyField(source='question.category.name')
    model_answer = serializers.ReadOnlyField(source='question.model_answer')
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = InterviewAttempt
        fields = [
            'id', 'student', 'student_name', 'student_email', 'question',
            'question_text', 'category_name', 'model_answer', 'student_answer',
            'relevance_score', 'clarity_score', 'technical_score',
            'confidence_score', 'overall_score', 'feedback', 'created_at'
        ]
        read_only_fields = [
            'id', 'student', 'relevance_score', 'clarity_score',
            'technical_score', 'confidence_score', 'overall_score',
            'feedback', 'created_at'
        ]
