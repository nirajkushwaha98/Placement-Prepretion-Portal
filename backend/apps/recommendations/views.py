from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services.recommender import RecommendationEngine

class StudentRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = RecommendationEngine.get_recommendations_and_analytics(request.user)
        return Response(data)
