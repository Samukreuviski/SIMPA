"""
academico_repo.py — Implementações do RepositorioAcademico.

- `RepositorioAcademicoSeed`: lê do conjunto em memória (`seed.py`). É o padrão.
- `RepositorioAcademicoPostgres`: adaptador que monta os mesmos objetos a partir
  do banco PostgreSQL (reusando `data_base.obter_tabela_alunos`). É ativado por
  configuração; se o banco estiver indisponível, o `factory` cai no Seed.

`obter_repositorio_academico()` é uma **Factory** que decide qual usar.
"""

import copy

from app.core.config import obter_config
from app.core.logger import obter_logger
from app.dominio.enums import COR_RISCO, NivelRisco
from app.repositorios import seed
from app.repositorios.base import RepositorioAcademico

_log = obter_logger("repositorio")


class RepositorioAcademicoSeed(RepositorioAcademico):
    """Fonte de dados em memória (espelha o mockData do front)."""

    def listar_cursos(self) -> list[dict]:
        return copy.deepcopy(seed.CURSOS)

    def listar_turmas(self) -> list[dict]:
        return copy.deepcopy(seed.TURMAS)

    def listar_disciplinas(self) -> list[dict]:
        return copy.deepcopy(seed.DISCIPLINAS)

    def listar_alunos(self) -> list[dict]:
        return copy.deepcopy(seed.ALUNOS)

    def kpis_por_perfil(self, perfil: str) -> dict:
        # Gestão enxerga os mesmos números macro do admin.
        return dict(seed.KPIS.get(perfil, seed.KPIS["admin"]))


class RepositorioAcademicoPostgres(RepositorioAcademico):
    """Adaptador que constrói TODO o catálogo (cursos/turmas/alunos/KPIs) no
    formato do front a partir do banco PostgreSQL.

    A leitura e a agregação acontecem UMA vez na inicialização (cache em
    memória); cursos, turmas e KPIs são derivados dos próprios dados pelo
    `postgres_mapper`, e o risco é calculado pelo motor analítico. Em caso de
    falha de conexão/esquema, levanta exceção para o factory cair no SEED.
    """

    def __init__(self) -> None:
        from sistema_academico.Banco_Dados_Academico.data_base import obter_tabela_alunos
        from app.repositorios import postgres_mapper as mapper

        tabela = obter_tabela_alunos()
        if tabela is None or tabela.empty:
            raise RuntimeError("Não foi possível obter dados de alunos do PostgreSQL.")

        # Limpa campos numéricos vazios antes de agregar.
        tabela = tabela.fillna({"VA1": 0.0, "VA2": 0.0, "VA3": 0.0})

        self._alunos = mapper.construir_alunos(tabela)
        self._cursos = mapper.construir_cursos(tabela, self._alunos)
        self._turmas = mapper.construir_turmas(tabela, self._alunos)
        self._kpis = mapper.construir_kpis(self._alunos, self._cursos, self._turmas)
        _log.info(
            "Catálogo PostgreSQL carregado: %s alunos, %s cursos, %s turmas.",
            len(self._alunos), len(self._cursos), len(self._turmas),
        )

    def listar_cursos(self) -> list[dict]:
        return copy.deepcopy(self._cursos)

    def listar_turmas(self) -> list[dict]:
        return copy.deepcopy(self._turmas)

    def listar_disciplinas(self) -> list[dict]:
        # A view de registros não detalha disciplinas como catálogo próprio;
        # mantém o conjunto de referência do Seed (usado só na intervenção).
        return copy.deepcopy(seed.DISCIPLINAS)

    def listar_alunos(self) -> list[dict]:
        return copy.deepcopy(self._alunos)

    def kpis_por_perfil(self, perfil: str) -> dict:
        # Os KPIs vêm do banco; o perfil 'academico' veria o recorte do seu
        # escopo no front, mas aqui devolvemos o panorama calculado.
        return dict(self._kpis)


def obter_repositorio_academico() -> RepositorioAcademico:
    """Factory: escolhe a implementação conforme a configuração (com fallback)."""
    config = obter_config()
    if config.USAR_POSTGRES:
        try:
            repo = RepositorioAcademicoPostgres()
            _log.info("Repositório acadêmico: PostgreSQL")
            return repo
        except Exception as exc:  # noqa: BLE001
            _log.warning("PostgreSQL indisponível (%s). Usando dados SEED.", exc)
    _log.info("Repositório acadêmico: SEED (em memória)")
    return RepositorioAcademicoSeed()
