"""
curso_service.py — Regras de negócio de cursos e turmas + controle de acesso.

Espelha `state.getCursos()`/`state.getTurmas()` do front: cada perfil só vê os
cursos/turmas permitidos.
"""

from app.core.erros import AcessoNegado, NaoEncontrado
from app.dominio.usuarios import UsuarioSistema
from app.repositorios.base import RepositorioAcademico


class CursoService:
    def __init__(self, repo: RepositorioAcademico):
        self._repo = repo

    # ── Cursos ───────────────────────────────────────────────────────────────
    def listar_cursos(self, usuario: UsuarioSistema) -> list[dict]:
        cursos = self._repo.listar_cursos()
        if usuario.tem_acesso_total():
            return cursos
        return [c for c in cursos if usuario.pode_ver_curso(c["id"])]

    def obter_curso(self, usuario: UsuarioSistema, curso_id: str) -> dict:
        for curso in self._repo.listar_cursos():
            if curso["id"] == curso_id:
                if not usuario.pode_ver_curso(curso_id):
                    raise AcessoNegado("Você não tem acesso a este curso.")
                return curso
        raise NaoEncontrado(f"Curso '{curso_id}' não encontrado.")

    # ── Turmas ───────────────────────────────────────────────────────────────
    def listar_turmas(self, usuario: UsuarioSistema, curso_id: str | None = None) -> list[dict]:
        turmas = self._repo.listar_turmas()

        # Filtra pelo acesso do usuário.
        if not usuario.tem_acesso_total():
            turmas = [t for t in turmas if usuario.pode_ver_curso(t["cursoId"])]

        # Filtro opcional por curso.
        if curso_id:
            if not usuario.pode_ver_curso(curso_id):
                raise AcessoNegado("Você não tem acesso a este curso.")
            turmas = [t for t in turmas if t["cursoId"] == curso_id]

        return turmas
