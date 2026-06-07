"""Controlador de Notificações e Intervenções.

Rotas:
    GET  /notificacoes                              → sininho do sistema
    GET  /notificacoes/historico                    → histórico de envios
    GET  /notificacoes/historico/{id}               → um envio
    GET  /notificacoes/historico/{id}/destinatarios → destinatários do envio
    POST /notificacoes/intervencao/gerar            → 3 modelos de mensagem
    POST /notificacoes/intervencao/enviar           → dispara mensagem (WhatsApp/e-mail)
"""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_notificacao_service, requer_perfis, usuario_atual
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.notificacao import (
    DestinatarioOut,
    EnviarIntervencaoIn,
    EnviarIntervencaoOut,
    EnvioHistoricoOut,
    GerarIntervencaoIn,
    MensagemModeloOut,
    NotificacaoOut,
)
from app.servicos.notificacao_service import NotificacaoService

router = APIRouter(prefix="/notificacoes", tags=["Notificações & Intervenções"])

_apenas_acad = requer_perfis(Perfil.ADMIN, Perfil.ACADEMICO)


@router.get("", response_model=list[NotificacaoOut], summary="Notificações do sistema (sininho)")
def listar_notificacoes(
    _: UsuarioSistema = Depends(usuario_atual),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> list[dict]:
    return servico.listar_notificacoes()


@router.get("/historico", response_model=list[EnvioHistoricoOut], summary="Histórico de envios")
def historico(
    _: UsuarioSistema = Depends(usuario_atual),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> list[dict]:
    return servico.listar_historico()


@router.get("/historico/{id_envio}", response_model=EnvioHistoricoOut, summary="Detalhe de um envio")
def detalhe_envio(
    id_envio: str,
    _: UsuarioSistema = Depends(usuario_atual),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> dict:
    return servico.obter_envio(id_envio)


@router.get(
    "/historico/{id_envio}/destinatarios",
    response_model=list[DestinatarioOut],
    summary="Destinatários de um envio",
)
def destinatarios_envio(
    id_envio: str,
    _: UsuarioSistema = Depends(usuario_atual),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> list[dict]:
    return servico.obter_envio(id_envio)["destinatarios"]


@router.post(
    "/intervencao/gerar",
    response_model=list[MensagemModeloOut],
    summary="Gera os 3 modelos de mensagem para um aluno em risco",
)
def gerar_intervencao(
    corpo: GerarIntervencaoIn,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> list[dict]:
    return servico.gerar_intervencao(usuario, corpo.alunoId)


@router.post(
    "/intervencao/enviar",
    response_model=EnviarIntervencaoOut,
    summary="Envia a mensagem automática (WhatsApp/e-mail)",
)
def enviar_intervencao(
    corpo: EnviarIntervencaoIn,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: NotificacaoService = Depends(get_notificacao_service),
) -> dict:
    return servico.enviar_intervencao(usuario, corpo.alunoIds, corpo.tipo, corpo.canal)
