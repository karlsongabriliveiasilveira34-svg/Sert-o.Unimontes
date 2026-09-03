"""
Views REST para o Chat Territorial, Biodiversidade e Polos Tecnológicos.
Compatibilidade total com o Front-End React/Vite de Karlson.
"""

import time
from datetime import datetime, timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .tech_hubs import TECH_HUBS, get_hub_by_id
from .bio_agents import BIO_AGENTS
from .models import ChatSession, ChatMessage


class BioAgentsListView(APIView):
    """
    GET /api/agents (e /api/agents/)
    Lista os 4 agentes especialistas de biodiversidade do Cerrado e semiárido.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        return Response(BIO_AGENTS)


class LocationsListView(APIView):
    """
    GET /api/locations (e /api/locations/)
    Lista os 6 polos tecnológicos com coordenadas e especialidades.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> Response:
        return Response(TECH_HUBS)


class ChatMessageView(APIView):
    """
    POST /api/chat/message (e /api/chat/message/)
    Processa mensagens interativas do Chat de Biodiversidade e Território.
    Garante contrato estrito com diagnose botânica/zoológica completa.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        message_text = request.data.get("message")
        if not message_text or not isinstance(message_text, str):
            return Response(
                {"error": "Campo message é obrigatório e deve ser texto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_id = request.data.get("sessionId") or f"session-{int(time.time() * 1000)}"
        location = request.data.get("location") or {}

        # 1. Recuperar ou criar a sessão de chat
        session_obj, _ = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={"location_data": location},
        )
        if location and location != session_obj.location_data:
            session_obj.location_data = location
            session_obj.save(update_fields=["location_data", "updated_at"])

        # Salvar mensagem do usuário
        ChatMessage.objects.create(
            session=session_obj,
            role="user",
            content=message_text,
        )

        lower = message_text.lower()
        now_iso = datetime.now(timezone.utc).isoformat()
        msg_id = f"msg-{int(time.time() * 1000)}"

        # 2. Resposta baseada no conteúdo temático
        if any(w in lower for w in ["ipê", "ipe", "árvore", "arvore", "flora"]):
            response_payload = {
                "title": "Diagnose Morfológica: Ipê-amarelo do Cerrado",
                "scientificName": "Handroanthus chrysotrichus (Mart. ex DC.) Mattos",
                "family": "Bignoniaceae",
                "biome": "Cerrado sensu stricto & Campos Rupestres",
                "summary": (
                    "O ipê-amarelo do Cerrado destaca-se por sua espetacular floração dourada "
                    "síncrona no auge da seca e adaptações de casca suberosa contra o fogo."
                ),
                "morphology": {
                    "leaves": "Folhas 5-digitadas com pelos estrelados dourados protetores na face inferior.",
                    "bark": "Tronco rugoso com espessa camada de cortiça que isola o câmbio vascular das queimadas sazonais.",
                    "flowers": "Inflorescências terminais amarelas vibrantes ricas em néctar concentrado.",
                    "adaptation": "Desfolha total antes da floração para economizar reservas hídricas vitais.",
                },
                "ecologicalNote": (
                    "Polinização primária por abelhas de grande porte (Bombus e Centris), "
                    "fundamental para a fenologia do Cerrado."
                ),
                "sources": ["Herbário Digital Unimontes", "Flora do Brasil 2020"],
            }
        elif any(w in lower for w in ["lobo", "guará", "guara", "fauna"]):
            response_payload = {
                "title": "Ecologia e Morfologia: Lobo-guará",
                "scientificName": "Chrysocyon brachyurus",
                "family": "Canidae",
                "biome": "Cerrado, Savanas Abertas e Bordas de Veredas",
                "summary": (
                    "O maior canídeo da América do Sul e o mais importante dispersor biológico "
                    "de sementes nativas do Cerrado."
                ),
                "morphology": {
                    "leaves": "Pelagem fulva-avermelhada com crina dorsal preta erétil de sinalização territorial.",
                    "bark": "Membros muito longos e finos para locomoção ágil sobre a vegetação graminosa densa.",
                    "flowers": "Orelhas amplas e móveis com audição de alta frequência para detectar presas no solo.",
                    "adaptation": "Dieta onívora: alimenta-se intensamente do fruto da lobeira, quebrando a dormência das sementes.",
                },
                "ecologicalNote": (
                    "Mutualismo ecológico clássico: a preservação do lobo-guará garante a "
                    "regeneração da flora do semiárido."
                ),
                "sources": ["ICMBio Livro Vermelho", "Laboratório de Mastozoologia Unimontes"],
            }
        else:
            response_payload = {
                "title": "Investigação Territorial Veredas AI",
                "scientificName": "Ecologia e Conhecimento do Território",
                "family": "Bioma Cerrado & Caatinga",
                "biome": "Planalto Central & Semiárido",
                "summary": (
                    f'Consulta analisada: "{message_text}". Informações fundamentadas '
                    f"nos padrões ecológicos e botânicos do Sertão."
                ),
                "morphology": {
                    "leaves": "Estruturas foliares escleromórficas com ceras e tricomas protetores.",
                    "bark": "Casca espessa com alto teor de súber e adaptação evolutiva ao fogo e à radiação solar.",
                    "flowers": "Fenologia síncrona com atração de polinizadores locais especializados.",
                    "adaptation": "Sistemas subterrâneos profundos (xilopódios) para acesso à água de aquíferos.",
                },
                "ecologicalNote": (
                    "As veredas atuam como corredores biológicos essenciais para a conservação da biodiversidade."
                ),
                "sources": ["Base Territorial Veredas", "Repositório Científico Unimontes"],
            }

        # Salvar resposta do assistente
        ChatMessage.objects.create(
            session=session_obj,
            role="assistant",
            content=response_payload["summary"],
            structured_payload=response_payload,
        )

        response_data = {
            "sessionId": session_id,
            "message": {
                "id": msg_id,
                "role": "assistant",
                "timestamp": now_iso,
                **response_payload,
            },
        }

        return Response(response_data)


class ChatHistoryView(APIView):
    """
    GET /api/chat/history/<sessionId>
    Retorna o histórico das mensagens da sessão.
    """
    permission_classes = [AllowAny]

    def get(self, request, session_id: str, *args, **kwargs) -> Response:
        try:
            session_obj = ChatSession.objects.get(session_id=session_id)
            messages = session_obj.messages.order_by("timestamp")
            history = []
            for msg in messages:
                item = {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                }
                if msg.structured_payload:
                    item.update(msg.structured_payload)
                history.append(item)
            return Response(history)
        except ChatSession.DoesNotExist:
            return Response([])


class ChatLocationView(APIView):
    """
    POST /api/chat/location
    Atualiza o polo ativo na sessão do usuário.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> Response:
        session_id = request.data.get("sessionId")
        location = request.data.get("location")

        if not session_id:
            return Response(
                {"error": "sessionId é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_obj, _ = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={"location_data": location or {}},
        )
        if location:
            session_obj.location_data = location
            session_obj.save(update_fields=["location_data", "updated_at"])

        return Response({
            "success": True,
            "location": session_obj.location_data,
        })
