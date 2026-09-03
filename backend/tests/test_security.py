"""
Testes de Cibersegurança, Restrição de Payload de 8 MB e Health Check.
Responsável: Lucas (Cibersegurança e Banco de Dados) & Álvaro
"""

from django.test import TestCase, RequestFactory
from django.http import HttpResponse, JsonResponse
from apps.core.middlewares.payload_limit import MaxPayloadSizeMiddleware, MAX_PAYLOAD_BYTES
from apps.core.throttles import SertaoAnonRateThrottle, SertaoUserRateThrottle, OrchestratorThrottle


class SecurityMiddlewareTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.get_response = lambda req: JsonResponse({"status": "ok"}, status=200)
        self.middleware = MaxPayloadSizeMiddleware(self.get_response)

    def test_payload_under_limit_accepted(self):
        """Requisições com tamanho de payload <= 8 MB devem passar normalmente."""
        request = self.factory.post(
            "/api/chat/message",
            data='{"message": "olá"}',
            content_type="application/json",
            CONTENT_LENGTH=1024,  # 1 KB
        )
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)

    def test_payload_exceeding_8mb_rejected_with_413(self):
        """Requisições com CONTENT_LENGTH > 8 MB devem ser interrompidas com HTTP 413."""
        excess_bytes = MAX_PAYLOAD_BYTES + 1  # 8 MB + 1 byte
        request = self.factory.post(
            "/api/chat/message",
            data="dummy",
            content_type="application/json",
            CONTENT_LENGTH=excess_bytes,
        )
        response = self.middleware(request)
        self.assertEqual(response.status_code, 413)

        # Validação da mensagem JSON estrita do Lucas
        import json
        data = json.loads(response.content.decode("utf-8"))
        self.assertIn("error", data)
        self.assertEqual(
            data["error"],
            "Payload demasiado grande. O limite máximo permitido é de 8 MB.",
        )

    def test_throttling_configuration(self):
        """Verifica taxas configuradas para anônimos, autenticados e orquestrador."""
        anon = SertaoAnonRateThrottle()
        user = SertaoUserRateThrottle()
        orch = OrchestratorThrottle()

        self.assertEqual(anon.rate, "60/min")
        self.assertEqual(user.rate, "300/min")
        self.assertEqual(orch.rate, "20/min")


class HealthCheckTestCase(TestCase):
    def test_health_check_endpoint(self):
        """GET /api/health deve retornar 200 com payload padronizado."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["service"], "VEREDAS AI - Biodiversidade, Morfologia & Território API")
        self.assertEqual(data["version"], "3.0.0")
        self.assertIn("timestamp", data)
