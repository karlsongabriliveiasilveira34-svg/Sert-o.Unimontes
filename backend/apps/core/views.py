"""
Views de Infraestrutura e Monitoramento de Saúde da API.
"""

from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class HealthCheckView(APIView):
    """
    Endpoint de Health Check para monitoramento e readiness probe.
    Retorna o status do serviço, nome e timestamp ISO-8601.
    """
    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request, *args, **kwargs) -> Response:
        return Response({
            "status": "online",
            "service": "VEREDAS AI - Biodiversidade, Morfologia & Território API",
            "version": "3.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
