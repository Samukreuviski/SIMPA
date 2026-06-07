"""
middleware.py — Monitoramento de requisições.

Implementa o requisito de "Logs ou monitoramento de requisições": todo request
HTTP é registrado com método, caminho, status e tempo de processamento (ms).
Também adiciona o cabeçalho `X-Tempo-Processamento-ms` na resposta, útil para
diagnóstico de desempenho.
"""

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logger import obter_logger


class RegistroRequisicoesMiddleware(BaseHTTPMiddleware):
    """Mede e loga cada requisição que passa pela API."""

    def __init__(self, app):
        super().__init__(app)
        self._log = obter_logger("requisicoes")

    async def dispatch(self, request: Request, call_next):
        id_req = uuid.uuid4().hex[:8]
        inicio = time.perf_counter()

        try:
            resposta = await call_next(request)
        except Exception:  # noqa: BLE001 — re-lançamos após logar
            decorrido = (time.perf_counter() - inicio) * 1000
            self._log.exception(
                "[%s] %s %s -> ERRO interno (%.1f ms)",
                id_req, request.method, request.url.path, decorrido,
            )
            raise

        decorrido = (time.perf_counter() - inicio) * 1000
        resposta.headers["X-Tempo-Processamento-ms"] = f"{decorrido:.1f}"
        resposta.headers["X-Request-ID"] = id_req

        nivel = self._log.warning if resposta.status_code >= 400 else self._log.info
        nivel(
            "[%s] %s %s -> %s (%.1f ms)",
            id_req, request.method, request.url.path, resposta.status_code, decorrido,
        )
        return resposta
