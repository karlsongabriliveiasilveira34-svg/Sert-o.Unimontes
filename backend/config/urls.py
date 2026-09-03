"""
URL Configuration Central para o Backend Sertão.Unimontes.
Preserva com rigor todas as rotas consumidas pelo front-end React/Vite.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from apps.core.views import HealthCheckView
from apps.chat_territorial.views import BioAgentsListView, LocationsListView

urlpatterns = [
    path("admin/", admin.site.urls),

    # 1. Health Check
    re_path(r"^api/health/?$", HealthCheckView.as_view(), name="api-health"),

    # 2. Agentes de Biodiversidade & Polos Regionais (Rotas consumidas pelo front-end)
    re_path(r"^api/agents/?$", BioAgentsListView.as_view(), name="api-agents"),
    re_path(r"^api/locations/?$", LocationsListView.as_view(), name="api-locations"),

    # 3. Chat Territorial & Biodiversidade
    path("api/chat/", include("apps.chat_territorial.urls")),

    # 4. Pipeline Ambiental & SUDENE-MG (Túlio)
    path("api/ambiental/", include("apps.ambiental.urls")),

    # 5. Dados Climáticos & Recursos Hídricos (Lucas)
    path("api/clima-hidro/", include("apps.clima_hidro.urls")),

    # 6. RAG Vetorial & Roteamento Semântico (José Vitor)
    path("api/ia/", include("apps.ia_rag.urls")),
]
