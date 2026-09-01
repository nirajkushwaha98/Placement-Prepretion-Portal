import os
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Resume, ResumeAnalysis, JobDescriptionMatch
from .serializers import ResumeSerializer, ResumeAnalysisSerializer, JobDescriptionMatchSerializer
from .services.parser import ResumeTextExtractor
from .services.nlp_engine import ResumeAnalyzerNLP
from .services.job_matcher import JobDescriptionMatcher
from apps.accounts.permissions import IsPortalAdmin

class ResumeUploadAndAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        raw_text = request.data.get('raw_text', '')

        if not file_obj and not raw_text.strip():
            return Response({'error': 'Please upload a PDF/DOCX resume file or provide resume text.'}, status=status.HTTP_400_BAD_REQUEST)

        # File validation
        file_name = file_obj.name if file_obj else 'pasted_resume.txt'
        file_size_kb = (file_obj.size / 1024.0) if file_obj else 0.0

        if file_obj:
            ext = os.path.splitext(file_name)[1].lower()
            if ext not in ('.pdf', '.docx', '.doc', '.txt'):
                return Response({'error': 'Unsupported file format. Please upload PDF or DOCX.'}, status=status.HTTP_400_BAD_REQUEST)
            if file_obj.size > 10 * 1024 * 1024:  # 10 MB limit
                return Response({'error': 'File size exceeds the 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

            extracted_text = ResumeTextExtractor.extract_text(file_obj, file_name)
        else:
            extracted_text = raw_text

        if not extracted_text or len(extracted_text.strip()) < 10:
            extracted_text = "Resume uploaded with standard template layout."

        # Run NLP Analysis
        nlp_result = ResumeAnalyzerNLP.analyze(extracted_text)

        # Save Resume & Analysis
        resume = Resume.objects.create(
            student=request.user,
            file=file_obj if file_obj else None,
            file_name=file_name,
            file_size_kb=round(file_size_kb, 1),
            file_type=file_obj.content_type if file_obj and hasattr(file_obj, 'content_type') else 'application/pdf',
            extracted_text=extracted_text
        )

        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            student=request.user,
            overall_score=nlp_result['overall_score'],
            category_scores=nlp_result['category_scores'],
            extracted_info=nlp_result['extracted_info'],
            strengths=nlp_result['strengths'],
            weaknesses=nlp_result['weaknesses'],
            suggestions=nlp_result['suggestions']
        )

        # Update student profile skills if empty
        if hasattr(request.user, 'student_profile') and not request.user.student_profile.skills:
            extracted_skills = nlp_result['extracted_info'].get('skills', [])
            if extracted_skills:
                request.user.student_profile.skills = extracted_skills[:12]
                request.user.student_profile.save()

        return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


class StudentResumeHistoryView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(student=self.request.user).select_related('analysis').order_by('-uploaded_at')


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_portal_admin:
            return Resume.objects.all().select_related('analysis')
        return Resume.objects.filter(student=self.request.user).select_related('analysis')


class JobMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        resume_id = request.data.get('resume_id')
        jd_text = request.data.get('jd_text', '').strip()
        job_title = request.data.get('job_title', 'Target Role')
        company_name = request.data.get('company_name', '')

        if not jd_text:
            return Response({'error': 'Please provide a job description.'}, status=status.HTTP_400_BAD_REQUEST)

        resume = None
        resume_text = ""
        resume_skills = []

        if resume_id:
            try:
                resume = Resume.objects.get(id=resume_id, student=request.user)
                resume_text = resume.extracted_text
                if hasattr(resume, 'analysis'):
                    resume_skills = resume.analysis.extracted_info.get('skills', [])
            except Resume.DoesNotExist:
                return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Pick latest uploaded resume for student if available
            resume = Resume.objects.filter(student=request.user).order_by('-uploaded_at').first()
            if resume:
                resume_text = resume.extracted_text
                if hasattr(resume, 'analysis'):
                    resume_skills = resume.analysis.extracted_info.get('skills', [])
            else:
                # Use profile skills if available
                if hasattr(request.user, 'student_profile'):
                    resume_skills = request.user.student_profile.skills or []
                    resume_text = " ".join(resume_skills)

        if not resume_text:
            return Response({'error': 'Please upload a resume first before running job description matching.'}, status=status.HTTP_400_BAD_REQUEST)

        match_result = JobDescriptionMatcher.match(
            resume_text=resume_text,
            jd_text=jd_text,
            resume_skills=resume_skills
        )

        match_record = JobDescriptionMatch.objects.create(
            student=request.user,
            resume=resume,
            job_title=job_title,
            company_name=company_name,
            jd_text=jd_text,
            match_score=match_result['match_score'],
            matching_skills=match_result['matching_skills'],
            missing_skills=match_result['missing_skills'],
            recommendations=match_result['recommendations']
        )

        return Response(JobDescriptionMatchSerializer(match_record).data, status=status.HTTP_201_CREATED)


class StudentJobMatchHistoryView(generics.ListAPIView):
    serializer_class = JobDescriptionMatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobDescriptionMatch.objects.filter(student=self.request.user).order_by('-created_at')
