from django.urls import path, re_path
from .views import RAGSearchView, SemanticRouteView, RAGStatsView

urlpatterns = [
    re_path(r"^search/?$", RAGSearchView.as_view(), name="ia-search"),
    re_path(r"^route/?$", SemanticRouteView.as_view(), name="ia-route"),
    re_path(r"^stats/?$", RAGStatsView.as_view(), name="ia-stats"),
]
