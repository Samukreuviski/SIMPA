"""Controlador do Lyceum — botão "Conectar ao Lyceum" da página de Cursos.

Rotas (contrato do front):
    POST /lyceum/sync     → inicia a sincronização de dados
    GET  /lyceum/status   → { lastSync, status }
"""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_lyceum_service, usuario_atual
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.notificacao import LyceumStatusOut, LyceumSyncOut
from app.servicos.lyceum_service import LyceumService

router = APIRouter(prefix="/lyceum", tags=["Lyceum"])


@router.post("/sync", response_model=LyceumSyncOut, summary="Sincroniza dados com o Lyceum")
def sincronizar(
    _: UsuarioSistema = Depends(usuario_atual),
    servico: LyceumService = Depends(get_lyceum_service),
) -> dict:
    return servico.sincronizar()


@router.get("/status", response_model=LyceumStatusOut, summary="Status da última sincronização")
def status(
    _: UsuarioSistema = Depends(usuario_atual),
    servico: LyceumService = Depends(get_lyceum_service),
) -> dict:
    return servico.status()
