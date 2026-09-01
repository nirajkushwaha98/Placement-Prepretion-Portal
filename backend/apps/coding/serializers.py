from rest_framework import serializers
from .models import CodingProblem, CodingSubmission

class CodingProblemListSerializer(serializers.ModelSerializer):
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    is_solved = serializers.SerializerMethodField()

    class Meta:
        model = CodingProblem
        fields = [
            'id', 'title', 'slug', 'difficulty', 'tags', 'points',
            'submission_count', 'is_solved', 'created_at'
        ]

    def get_is_solved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(student=request.user, status='ACCEPTED').exists()
        return False


class CodingProblemDetailSerializer(serializers.ModelSerializer):
    is_solved = serializers.SerializerMethodField()
    sample_test_cases = serializers.SerializerMethodField()

    class Meta:
        model = CodingProblem
        fields = [
            'id', 'title', 'slug', 'difficulty', 'tags', 'description',
            'input_format', 'output_format', 'constraints',
            'sample_input', 'sample_output', 'sample_explanation',
            'starter_code', 'sample_test_cases', 'points', 'is_solved', 'created_at'
        ]

    def get_is_solved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(student=request.user, status='ACCEPTED').exists()
        return False

    def get_sample_test_cases(self, obj):
        # Only expose non-hidden test cases to students
        return [tc for tc in obj.test_cases if not tc.get('is_hidden', False)]


class CodingProblemAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingProblem
        fields = '__all__'


class CodingSubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.ReadOnlyField(source='problem.title')
    problem_difficulty = serializers.ReadOnlyField(source='problem.difficulty')
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = CodingSubmission
        fields = [
            'id', 'student', 'student_name', 'student_email', 'problem',
            'problem_title', 'problem_difficulty', 'language', 'code',
            'status', 'passed_test_cases', 'total_test_cases',
            'execution_time_ms', 'memory_kb', 'error_message',
            'test_case_results', 'score', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'status', 'passed_test_cases', 'total_test_cases', 'score', 'created_at']
