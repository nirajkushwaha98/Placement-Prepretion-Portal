from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CodingProblem, CodingSubmission
from .serializers import (
    CodingProblemListSerializer, CodingProblemDetailSerializer,
    CodingProblemAdminSerializer, CodingSubmissionSerializer
)
from .services.judge0 import Judge0Service
from apps.accounts.permissions import IsAdminUserOrReadOnly, IsPortalAdmin

class CodingProblemViewSet(viewsets.ModelViewSet):
    queryset = CodingProblem.objects.all().order_by('difficulty', 'id')
    permission_classes = [IsAdminUserOrReadOnly]

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_portal_admin:
            return CodingProblemAdminSerializer
        if self.action == 'retrieve':
            return CodingProblemDetailSerializer
        return CodingProblemListSerializer

    def get_queryset(self):
        queryset = CodingProblem.objects.all().order_by('difficulty', 'id')
        difficulty = self.request.query_params.get('difficulty')
        tag = self.request.query_params.get('tag')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')

        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if tag:
            queryset = queryset.filter(tags__contains=[tag])
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(description__icontains=search)

        if status_filter and self.request.user.is_authenticated:
            if status_filter == 'SOLVED':
                solved_ids = CodingSubmission.objects.filter(
                    student=self.request.user, status='ACCEPTED'
                ).values_list('problem_id', flat=True)
                queryset = queryset.filter(id__in=solved_ids)
            elif status_filter == 'UNSOLVED':
                solved_ids = CodingSubmission.objects.filter(
                    student=self.request.user, status='ACCEPTED'
                ).values_list('problem_id', flat=True)
                queryset = queryset.exclude(id__in=solved_ids)

        return queryset


class RunCodeView(APIView):
    """Runs code against a custom input or the problem's sample test cases."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        custom_input = request.data.get('input', '')
        expected_output = request.data.get('expected_output', '')

        if not code.strip():
            return Response({'error': 'Please provide code to run.'}, status=status.HTTP_400_BAD_REQUEST)

        result = Judge0Service.execute_code(
            source_code=code,
            language=language,
            stdin=custom_input,
            expected_output=expected_output
        )

        return Response(result)


class SubmitCodeView(APIView):
    """Submits code to evaluate against all test cases (sample + hidden) via Judge0."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        problem_id = pk or request.data.get('problem_id')
        try:
            problem = CodingProblem.objects.get(id=problem_id)
        except CodingProblem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=status.HTTP_404_NOT_FOUND)

        code = request.data.get('code', '')
        language = request.data.get('language', 'python')

        if not code.strip():
            return Response({'error': 'Please provide code to submit.'}, status=status.HTTP_400_BAD_REQUEST)

        test_cases = problem.test_cases or []
        if not test_cases:
            # Fallback testcase from sample
            test_cases = [{
                'input': problem.sample_input,
                'output': problem.sample_output,
                'is_hidden': False
            }]

        total_test_cases = len(test_cases)
        passed_test_cases = 0
        overall_status = 'ACCEPTED'
        error_message = ''
        test_results = []
        total_time_ms = 0.0
        max_memory_kb = 0.0

        for idx, tc in enumerate(test_cases):
            tc_input = tc.get('input', '')
            tc_expected = tc.get('output', '').strip()
            is_hidden = tc.get('is_hidden', False)

            exec_result = Judge0Service.execute_code(
                source_code=code,
                language=language,
                stdin=tc_input,
                expected_output=tc_expected
            )

            tc_status = exec_result.get('status', 'ERROR')
            stdout = exec_result.get('stdout', '').strip()
            total_time_ms += exec_result.get('time_ms', 0.0)
            max_memory_kb = max(max_memory_kb, exec_result.get('memory_kb', 0.0))

            # Verify actual vs expected
            if stdout == tc_expected or tc_status == 'ACCEPTED':
                passed = True
                tc_status = 'ACCEPTED'
                passed_test_cases += 1
            else:
                passed = False
                if overall_status == 'ACCEPTED':
                    overall_status = tc_status if tc_status != 'ACCEPTED' else 'WRONG_ANSWER'
                    if not error_message:
                        error_message = exec_result.get('error') or f"Failed on test case {idx + 1}"

            test_results.append({
                'test_case_number': idx + 1,
                'is_hidden': is_hidden,
                'passed': passed,
                'status': tc_status,
                'input': tc_input if not is_hidden else 'Hidden Test Case',
                'expected_output': tc_expected if not is_hidden else 'Hidden',
                'actual_output': stdout if not is_hidden else ('Passed' if passed else 'Failed'),
                'time_ms': exec_result.get('time_ms', 0.0),
                'error': exec_result.get('error', '') if not is_hidden else ''
            })

            # If compilation error, stop running remaining test cases
            if tc_status == 'COMPILATION_ERROR':
                overall_status = 'COMPILATION_ERROR'
                error_message = exec_result.get('error', 'Compilation Error')
                break

        if overall_status == 'ACCEPTED' and passed_test_cases == total_test_cases:
            score = float(problem.points)
        else:
            score = round((passed_test_cases / max(1, total_test_cases)) * float(problem.points), 2)

        submission = CodingSubmission.objects.create(
            student=request.user,
            problem=problem,
            language=language,
            code=code,
            status=overall_status,
            passed_test_cases=passed_test_cases,
            total_test_cases=total_test_cases,
            execution_time_ms=round(total_time_ms / max(1, len(test_results)), 2),
            memory_kb=round(max_memory_kb, 2),
            error_message=error_message,
            test_case_results=test_results,
            score=score
        )

        return Response(CodingSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)


class StudentSubmissionsListView(generics.ListAPIView):
    serializer_class = CodingSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CodingSubmission.objects.filter(student=self.request.user).order_by('-created_at')
        problem_id = self.request.query_params.get('problem_id')
        if problem_id:
            queryset = queryset.filter(problem_id=problem_id)
        return queryset


class SubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = CodingSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_portal_admin:
            return CodingSubmission.objects.all()
        return CodingSubmission.objects.filter(student=self.request.user)
