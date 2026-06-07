"""Controlador de Estatísticas e KPIs.

Rotas (contrato do front):
    GET /estatisticas/gerais     → KPIs globais (cartões da Visão Geral)
    GET /estatisticas/avancadas  → dados calculados para os 6 gráficos

Liberado para todos os perfis autenticados (o serviço aplica o escopo).
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencias import get_estatistica_service, usuario_atual
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.analitico import EstatisticasOut, KpisOut
from app.servicos.estatistica_service import EstatisticaService

router = APIRouter(prefix="/estatisticas", tags=["Estatísticas & KPIs"])


@router.get("/gerais", response_model=KpisOut, summary="KPIs globais por perfil")
def kpis_gerais(
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: EstatisticaService = Depends(get_estatistica_service),
) -> dict:
    return servico.kpis(usuario)


@router.get("/avancadas", response_model=EstatisticasOut, summary="Estatísticas para os gráficos")
def estatisticas_avancadas(
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: EstatisticaService = Depends(get_estatistica_service),
    cursoId: str | None = Query(default=None, description="Filtra as estatísticas por curso"),
) -> dict:
    # O front pode enviar string vazia; tratamos como 'sem filtro'.
    curso = cursoId or None
    return servico.estatisticas_avancadas(usuario, curso_id=curso)
