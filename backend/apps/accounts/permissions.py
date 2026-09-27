from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsStudent(BasePermission):
    """Allows access only to authenticated students."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')


class IsAdminUserOrReadOnly(BasePermission):
    """Allows read-only access to all users, full CRUD to admins."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_portal_admin)


class IsPortalAdmin(BasePermission):
    """Allows access only to portal admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_portal_admin)
