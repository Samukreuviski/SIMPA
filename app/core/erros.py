"""
erros.py — Exceções de domínio e tradução para respostas HTTP.

Centralizar os erros evita espalhar `HTTPException` pela camada de negócio.
Os serviços levantam exceções "puras" (sem conhecer HTTP) e os controladores
as convertem — mas, para simplificar, registramos aqui handlers globais que o
`factory` instala na aplicação.
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class ErroDominio(Exception):
    """Erro base da camada de negócio. `status` mapeia para o código HTTP."""

    status: int = 400

    def __init__(self, mensagem: str):
        super().__init__(mensagem)
        self.mensagem = mensagem


class NaoEncontrado(ErroDominio):
    """Recurso inexistente (HTTP 404)."""

    status = 404


class NaoAutorizado(ErroDominio):
    """Credenciais ausentes/ inválidas (HTTP 401)."""

    status = 401


class AcessoNegado(ErroDominio):
    """Usuário autenticado, mas sem permissão para o recurso (HTTP 403)."""

    status = 403


def registrar_handlers(app) -> None:
    """Instala os tratadores de exceção de domínio na aplicação FastAPI."""

    @app.exception_handler(ErroDominio)
    async def _tratar_erro_dominio(_: Request, exc: ErroDominio):  # noqa: ANN202
        return JSONResponse(status_code=exc.status, content={"erro": exc.mensagem})
