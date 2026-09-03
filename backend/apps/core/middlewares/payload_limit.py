"""
Middleware de Cibersegurança - Restrição de Tamanho Máximo de Payload (8 MB)
Responsável: Lucas (Cibersegurança e Banco de Dados) & Álvaro (Backend Lead)
"""

from typing import Callable
from django.http import HttpRequest, HttpResponse, JsonResponse

MAX_PAYLOAD_BYTES: int = 8 * 1024 * 1024  # 8 MB (8.388.608 bytes)


class MaxPayloadSizeMiddleware:
    """
    Intercepta todas as requisições HTTP antes da leitura completa do body.
    Rejeita com HTTP 413 (Payload Too Large) qualquer requisição com
    Content-Length estritamente superior a 8 MB.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        content_length_str = request.META.get("CONTENT_LENGTH")
        if content_length_str:
            try:
                content_length = int(content_length_str)
                if content_length > MAX_PAYLOAD_BYTES:
                    return JsonResponse(
                        {"error": "Payload demasiado grande. O limite máximo permitido é de 8 MB."},
                        status=413,
                    )
            except (ValueError, TypeError):
                # Se não for um inteiro válido, prossegue para o Django tratar
                pass

        return self.get_response(request)
