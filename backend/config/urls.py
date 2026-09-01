from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.accounts.urls')),
    path('api/aptitude/', include('apps.aptitude.urls')),
    path('api/coding/', include('apps.coding.urls')),
    path('api/resume/', include('apps.resume.urls')),
    path('api/interview/', include('apps.interview.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
