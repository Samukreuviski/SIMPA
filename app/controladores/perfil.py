"""Controlador de Perfil & Conta — informações pessoais e dúvidas frequentes (FAQ)."""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_notificacao_service, usuario_atual
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.auth import PerfilOut
from app.esquemas.notificacao import FaqItemOut
from app.servicos.notificacao_service import NotificacaoService

router = APIRouter(tags=["Perfil & Conta"])


@router.get("/perfil", response_model=PerfilOut, summary="Informações do usuário logado")
def meu_perfil(usuario: UsuarioSistema = Depends(usuario_atual)) -> PerfilOut:
    return PerfilOut(
        id=usuario.id, nome=usuario.nome, cargo=usuario.cargo,
        email=usuario.email, avatar=usuario.avatar, cursos_acesso=usuario.cursos_acesso,
    )


@router.get("/perfil/acesso", summary="Mensagem de acesso (demonstra polimorfismo OO)")
def descricao_acesso(usuario: UsuarioSistema = Depends(usuario_atual)) -> dict:
    """Mostra a mensagem polimórfica do papel (ProReitor/Secretaria/Professor)."""
    return {"perfil": usuario.perfil.value, "mensagem": usuario.descrever_acesso()}


@router.get("/faq", response_model=list[FaqItemOut], summary="Dúvidas frequentes")
def faq(servico: NotificacaoService = Depends(get_notificacao_service)) -> list[dict]:
    return servico.faq()
