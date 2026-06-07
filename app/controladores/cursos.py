"""Controlador de Cursos e Turmas.

Rotas (contrato do front):
    GET /cursos/todos        → lista de cursos
    GET /cursos/{id}         → curso individual
    GET /cursos/{id}/turmas  → turmas de um curso
    GET /turmas/todas        → todas as turmas

Liberado para todos os perfis autenticados; o serviço aplica o escopo de acesso
(admin/gestão veem tudo; acadêmico vê apenas seus cursos).
"""

from fastapi import APIRouter, Depends

from app.core.dependencias import get_curso_service, usuario_atual
from app.dominio.usuarios import UsuarioSistema
from app.esquemas.academico import CursoOut, TurmaOut
from app.servicos.curso_service import CursoService

router = APIRouter(tags=["Cursos & Turmas"])


@router.get("/cursos/todos", response_model=list[CursoOut], summary="Lista de cursos")
def listar_cursos(
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: CursoService = Depends(get_curso_service),
) -> list[dict]:
    return servico.listar_cursos(usuario)


@router.get("/cursos/{curso_id}", response_model=CursoOut, summary="Curso individual")
def obter_curso(
    curso_id: str,
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: CursoService = Depends(get_curso_service),
) -> dict:
    return servico.obter_curso(usuario, curso_id)


@router.get("/cursos/{curso_id}/turmas", response_model=list[TurmaOut], summary="Turmas de um curso")
def turmas_do_curso(
    curso_id: str,
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: CursoService = Depends(get_curso_service),
) -> list[dict]:
    return servico.listar_turmas(usuario, curso_id)


@router.get("/turmas/todas", response_model=list[TurmaOut], summary="Todas as turmas")
def listar_turmas(
    usuario: UsuarioSistema = Depends(usuario_atual),
    servico: CursoService = Depends(get_curso_service),
) -> list[dict]:
    return servico.listar_turmas(usuario)
