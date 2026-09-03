"""
Views REST para Busca Vetorial RAG e Roteamento Semântico (José Vitor).
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .vector_store import default_vector_store
from .semantic_router import default_semantic_router
from .serializers import RAGSearchRequestSerializer, SemanticRouteRequestSerializer


class RAGSearchView(APIView):
    """
    POST /api/ia/search/
    Executa busca por similaridade de cossenos com boosting de 1.35x na especialidade.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = RAGSearchRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        query = data["query"]
        target_specialty = data.get("target_specialty") or None
        top_k = data.get("top_k", 3)

        results = default_vector_store.search(
            query=query,
            target_specialty=target_specialty,
            top_k=top_k,
        )

        return Response({
            "query": query,
            "target_specialty": target_specialty,
            "total_found": len(results),
            "results": results,
        })


class SemanticRouteView(APIView):
    """
    POST /api/ia/route/
    Classifica a intenção e define os agentes primário e secundário para a mensagem.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        serializer = SemanticRouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        route_info = default_semantic_router.route(
            message=data["message"],
            chat_history=data.get("history", []),
        )

        # Busca snippets relevantes usando a especialidade detectada
        rag_context = default_vector_store.search(
            query=data["message"],
            target_specialty=route_info["detected_specialty"],
            top_k=3,
        )

        return Response({
            **route_info,
            "rag_context": rag_context,
        })


class RAGStatsView(APIView):
    """
    GET /api/ia/stats/
    Estatísticas do índice vetorial em memória.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        if not default_vector_store.initialized:
            default_vector_store.initialize()

        return Response({
            "initialized": default_vector_store.initialized,
            "total_documents_chunks": len(default_vector_store.documents),
            "vocabulary_size": len(default_vector_store.vocabulary),
            "specialties_indexed": list(set(d.specialty for d in default_vector_store.documents)),
        })
