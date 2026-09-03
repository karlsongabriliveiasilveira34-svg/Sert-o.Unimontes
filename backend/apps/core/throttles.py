"""
Throttles Customizados para o Django REST Framework.
Responsável: Lucas (Cibersegurança e Banco de Dados)
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, SimpleRateThrottle


class SertaoAnonRateThrottle(AnonRateThrottle):
    """
    Rate limit para usuários não autenticados (IP anônimo).
    Padrão: 60 requisições por minuto.
    """
    scope = "anon"
    rate = "60/min"


class SertaoUserRateThrottle(UserRateThrottle):
    """
    Rate limit para usuários autenticados via token / sessão.
    Padrão: 300 requisições por minuto.
    """
    scope = "user"
    rate = "300/min"


class OrchestratorThrottle(SimpleRateThrottle):
    """
    Rate limit estrito para rotas pesadas de Inteligência Artificial,
    Orquestração Multiagentes MedIA e pipelines de alta computação.
    Padrão: 20 requisições por minuto.
    """
    scope = "orchestrator"
    rate = "20/min"

    def get_cache_key(self, request, view) -> str:
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }
