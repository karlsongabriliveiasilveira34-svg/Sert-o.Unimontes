"""
Views REST para a App Ambiental (Pipeline Territorial do Túlio).
"""

from typing import Any, Dict, List
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import MunicipioSudene, Amostra25Cidade
from .serializers import (
    MunicipioSudeneSerializer,
    Amostra25CidadeSerializer,
    DistanciaRequestSerializer,
)
from .services.spherical_cosine import spherical_law_of_cosines, calculate_distance_matrix
from .services.biome_service import calculate_biome_statistics


class MunicipioSudeneListView(APIView):
    """
    GET /api/ambiental/sudene/
    Lista os 249 municípios da SUDENE-MG com suporte a filtro de busca por nome ou código IBGE.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        queryset = MunicipioSudene.objects.all()
        query = request.query_params.get("search") or request.query_params.get("q")
        if query:
            queryset = queryset.filter(
                Q(municipio__icontains=query) | Q(codigo_ibge__icontains=query)
            )

        serializer = MunicipioSudeneSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "universo": "SUDENE-MG 2021 (Lei Complementar nº 185/2021)",
            "results": serializer.data,
        })


class Amostra25CidadesListView(APIView):
    """
    GET /api/ambiental/amostra-25/
    Lista as 25 cidades selecionadas do Norte de Minas (10,04% do universo SUDENE-MG).
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        amostra = Amostra25Cidade.objects.select_related("municipio").order_by("ordem_amostral")
        serializer = Amostra25CidadeSerializer(amostra, many=True)
        return Response({
            "count": amostra.count(),
            "amostra_proporcao": "10.04% (25 de 249 municípios)",
            "cidade_polo": "Montes Claros (3143302)",
            "results": serializer.data,
        })


class MatrizDistanciasView(APIView):
    """
    POST /api/ambiental/distancias/
    Calcula distâncias geodésicas exatas utilizando a Lei dos Cossenos Esférica.
    Suporta resolução por códigos IBGE ou por coordenadas diretas [lat, lon].
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = DistanciaRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        origin_coords = None
        origin_name = ""

        # 1. Resolução da Origem
        if "cidade_origem_ibge" in data:
            ibge_origem = data["cidade_origem_ibge"]
            try:
                mun_origem = MunicipioSudene.objects.get(codigo_ibge=ibge_origem)
                if mun_origem.latitude is None or mun_origem.longitude is None:
                    return Response(
                        {"error": f"Município de origem {ibge_origem} sem coordenadas cadastradas."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                origin_coords = (mun_origem.latitude, mun_origem.longitude)
                origin_name = f"{mun_origem.municipio} ({mun_origem.codigo_ibge})"
            except MunicipioSudene.DoesNotExist:
                return Response(
                    {"error": f"Município de origem {ibge_origem} não encontrado na base SUDENE."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            origin_coords = (data["origem"][0], data["origem"][1])
            origin_name = f"Coordenadas [{origin_coords[0]}, {origin_coords[1]}]"

        # 2. Resolução dos Destinos
        destinations = []
        if "destinos_ibge" in data:
            ibge_list = data["destinos_ibge"]
            muns = MunicipioSudene.objects.filter(codigo_ibge__in=ibge_list)
            for m in muns:
                if m.latitude is not None and m.longitude is not None:
                    destinations.append({
                        "identificador": m.codigo_ibge,
                        "nome": m.municipio,
                        "latitude": m.latitude,
                        "longitude": m.longitude,
                    })
        elif "destinos" in data:
            for idx, d in enumerate(data["destinos"]):
                destinations.append({
                    "identificador": str(d.get("id", idx)),
                    "nome": d.get("nome", f"Destino {idx + 1}"),
                    "latitude": float(d["latitude"]),
                    "longitude": float(d["longitude"]),
                })
        else:
            # Padrão: calcular distância para as 25 cidades da amostra
            amostra = Amostra25Cidade.objects.select_related("municipio").all()
            for item in amostra:
                m = item.municipio
                if m.latitude is not None and m.longitude is not None:
                    destinations.append({
                        "identificador": m.codigo_ibge,
                        "nome": m.municipio,
                        "latitude": m.latitude,
                        "longitude": m.longitude,
                    })

        # 3. Execução do Cálculo Geodésico
        dist_matrix = calculate_distance_matrix(origin_coords, destinations)

        return Response({
            "metodo": "Lei dos Cossenos Esférica (R = 6371.0088 km)",
            "origem": {
                "descricao": origin_name,
                "latitude": origin_coords[0],
                "longitude": origin_coords[1],
            },
            "total_destinos": len(dist_matrix),
            "distancias": dist_matrix,
        })


class TransicaoBiomasView(APIView):
    """
    GET /api/ambiental/transicao-biomas/
    Estatísticas consolidadas da transição ecotonal Cerrado-Caatinga.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        municipios = list(MunicipioSudene.objects.values(
            "codigo_ibge", "municipio", "pct_cerrado", "pct_caatinga"
        ))
        stats = calculate_biome_statistics(municipios)
        return Response(stats)
