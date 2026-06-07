"""
dependencias.py — Injeção de Dependências (DI) e controle de acesso (RBAC).

Reúne as "fábricas" de serviços (cada uma devolve um Singleton via lru_cache) e
as dependências de segurança usadas pelos controladores:

    - `usuario_atual`  → exige um JWT válido e devolve o `UsuarioSistema`.
    - `requer_perfis`  → restringe um endpoint a determinados perfis (RBAC).

Os controladores declaram `Depends(...)` destas funções; o FastAPI resolve a
árvore de dependências automaticamente.
"""

from functools import lru_cache

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import obter_config
from app.core.erros import AcessoNegado, NaoAutorizado
from app.core.seguranca import TokenInvalido, decodificar_token
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.repositorios.academico_repo import obter_repositorio_academico
from app.repositorios.base import RepositorioAcademico
from app.repositorios.notificacao_repo import NotificacaoRepositorio
from app.repositorios.usuario_repo import UsuarioRepositorio
from app.servicos.aluno_service import AlunoService
from app.servicos.auth_service import AuthService
from app.servicos.curso_service import CursoService
from app.servicos.estatistica_service import EstatisticaService
from app.servicos.lyceum_service import LyceumService
from app.servicos.notificacao_service import NotificacaoService
from app.servicos.predicao_service import PredicaoService


# ── Repositórios (Singletons) ─────────────────────────────────────────────────
@lru_cache
def repo_academico() -> RepositorioAcademico:
    return obter_repositorio_academico()


@lru_cache
def repo_usuario() -> UsuarioRepositorio:
    return UsuarioRepositorio()


@lru_cache
def repo_notificacao() -> NotificacaoRepositorio:
    return NotificacaoRepositorio()


# ── Serviços (Singletons) ─────────────────────────────────────────────────────
@lru_cache
def get_auth_service() -> AuthService:
    return AuthService(repo_usuario())


@lru_cache
def get_aluno_service() -> AlunoService:
    return AlunoService(repo_academico())


@lru_cache
def get_curso_service() -> CursoService:
    return CursoService(repo_academico())


@lru_cache
def get_estatistica_service() -> EstatisticaService:
    return EstatisticaService(repo_academico())


@lru_cache
def get_predicao_service() -> PredicaoService:
    return PredicaoService(get_aluno_service())


@lru_cache
def get_notificacao_service() -> NotificacaoService:
    return NotificacaoService(repo_notificacao(), repo_academico(), get_aluno_service())


@lru_cache
def get_lyceum_service() -> LyceumService:
    return LyceumService(repo_academico())


# ── Segurança / RBAC ──────────────────────────────────────────────────────────
_esquema_bearer = HTTPBearer(auto_error=False, description="JWT obtido em /auth/login")


def usuario_atual(
    credencial: HTTPAuthorizationCredentials = Depends(_esquema_bearer),
) -> UsuarioSistema:
    """Valida o token Bearer e devolve o usuário autenticado."""
    if credencial is None or not credencial.credentials:
        raise NaoAutorizado("Token de acesso ausente. Faça login em /auth/login.")

    try:
        payload = decodificar_token(credencial.credentials, obter_config().CHAVE_SECRETA)
    except TokenInvalido as exc:
        raise NaoAutorizado(str(exc)) from exc

    return get_auth_service().usuario_do_payload(payload)


def requer_perfis(*perfis: Perfil):
    """Fábrica de dependência: garante que o usuário tenha um dos perfis dados."""

    def _verificar(usuario: UsuarioSistema = Depends(usuario_atual)) -> UsuarioSistema:
        if usuario.perfil not in perfis:
            permitidos = ", ".join(p.value for p in perfis)
            raise AcessoNegado(
                f"Acesso negado: recurso restrito aos perfis [{permitidos}]. "
                f"Seu perfil é '{usuario.perfil.value}'."
            )
        return usuario

    return _verificar
