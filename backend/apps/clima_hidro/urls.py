from django.urls import path, re_path
from .views import ClimaRecenteView, VeredasListView

urlpatterns = [
    re_path(r"^clima/recente/?$", ClimaRecenteView.as_view(), name="clima-recente"),
    re_path(r"^veredas/?$", VeredasListView.as_view(), name="veredas-list"),
]
