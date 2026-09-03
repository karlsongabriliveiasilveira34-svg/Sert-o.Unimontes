from django.urls import path, re_path
from .views import (
    MunicipioSudeneListView,
    Amostra25CidadesListView,
    MatrizDistanciasView,
    TransicaoBiomasView,
    DegradacaoErosaoView,
    SegmentationView,
)

urlpatterns = [
    re_path(r"^sudene/?$", MunicipioSudeneListView.as_view(), name="sudene-list"),
    re_path(r"^amostra-25/?$", Amostra25CidadesListView.as_view(), name="amostra-25-list"),
    re_path(r"^distancias/?$", MatrizDistanciasView.as_view(), name="matriz-distancias"),
    re_path(r"^transicao-biomas/?$", TransicaoBiomasView.as_view(), name="transicao-biomas"),
    re_path(r"^analise-degradacao/?$", DegradacaoErosaoView.as_view(), name="analise-degradacao"),
    re_path(r"^segment/?$", SegmentationView.as_view(), name="segment"),
]


