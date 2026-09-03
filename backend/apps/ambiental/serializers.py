"""
Serializers para os Modelos e Endpoints da App Ambiental.
"""

from rest_framework import serializers
from .models import MunicipioSudene, Amostra25Cidade


class MunicipioSudeneSerializer(serializers.ModelSerializer):
    class Meta:
        model = MunicipioSudene
        fields = [
            "codigo_ibge",
            "municipio",
            "uf",
            "codigo_sudene",
            "recorte",
            "latitude",
            "longitude",
            "area_ibge_km2",
            "pct_cerrado",
            "pct_caatinga",
        ]


class Amostra25CidadeSerializer(serializers.ModelSerializer):
    municipio_detalhes = MunicipioSudeneSerializer(source="municipio", read_only=True)

    class Meta:
        model = Amostra25Cidade
        fields = [
            "ordem_amostral",
            "cidade_polo",
            "justificativa_amostral",
            "municipio_detalhes",
        ]


class DistanciaRequestSerializer(serializers.Serializer):
    """
    Aceita ou código IBGE de origem com lista de códigos de destino,
    ou coordenadas [lat, lng] diretas.
    """
    cidade_origem_ibge = serializers.CharField(max_length=7, required=False)
    destinos_ibge = serializers.ListField(
        child=serializers.CharField(max_length=7),
        required=False,
    )
    origem = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        required=False,
        help_text="[latitude, longitude]",
    )
    destinos = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text="Lista de objetos com latitude e longitude (e opcionalmente nome)",
    )

    def validate(self, attrs):
        has_ibge = "cidade_origem_ibge" in attrs
        has_coords = "origem" in attrs

        if not has_ibge and not has_coords:
            raise serializers.ValidationError(
                "É obrigatório informar 'cidade_origem_ibge' ou coordenadas de 'origem'."
            )
        return attrs
