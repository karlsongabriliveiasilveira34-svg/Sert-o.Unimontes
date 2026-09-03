"""
Modelos para Persistência do Histórico de Conversas e Sessões de Chat.
"""

import uuid
from django.db import models


class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    active_hub = models.CharField(max_length=50, default="unimontes-mg")
    location_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sessão de Chat Territorial"
        verbose_name_plural = "Sessões de Chat Territorial"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Sessão {self.session_id} ({self.active_hub})"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "Usuário"),
        ("assistant", "Assistente"),
        ("system", "Sistema"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    content = models.TextField()
    structured_payload = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Mensagem de Chat"
        verbose_name_plural = "Mensagens de Chat"
        ordering = ["timestamp"]

    def __str__(self) -> str:
        return f"[{self.role}] {self.content[:40]}..."
