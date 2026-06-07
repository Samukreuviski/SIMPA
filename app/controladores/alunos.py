"""Controlador de Alunos.

Rotas (contrato do front):
    GET /alunos/todos        → todos os alunos acessíveis
    GET /alunos/turma/{id}   → alunos de uma turma
    GET /alunos/{id}         → aluno individual

RBAC: dados individuais de alunos são restritos a ADMIN e ACADÊMICO
(professor/coordenador). O perfil de GESTÃO vê apenas dados macro de
cursos/turmas/estatísticas, preservando a privacidade do aluno.
"""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_aluno_service, requer_perfis
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.academico import AlunoOut
from app.servicos.aluno_service import AlunoService

router = APIRouter(tags=["Alunos"])

# Dependência reaproveitada nas três rotas: exige perfil ADMIN ou ACADÊMICO.
_apenas_acad = requer_perfis(Perfil.ADMIN, Perfil.ACADEMICO)


@router.get("/alunos/todos", response_model=list[AlunoOut], summary="Todos os alunos acessíveis")
def listar_alunos(
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: AlunoService = Depends(get_aluno_service),
) -> list[dict]:
    return servico.listar(usuario)


@router.get("/alunos/turma/{turma_id}", response_model=list[AlunoOut], summary="Alunos de uma turma")
def alunos_da_turma(
    turma_id: str,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: AlunoService = Depends(get_aluno_service),
) -> list[dict]:
    return servico.listar(usuario, turma_id=turma_id)


@router.get("/alunos/{aluno_id}", response_model=AlunoOut, summary="Aluno individual")
def obter_aluno(
    aluno_id: str,
    usuario: UsuarioSistema = Depends(_apenas_acad),
    servico: AlunoService = Depends(get_aluno_service),
) -> dict:
    return servico.obter(usuario, aluno_id)
