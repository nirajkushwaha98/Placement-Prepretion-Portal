from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import StudentProfile, AdminProfile
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    StudentProfileSerializer, AdminProfileSerializer, ChangePasswordSerializer
)
from .permissions import IsPortalAdmin

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Registration successful. You can now log in.',
            'user': user_data
        }, status=status.HTTP_201_CREATED)


from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data

        # Handle composite name or first/last name
        if 'name' in data and not ('first_name' in data or 'last_name' in data):
            parts = str(data['name']).strip().split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        else:
            if 'first_name' in data:
                user.first_name = data.get('first_name', '').strip()
            if 'last_name' in data:
                user.last_name = data.get('last_name', '').strip()

        if 'phone' in data:
            user.phone = data.get('phone', '').strip()

        # Handle email / login ID change with strict validation & uniqueness check
        if 'email' in data:
            new_email = str(data['email']).strip().lower()
            if new_email and new_email != user.email.lower():
                try:
                    validate_email(new_email)
                except ValidationError:
                    return Response(
                        {'error': 'Please provide a valid email address.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if User.objects.filter(email__iexact=new_email).exclude(id=user.id).exists():
                    return Response(
                        {'error': 'This email is already in use.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.email = new_email
                user.username = new_email

        user.save()

        if user.role == 'STUDENT':
            profile, _ = StudentProfile.objects.get_or_create(user=user)
            profile.college = data.get('college', profile.college)
            profile.degree = data.get('degree', profile.degree)
            profile.branch = data.get('branch', profile.branch)
            if 'graduation_year' in data:
                profile.graduation_year = data.get('graduation_year') or None
            if 'skills' in data:
                profile.skills = data.get('skills', [])
            profile.github_url = data.get('github_url', profile.github_url)
            profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
            profile.bio = data.get('bio', profile.bio)
            profile.save()

        elif user.role == 'ADMIN':
            profile, _ = AdminProfile.objects.get_or_create(user=user)
            profile.department = data.get('department', profile.department)
            profile.designation = data.get('designation', profile.designation)
            profile.save()

        return Response({
            'message': 'Profile updated successfully.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        return self.put(request)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            current_pw = serializer.validated_data.get('current_password') or serializer.validated_data.get('old_password')
            new_pw = serializer.validated_data.get('new_password')

            if not user.check_password(current_pw):
                return Response(
                    {'error': 'Current password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate against Django password strength rules
            try:
                validate_password(new_pw, user=user)
            except ValidationError as e:
                return Response(
                    {'error': list(e.messages)[0]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_pw)
            user.save()
            return Response(
                {'message': 'Password changed successfully.'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminStudentViewSet(viewsets.ModelViewSet):
    """Admin CRUD on students"""
    permission_classes = [IsPortalAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role='STUDENT').order_by('-created_at')
        branch = self.request.query_params.get('branch')
        grad_year = self.request.query_params.get('graduation_year')
        search = self.request.query_params.get('search')
        if branch:
            queryset = queryset.filter(student_profile__branch__icontains=branch)
        if grad_year:
            queryset = queryset.filter(student_profile__graduation_year=grad_year)
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(first_name__icontains=search) | queryset.filter(last_name__icontains=search)
        return queryset
