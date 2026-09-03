"""
Testes do Motor Vetorial RAG, TF-IDF, Similaridade Cosseno e Roteador Semântico (José Vitor).
"""

from django.test import TestCase
from apps.ia_rag.vector_store import VectorStore, DocumentChunk
from apps.ia_rag.semantic_router import SemanticRouter


class VectorStoreTestCase(TestCase):
    def setUp(self):
        self.store = VectorStore()
        # Injetar documentos sintéticos de teste para validação isolada
        chunk_react = DocumentChunk(
            chunk_id="test-react-1",
            source="react.md",
            specialty="react",
            content="## React Hooks\nUtilize useMemo e useCallback para otimizar renderizações em componentes complexos.",
            tokens=["react", "hooks", "utilize", "usememo", "usecallback", "otimizar", "renderizacoes", "componentes", "complexos"],
        )
        chunk_css = DocumentChunk(
            chunk_id="test-css-1",
            source="css.md",
            specialty="css",
            content="## Layout CSS Grid\nO CSS Grid layout permite estruturar interfaces bidimensionais responsivas com facilidade.",
            tokens=["layout", "css", "grid", "permite", "estruturar", "interfaces", "bidimensionais", "responsivas", "facilidade"],
        )
        self.store.documents = [chunk_react, chunk_css]
        self.store._build_vocabulary()
        self.store._compute_embeddings()
        self.store.initialized = True

    def test_tokenization_removes_accents(self):
        """Tokenização deve converter para minúsculas e remover acentos."""
        tokens = VectorStore.tokenize("Otimização de Renderização & Acessibilidade!")
        self.assertIn("otimizacao", tokens)
        self.assertIn("renderizacao", tokens)
        self.assertIn("acessibilidade", tokens)

    def test_search_similarity(self):
        """Busca por 'renderizacoes' deve trazer o documento de react com score positivo."""
        results = self.store.search("renderizacoes componentes", top_k=2)
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0]["specialty"], "react")
        self.assertGreater(results[0]["score"], 0.0)

    def test_specialty_boosting_135x(self):
        """
        Garante que quando 'target_specialty' é fornecido e coincide com a especialidade
        do documento, o score é multiplicado por 1.35x.
        """
        score_without_boost = self.store.search("componentes", target_specialty=None, top_k=1)[0]["score"]
        score_with_boost = self.store.search("componentes", target_specialty="react", top_k=1)[0]["score"]

        # score com boost deve ser exatamente score_sem_boost * 1.35 (dentro de arredondamento)
        self.assertAlmostEqual(score_with_boost, score_without_boost * 1.35, places=3)


class SemanticRouterTestCase(TestCase):
    def setUp(self):
        self.router = SemanticRouter()

    def test_intent_classification(self):
        """Classificação de intenções clássicas."""
        self.assertEqual(self.router.analyze_intent("Como utilizar o hook useEffect?"), "learning")
        self.assertEqual(self.router.analyze_intent("Como otimizar a velocidade e reduzir o LCP?"), "optimization")
        self.assertEqual(self.router.analyze_intent("Apareceu um erro de sintaxe e o app quebrou."), "bug-fix")
        self.assertEqual(self.router.analyze_intent("Qual é a melhor arquitetura de componentes?"), "architecture")
        self.assertEqual(self.router.analyze_intent("Boa tarde time Sertão!"), "general-consultation")

    def test_specialty_detection(self):
        """Detecção de especialidade pelo vocabulário."""
        self.assertEqual(self.router.detect_specialty("Qual a diferença entre useMemo e useCallback?"), "react")
        self.assertEqual(self.router.detect_specialty("Como centralizar uma div com flexbox e css grid?"), "css")
        self.assertEqual(self.router.detect_specialty("Como configurar tipos genéricos em TypeScript?"), "ts")
        self.assertEqual(self.router.detect_specialty("Como atender às diretrizes WCAG e leitores de tela?"), "a11y")

    def test_secondary_agent_selection(self):
        """Verifica a recomendação colaborativa do agente secundário."""
        route_react_opt = self.router.route("Como otimizar o tempo de renderização do meu componente React?")
        self.assertEqual(route_react_opt["detected_specialty"], "react")
        self.assertEqual(route_react_opt["intent"], "optimization")
        self.assertIsNotNone(route_react_opt["secondary_agent"])
        self.assertEqual(route_react_opt["secondary_agent"]["specialty"], "performance")

        route_css_learn = self.router.route("Como aprender a criar gradientes e estilos no CSS?")
        self.assertEqual(route_css_learn["secondary_agent"]["specialty"], "ui-ux")


class IARAGEndpointsTestCase(TestCase):
    def test_search_endpoint(self):
        """POST /api/ia/search/ deve responder 200 com array de resultados."""
        response = self.client.post(
            "/api/ia/search/",
            data={"query": "react hooks component", "target_specialty": "react", "top_k": 2},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        self.assertIn("total_found", data)

    def test_route_endpoint(self):
        """POST /api/ia/route/ deve classificar intenção e retornar contexto RAG."""
        response = self.client.post(
            "/api/ia/route/",
            data={"message": "Como otimizar o componente React com useMemo e hooks?"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["detected_specialty"], "react")
        self.assertEqual(data["intent"], "optimization")
        self.assertIn("primary_agent", data)
        self.assertIn("rag_context", data)
