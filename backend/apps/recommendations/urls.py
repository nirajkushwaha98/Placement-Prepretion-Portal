from django.urls import path
from .views import StudentRecommendationsView

urlpatterns = [
    path('', StudentRecommendationsView.as_view(), name='recommendations'),
]
