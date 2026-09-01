from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView,
    CurrentUserProfileView, ChangePasswordView,
    AdminStudentViewSet
)

router = DefaultRouter()
router.register(r'admin/students', AdminStudentViewSet, basename='admin-students')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', CurrentUserProfileView.as_view(), name='current_profile'),
    path('auth/profile/update/', CurrentUserProfileView.as_view(), name='update_profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('', include(router.urls)),
]
