"""
Modelos de Dados Climáticos, Recursos Hídricos e Veredas.
Responsável: Lucas (Cibersegurança e Banco de Dados)
"""

from django.db import models
from apps.ambiental.models import MunicipioSudene


class EstacaoClimatica(models.Model):
    """
    Estações meteorológicas automáticas e convencionais instaladas na região.
    """
    codigo_estacao = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Código da Estação (ex: INMET A514)",
    )
    municipio = models.ForeignKey(
        MunicipioSudene,
        on_delete=models.CASCADE,
        related_name="estacoes_climaticas",
        verbose_name="Município Sede",
    )
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    altitude_metros = models.FloatField(
        default=600.0,
        verbose_name="Altitude (metros)",
    )

    class Meta:
        verbose_name = "Estação Climática"
        verbose_name_plural = "Estações Climáticas"

    def __str__(self) -> str:
        return f"{self.codigo_estacao} - {self.municipio.municipio}"


class RegistroClimatico(models.Model):
    """
    Série temporal de medições meteorológicas coletadas por estações.
    """
    estacao = models.ForeignKey(
        EstacaoClimatica,
        on_delete=models.CASCADE,
        related_name="registros",
        verbose_name="Estação de Coleta",
    )
    data_hora = models.DateTimeField(verbose_name="Data e Hora da Medição", db_index=True)
    temperatura_celsius = models.FloatField(verbose_name="Temperatura (°C)")
    umidade_relativa_pct = models.FloatField(verbose_name="Umidade Relativa (%)")
    precipitacao_mm = models.FloatField(default=0.0, verbose_name="Precipitação (mm)")
    radiacao_solar_w_m2 = models.FloatField(default=0.0, verbose_name="Radiação Solar (W/m²)")
    velocidade_vento_ms = models.FloatField(default=0.0, verbose_name="Velocidade do Vento (m/s)")

    class Meta:
        verbose_name = "Registro Climático"
        verbose_name_plural = "Registros Climáticos"
        ordering = ["-data_hora"]

    def __str__(self) -> str:
        return f"[{self.data_hora}] {self.estacao.codigo_estacao}: {self.temperatura_celsius}°C"


class BaciaHidrografica(models.Model):
    """
    Macro e microbacias hidrográficas do Norte de Minas e do Semiárido.
    """
    nome = models.CharField(
        max_length=150,
        verbose_name="Nome da Bacia (ex: Bacia do Rio Verde Grande)",
    )
    codigo_bacia = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="Código Oficial da Bacia",
    )

    class Meta:
        verbose_name = "Bacia Hidrográfica"
        verbose_name_plural = "Bacias Hidrográficas"

    def __str__(self) -> str:
        return f"{self.nome} ({self.codigo_bacia})"


class Vereda(models.Model):
    """
    Complexos de veredas (oásis do Cerrado) catalogadas e monitoradas.
    """
    STATUS_CHOICES = [
        ("Preservada", "Preservada"),
        ("Recuperação", "Em Recuperação"),
        ("Antropizada", "Antropizada / Degradada"),
    ]

    nome = models.CharField(max_length=150, verbose_name="Nome da Vereda")
    bacia = models.ForeignKey(
        BaciaHidrografica,
        on_delete=models.CASCADE,
        related_name="veredas",
        verbose_name="Bacia Hidrográfica",
    )
    municipio = models.ForeignKey(
        MunicipioSudene,
        on_delete=models.CASCADE,
        related_name="veredas",
        verbose_name="Município",
    )
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    status_conservacao = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Preservada",
        verbose_name="Status de Conservação",
    )
    vazao_media_ls = models.FloatField(
        default=15.0,
        verbose_name="Vazão Média (L/s)",
    )

    class Meta:
        verbose_name = "Vereda"
        verbose_name_plural = "Veredas"

    def __str__(self) -> str:
        return f"{self.nome} ({self.municipio.municipio}) - {self.status_conservacao}"
