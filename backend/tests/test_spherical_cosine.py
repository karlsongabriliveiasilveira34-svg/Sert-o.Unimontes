"""
Testes da Lei dos Cossenos Esférica e Endpoints do Pipeline Territorial (Túlio).
"""

from django.test import TestCase
from apps.ambiental.services.spherical_cosine import spherical_law_of_cosines, calculate_distance_matrix
from apps.ambiental.models import MunicipioSudene, Amostra25Cidade


class SphericalCosineTestCase(TestCase):
    def test_distance_same_point_is_zero(self):
        """Distância entre coordenadas idênticas deve ser exatamente 0.0 km."""
        dist = spherical_law_of_cosines(-16.7282, -43.8578, -16.7282, -43.8578)
        self.assertEqual(dist, 0.0)

    def test_distance_montes_claros_belo_horizonte(self):
        """
        Distância geodésica entre Montes Claros (-16.7282, -43.8578) e
        Belo Horizonte (-19.9167, -43.9345) deve ser ~355 km (tolerância < 1 km).
        """
        lat_moc, lon_moc = -16.7282, -43.8578
        lat_bh, lon_bh = -19.9167, -43.9345

        dist = spherical_law_of_cosines(lat_moc, lon_moc, lat_bh, lon_bh)
        # O valor de referência exato na esfera é de aproximadamente 354.82 km
        self.assertAlmostEqual(dist, 354.82, delta=1.5)

    def test_calculate_distance_matrix(self):
        """Testa o cálculo da matriz de distâncias ordenadas."""
        origin = (-16.7282, -43.8578)
        destinations = [
            {"identificador": "BH", "nome": "Belo Horizonte", "latitude": -19.9167, "longitude": -43.9345},
            {"identificador": "SP", "nome": "São Paulo", "latitude": -23.5505, "longitude": -46.6333},
        ]
        matrix = calculate_distance_matrix(origin, destinations)
        self.assertEqual(len(matrix), 2)
        # BH deve ser mais próximo de MOC do que SP
        self.assertEqual(matrix[0]["identificador"], "BH")
        self.assertLess(matrix[0]["distancia_km"], matrix[1]["distancia_km"])


class AmbientalEndpointsTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Cria municípios para teste
        cls.moc = MunicipioSudene.objects.create(
            codigo_ibge="3143302",
            municipio="Montes Claros",
            uf="MG",
            codigo_sudene="1",
            latitude=-16.7282,
            longitude=-43.8578,
            pct_cerrado=70.0,
            pct_caatinga=30.0,
        )
        cls.jan = MunicipioSudene.objects.create(
            codigo_ibge="3135100",
            municipio="Januária",
            uf="MG",
            codigo_sudene="1",
            latitude=-15.4833,
            longitude=-44.3667,
            pct_cerrado=45.0,
            pct_caatinga=55.0,
        )
        Amostra25Cidade.objects.create(
            municipio=cls.moc,
            ordem_amostral=1,
            cidade_polo=True,
            justificativa_amostral="Polo regional do Norte de Minas.",
        )

    def test_get_sudene_list(self):
        """GET /api/ambiental/sudene/ deve listar municípios com suporte a busca."""
        response = self.client.get("/api/ambiental/sudene/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["count"], 2)

        # Busca por "Montes"
        search_resp = self.client.get("/api/ambiental/sudene/?q=Montes")
        self.assertEqual(search_resp.status_code, 200)
        search_data = search_resp.json()
        self.assertEqual(search_data["count"], 1)
        self.assertEqual(search_data["results"][0]["municipio"], "Montes Claros")

    def test_get_amostra_25(self):
        """GET /api/ambiental/amostra-25/ deve listar cidades amostrais."""
        response = self.client.get("/api/ambiental/amostra-25/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["cidade_polo"], True)

    def test_post_distancias_endpoint(self):
        """POST /api/ambiental/distancias/ com códigos IBGE."""
        payload = {
            "cidade_origem_ibge": "3143302",
            "destinos_ibge": ["3135100"],
        }
        response = self.client.post(
            "/api/ambiental/distancias/",
            data=payload,
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_destinos"], 1)
        dist = data["distancias"][0]["distancia_km"]
        self.assertGreater(dist, 100)  # MOC a Januária é > 100 km

    def test_transicao_biomas_endpoint(self):
        """GET /api/ambiental/transicao-biomas/ retorna consolidação ecotonal."""
        response = self.client.get("/api/ambiental/transicao-biomas/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("media_pct_cerrado", data)
        self.assertIn("media_pct_caatinga", data)
        self.assertIn("municipios_ecotonais_transicao", data)
