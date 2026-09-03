"""
Views REST para a App Clima & Hidrologia (Lucas).
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import EstacaoClimatica, RegistroClimatico, Vereda
from .serializers import RegistroClimaticoSerializer, VeredaSerializer


class ClimaRecenteView(APIView):
    """
    GET /api/clima-hidro/clima/recente/
    Retorna as medições meteorológicas mais recentes das estações do Norte de Minas.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        # Obter o registro mais recente de cada estação
        estacoes = EstacaoClimatica.objects.select_related("municipio").all()
        recentes = []

        for estacao in estacoes:
            ultimo = estacao.registros.order_by("-data_hora").first()
            if ultimo:
                recentes.append(ultimo)

        serializer = RegistroClimaticoSerializer(recentes, many=True)
        return Response({
            "total_estacoes": estacoes.count(),
            "telemetria": serializer.data,
        })


class VeredasListView(APIView):
    """
    GET /api/clima-hidro/veredas/
    Lista as veredas catalogadas com status de conservação e vazão média.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        veredas = Vereda.objects.select_related("bacia", "municipio").all()
        status_filter = request.query_params.get("status")
        if status_filter:
            veredas = veredas.filter(status_conservacao__iexact=status_filter)

        serializer = VeredaSerializer(veredas, many=True)
        return Response({
            "count": veredas.count(),
            "results": serializer.data,
        })
