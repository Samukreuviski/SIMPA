"""
aluno_service.py — Regras de negócio de alunos + controle de acesso.

O escopo de dados segue a mesma lógica do `state.js` do front: um usuário só
"enxerga" alunos das turmas dos cursos a que tem acesso. Admin vê todos.
"""

from app.core.erros import AcessoNegado, NaoEncontrado
from app.dominio.usuarios import UsuarioSistema
from app.repositorios.base import RepositorioAcademico


class AlunoService:
    def __init__(self, repo: RepositorioAcademico):
        self._repo = repo

    # ── Helpers de escopo ────────────────────────────────────────────────────
    def _turmas_permitidas(self, usuario: UsuarioSistema) -> set[str]:
        turmas = self._repo.listar_turmas()
        if usuario.tem_acesso_total():
            return {t["id"] for t in turmas}
        return {t["id"] for t in turmas if usuario.pode_ver_curso(t["cursoId"])}

    # ── Consultas ────────────────────────────────────────────────────────────
    def listar(self, usuario: UsuarioSistema, turma_id: str | None = None) -> list[dict]:
        """Lista alunos respeitando o acesso do usuário (e filtro de turma)."""
        alunos = self._repo.listar_alunos()
        permitidas = self._turmas_permitidas(usuario)

        if turma_id:
            if turma_id not in permitidas:
                raise AcessoNegado("Você não tem acesso a esta turma.")
            return [a for a in alunos if a["turmaId"] == turma_id]

        return [a for a in alunos if a["turmaId"] in permitidas]

    def obter(self, usuario: UsuarioSistema, aluno_id: str) -> dict:
        """Busca um aluno por ID, validando a permissão de acesso."""
        for aluno in self._repo.listar_alunos():
            if aluno["id"] == aluno_id:
                if aluno["turmaId"] not in self._turmas_permitidas(usuario):
                    raise AcessoNegado("Você não tem acesso a este aluno.")
                return aluno
        raise NaoEncontrado(f"Aluno '{aluno_id}' não encontrado.")
