"""
Testes do Chat Territorial de Biodiversidade, Polos Tecnológicos e Histórico.
"""

from django.test import TestCase
from apps.chat_territorial.tech_hubs import TECH_HUBS, get_nearest_hub, get_hub_by_id
from apps.chat_territorial.bio_agents import BIO_AGENTS


class ChatTerritorialTestCase(TestCase):
    def test_tech_hubs_and_nearest(self):
        """Verifica os 6 polos e busca do polo mais próximo pela Lei dos Cossenos."""
        self.assertEqual(len(TECH_HUBS), 6)
        hub_ids = [h["id"] for h in TECH_HUBS]
        self.assertIn("unimontes-mg", hub_ids)
        self.assertIn("bh-mg", hub_ids)
        self.assertIn("sp", hub_ids)
        self.assertIn("rj", hub_ids)
        self.assertIn("recife-pe", hub_ids)
        self.assertIn("florianopolis-sc", hub_ids)

        # Próximo a Montes Claros (-16.72, -43.85) deve ser unimontes-mg
        nearest_moc = get_nearest_hub(-16.73, -43.86)
        self.assertEqual(nearest_moc["id"], "unimontes-mg")

        # Próximo a Belo Horizonte (-19.92, -43.93) deve ser bh-mg
        nearest_bh = get_nearest_hub(-19.90, -43.95)
        self.assertEqual(nearest_bh["id"], "bh-mg")

    def test_get_agents_endpoint(self):
        """GET /api/agents deve retornar os 4 agentes de biodiversidade."""
        response = self.client.get("/api/agents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 4)
        agent_names = [a["name"] for a in data]
        self.assertIn("flora-agent", agent_names)
        self.assertIn("fauna-agent", agent_names)
        self.assertIn("hydrology-agent", agent_names)
        self.assertIn("ecology-agent", agent_names)

    def test_get_locations_endpoint(self):
        """GET /api/locations deve retornar os 6 polos tecnológicos."""
        response = self.client.get("/api/locations")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 6)

    def test_chat_message_ipe_amarelo(self):
        """POST /api/chat/message com 'ipê' deve responder com diagnose do Handroanthus chrysotrichus."""
        payload = {
            "message": "Fale sobre o ipê-amarelo e a flora do cerrado",
            "sessionId": "test-session-ipe",
        }
        response = self.client.post(
            "/api/chat/message",
            data=payload,
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["sessionId"], "test-session-ipe")

        msg = data["message"]
        self.assertEqual(msg["role"], "assistant")
        self.assertIn("Ipê-amarelo do Cerrado", msg["title"])
        self.assertEqual(msg["scientificName"], "Handroanthus chrysotrichus (Mart. ex DC.) Mattos")
        self.assertEqual(msg["family"], "Bignoniaceae")
        self.assertIn("morphology", msg)
        self.assertIn("leaves", msg["morphology"])
        self.assertIn("bark", msg["morphology"])
        self.assertIn("flowers", msg["morphology"])
        self.assertIn("adaptation", msg["morphology"])
        self.assertIn("ecologicalNote", msg)
        self.assertIn("sources", msg)

    def test_chat_message_lobo_guara(self):
        """POST /api/chat/message com 'lobo-guará' deve responder com ecologia do Chrysocyon brachyurus."""
        payload = {
            "message": "Qual é o papel ecológico do lobo-guará na fauna?",
            "sessionId": "test-session-lobo",
        }
        response = self.client.post(
            "/api/chat/message",
            data=payload,
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        msg = data["message"]
        self.assertIn("Lobo-guará", msg["title"])
        self.assertEqual(msg["scientificName"], "Chrysocyon brachyurus")
        self.assertEqual(msg["family"], "Canidae")
        self.assertIn("lobeira", msg["morphology"]["adaptation"].lower())

    def test_chat_history_and_location_update(self):
        """POST de mensagens e recuperação de histórico via GET /api/chat/history/<sessionId>."""
        session_id = "test-session-history-123"
        self.client.post(
            "/api/chat/message",
            data={"message": "Olá Veredas", "sessionId": session_id},
            content_type="application/json",
        )

        hist_resp = self.client.get(f"/api/chat/history/{session_id}")
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        self.assertGreaterEqual(len(history), 2)  # Mensagem de user + resposta assistant

        # Atualização de localização
        loc_resp = self.client.post(
            "/api/chat/location",
            data={"sessionId": session_id, "location": {"city": "Belo Horizonte", "lat": -19.91, "lng": -43.93}},
            content_type="application/json",
        )
        self.assertEqual(loc_resp.status_code, 200)
        self.assertEqual(loc_resp.json()["location"]["city"], "Belo Horizonte")
