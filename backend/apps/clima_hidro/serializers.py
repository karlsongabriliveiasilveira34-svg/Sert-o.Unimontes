"""
Serializers para Dados Climáticos e Hidrológicos.
"""

from rest_framework import serializers
from .models import EstacaoClimatica, RegistroClimatico, BaciaHidrografica, Vereda


class EstacaoClimaticaSerializer(serializers.ModelSerializer):
    municipio_nome = serializers.CharField(source="municipio.municipio", read_only=True)

    class Meta:
        model = EstacaoClimatica
        fields = [
            "codigo_estacao",
            "municipio",
            "municipio_nome",
            "latitude",
            "longitude",
            "altitude_metros",
        ]


class RegistroClimaticoSerializer(serializers.ModelSerializer):
    estacao_codigo = serializers.CharField(source="estacao.codigo_estacao", read_only=True)
    municipio_nome = serializers.CharField(source="estacao.municipio.municipio", read_only=True)

    class Meta:
        model = RegistroClimatico
        fields = [
            "id",
            "estacao",
            "estacao_codigo",
            "municipio_nome",
            "data_hora",
            "temperatura_celsius",
            "umidade_relativa_pct",
            "precipitacao_mm",
            "radiacao_solar_w_m2",
            "velocidade_vento_ms",
        ]


class BaciaHidrograficaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaciaHidrografica
        fields = ["id", "nome", "codigo_bacia"]


class VeredaSerializer(serializers.ModelSerializer):
    bacia_nome = serializers.CharField(source="bacia.nome", read_only=True)
    municipio_nome = serializers.CharField(source="municipio.municipio", read_only=True)

    class Meta:
        model = Vereda
        fields = [
            "id",
            "nome",
            "bacia",
            "bacia_nome",
            "municipio",
            "municipio_nome",
            "latitude",
            "longitude",
            "status_conservacao",
            "vazao_media_ls",
        ]
