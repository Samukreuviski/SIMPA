"""
base.py — Contratos (interfaces) da camada de dados.

Define classes abstratas que descrevem O QUE um repositório deve oferecer, sem
dizer COMO. Serviços dependem destas abstrações (Inversão de Dependência — o
"D" do SOLID), então podemos trocar Seed por PostgreSQL livremente.
"""

from abc import ABC, abstractmethod


class RepositorioAcademico(ABC):
    """Acesso a cursos, turmas, disciplinas, alunos e KPIs."""

    @abstractmethod
    def listar_cursos(self) -> list[dict]: ...

    @abstractmethod
    def listar_turmas(self) -> list[dict]: ...

    @abstractmethod
    def listar_disciplinas(self) -> list[dict]: ...

    @abstractmethod
    def listar_alunos(self) -> list[dict]: ...

    @abstractmethod
    def kpis_por_perfil(self, perfil: str) -> dict: ...
