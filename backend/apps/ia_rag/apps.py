from django.apps import AppConfig


class IaRagConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ia_rag"
    verbose_name = "IA & RAG Vetorial"

    def ready(self):
        # Inicializa o VectorStore no startup
        try:
            from .vector_store import default_vector_store
            default_vector_store.initialize()
        except Exception:
            pass
