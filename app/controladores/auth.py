"""Controlador de Autenticação — POST /auth/login e POST /auth/logout."""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_auth_service
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.auth import LoginIn, PerfilOut, TokenOut
from app.servicos.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def _perfil_out(usuario: UsuarioSistema) -> PerfilOut:
    return PerfilOut(
        id=usuario.id, nome=usuario.nome, cargo=usuario.cargo,
        email=usuario.email, avatar=usuario.avatar, cursos_acesso=usuario.cursos_acesso,
    )


@router.post("/login", response_model=TokenOut, summary="Autentica e devolve um JWT")
def login(dados: LoginIn, servico: AuthService = Depends(get_auth_service)) -> TokenOut:
    """Valida e-mail/CPF + senha e devolve `{ token, perfil }` (contrato do front).

    Usuários de demonstração (senha `predicta123`):
    - `admin@unievangelica.edu.br`     → Administrador (vê tudo)
    - `reitoria@unievangelica.edu.br`  → Gestão (cursos e turmas)
    - `prof@unievangelica.edu.br`      → Professor/Coordenador (seus cursos)
    """
    from app.core.config import obter_config

    token, usuario = servico.autenticar(dados.email, dados.cpf, dados.senha)
    return TokenOut(
        token=token,
        perfil=_perfil_out(usuario),
        expira_em_min=obter_config().TOKEN_EXPIRA_MINUTOS,
    )


@router.post("/logout", summary="Encerra a sessão (stateless)")
def logout() -> dict:
    """Logout em JWT é feito no cliente (descartando o token). Endpoint simbólico
    para casar com o contrato `POST /auth/logout`."""
    return {"ok": True, "mensagem": "Sessão encerrada. Descarte o token no cliente."}
