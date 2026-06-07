"""Controlador de Predição.

Rotas (contrato do front):
    GET  /predicao/{id}     → índice de risco e predição de um aluno
    POST /predicao/batch    → predição em lote

RBAC: restrito a ADMIN e ACADÊMICO (envolve dados individuais de alunos).
"""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_predicao_service, requer_perfis
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.analitico import PredicaoBatchIn, PredicaoOut
from app.servicos.predicao_service import PredicaoService

router = APIRouter(prefix="/predicao", tags=["Predição"])

_apenas_acad = requer_perfis(Perfil.ADMIN, Perfil.ACADEMICO)


@router.get("/{aluno_id}", response_model=PredicaoOut, summary="Predição de um aluno")
def predicao_aluno(
    aluno_id: str,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: PredicaoService = Depends(get_predicao_service),
) -> dict:
    return servico.prever_aluno(usuario, aluno_id)


@router.post("/batch", response_model=list[PredicaoOut], summary="Predição em lote")
def predicao_batch(
    corpo: PredicaoBatchIn,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: PredicaoService = Depends(get_predicao_service),
) -> list[dict]:
    return servico.prever_batch(usuario, corpo.alunoIds)
