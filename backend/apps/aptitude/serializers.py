from rest_framework import serializers
from .models import AptitudeCategory, AptitudeQuestion, AptitudeTest, TestAttempt, TestAnswer

class AptitudeCategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    test_count = serializers.IntegerField(source='tests.count', read_only=True)

    class Meta:
        model = AptitudeCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'question_count', 'test_count']


class AptitudeQuestionAdminSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = AptitudeQuestion
        fields = [
            'id', 'category', 'category_name', 'topic', 'question_text',
            'options', 'correct_option_index', 'explanation',
            'difficulty', 'marks', 'negative_marks', 'created_at', 'updated_at'
        ]


class AptitudeQuestionStudentSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = AptitudeQuestion
        fields = [
            'id', 'category', 'category_name', 'topic', 'question_text',
            'options', 'difficulty', 'marks'
        ]


class TestAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.question_text')
    options = serializers.ReadOnlyField(source='question.options')
    correct_option_index = serializers.ReadOnlyField(source='question.correct_option_index')
    explanation = serializers.ReadOnlyField(source='question.explanation')
    topic = serializers.ReadOnlyField(source='question.topic')
    category_name = serializers.ReadOnlyField(source='question.category.name')

    class Meta:
        model = TestAnswer
        fields = [
            'id', 'question', 'question_text', 'options', 'correct_option_index',
            'selected_option_index', 'is_correct', 'explanation', 'topic',
            'category_name', 'time_spent_seconds'
        ]


class AptitudeTestSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    questions = AptitudeQuestionStudentSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = AptitudeTest
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'difficulty', 'duration_minutes', 'total_questions', 'passing_percentage',
            'question_count', 'questions', 'is_active', 'created_at'
        ]


class AptitudeTestAdminSerializer(serializers.ModelSerializer):
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=AptitudeQuestion.objects.all(),
        many=True,
        write_only=True,
        source='questions',
        required=False
    )
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = AptitudeTest
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'difficulty', 'duration_minutes', 'total_questions', 'passing_percentage',
            'question_ids', 'questions', 'is_active', 'created_at'
        ]


class TestAttemptSerializer(serializers.ModelSerializer):
    answers = TestAnswerSerializer(many=True, read_only=True)
    test_title = serializers.ReadOnlyField(source='test.title')
    category_name = serializers.ReadOnlyField(source='category.name')
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = TestAttempt
        fields = [
            'id', 'student', 'student_name', 'student_email', 'test', 'test_title',
            'category', 'category_name', 'score', 'total_marks', 'percentage',
            'correct_count', 'incorrect_count', 'unattempted_count',
            'time_taken_seconds', 'feedback_summary', 'topic_breakdown',
            'created_at', 'answers'
        ]
