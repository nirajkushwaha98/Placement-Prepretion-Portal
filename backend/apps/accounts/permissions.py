from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    """Allows access only to authenticated students."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')


class IsAdminUserOrReadOnly(BasePermission):
    """Allows read-only access to students, full CRUD to admins."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_portal_admin)


class IsPortalAdmin(BasePermission):
    """Allows access only to portal admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_portal_admin)
