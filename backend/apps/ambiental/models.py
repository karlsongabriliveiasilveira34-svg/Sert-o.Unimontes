"""
Modelos do Universo SUDENE-MG e Amostra 25 Cidades.
Responsável: Túlio (Geoprocessamento e Dados Ambientais) & Álvaro (Backend Lead)
"""

from django.db import models


class MunicipioSudene(models.Model):
    """
    Universo legal dos 249 municípios de Minas Gerais inseridos na área de
    atuação da SUDENE segundo a Lei Complementar nº 185/2021.
    """
    codigo_ibge = models.CharField(
        max_length=7,
        primary_key=True,
        verbose_name="Código IBGE (7 dígitos)",
        help_text="Exemplo: 3143302 para Montes Claros",
    )
    municipio = models.CharField(
        max_length=150,
        verbose_name="Nome do Município",
        db_index=True,
    )
    uf = models.CharField(
        max_length=2,
        default="MG",
        verbose_name="Unidade Federativa",
    )
    codigo_sudene = models.CharField(
        max_length=10,
        default="1",
        verbose_name="Código SUDENE",
    )
    recorte = models.CharField(
        max_length=150,
        default="Área de atuação da SUDENE",
        verbose_name="Recorte Territorial Legal",
    )
    latitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Latitude (Sede/Centroide)",
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Longitude (Sede/Centroide)",
    )
    area_ibge_km2 = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Área Oficial IBGE (km²)",
    )
    pct_cerrado = models.FloatField(
        default=0.0,
        verbose_name="Percentual Cerrado (%)",
    )
    pct_caatinga = models.FloatField(
        default=0.0,
        verbose_name="Percentual Caatinga (%)",
    )

    class Meta:
        verbose_name = "Município SUDENE-MG"
        verbose_name_plural = "Municípios SUDENE-MG"
        ordering = ["municipio"]

    def __str__(self) -> str:
        return f"{self.municipio} ({self.codigo_ibge}) - {self.uf}"


class Amostra25Cidade(models.Model):
    """
    Subconjunto amostral representativo de 25 municípios (10,04% do universo SUDENE-MG)
    com foco na mesorregião Norte de Minas e transição do semiárido.
    """
    municipio = models.OneToOneField(
        MunicipioSudene,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="amostra_info",
        verbose_name="Município Selecionado",
    )
    ordem_amostral = models.PositiveIntegerField(
        verbose_name="Ordem Amostral (1 a 25)",
        db_index=True,
    )
    cidade_polo = models.BooleanField(
        default=False,
        verbose_name="É Cidade Polo Regional?",
        help_text="True para Montes Claros (Polo Sertão)",
    )
    justificativa_amostral = models.TextField(
        verbose_name="Justificativa Técnica da Seleção Amostral",
    )

    class Meta:
        verbose_name = "Amostra 25 Cidades (Norte de Minas)"
        verbose_name_plural = "Amostra 25 Cidades (Norte de Minas)"
        ordering = ["ordem_amostral"]

    def __str__(self) -> str:
        polo_tag = " [POLO]" if self.cidade_polo else ""
        return f"#{self.ordem_amostral}: {self.municipio.municipio}{polo_tag}"
