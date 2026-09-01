from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import StudentProfile, AdminProfile

User = get_user_model()

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'college', 'degree', 'branch', 'graduation_year',
            'profile_photo', 'skills', 'github_url', 'linkedin_url',
            'bio', 'created_at', 'updated_at'
        ]


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['id', 'department', 'designation', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    student_profile = StudentProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'name',
            'role', 'phone', 'is_active', 'created_at', 'updated_at',
            'student_profile', 'admin_profile'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    college = serializers.CharField(required=False, allow_blank=True, default='')
    degree = serializers.CharField(required=False, allow_blank=True, default='')
    branch = serializers.CharField(required=False, allow_blank=True, default='')
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='STUDENT')

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password',
            'role', 'phone', 'college', 'degree', 'branch', 'graduation_year'
        ]

    def validate(self, attrs):
        if not attrs.get('username'):
            attrs['username'] = attrs.get('email', '')
        return attrs

    def create(self, validated_data):
        college = validated_data.pop('college', '')
        degree = validated_data.pop('degree', '')
        branch = validated_data.pop('branch', '')
        graduation_year = validated_data.pop('graduation_year', None)
        password = validated_data.pop('password')
        role = validated_data.get('role', 'STUDENT')
        username = validated_data.get('username') or validated_data['email']

        user = User.objects.create_user(
            email=validated_data['email'],
            username=username,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=role,
            password=password
        )

        if role == 'STUDENT':
            StudentProfile.objects.create(
                user=user,
                college=college,
                degree=degree,
                branch=branch,
                graduation_year=graduation_year
            )
        elif role == 'ADMIN':
            AdminProfile.objects.create(user=user)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['name'] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'name': user.get_full_name() or user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            student_data = StudentProfileSerializer(user.student_profile).data
            data['user']['profile'] = student_data
            data['user']['student_profile'] = student_data
        elif user.role == 'ADMIN' and hasattr(user, 'admin_profile'):
            admin_data = AdminProfileSerializer(user.admin_profile).data
            data['user']['profile'] = admin_data
            data['user']['admin_profile'] = admin_data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=False, allow_blank=True)
    old_password = serializers.CharField(required=False, allow_blank=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate(self, attrs):
        if not attrs.get('current_password') and not attrs.get('old_password'):
            raise serializers.ValidationError({'current_password': 'This field is required.'})
        return attrs
