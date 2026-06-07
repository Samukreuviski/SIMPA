"""
calculo_academico.py — Funções utilitárias de apoio aos cálculos.

Pequenas funções puras (fáceis de testar) reutilizadas por vários serviços e
pelo adaptador PostgreSQL. Concentram regras como "média das VAs já lançadas".
"""

import re


def media_validas(notas: list[float]) -> float:
    """Média das notas já lançadas (ignora 0, tratado como 'ainda sem nota').

    Se nenhuma nota foi lançada, devolve 0.0. Mantém coerência com o front, em
    que `va3 = 0` significa avaliação ainda não realizada.
    """
    lancadas = [n for n in notas if n and n > 0]
    if not lancadas:
        return 0.0
    return round(sum(lancadas) / len(lancadas), 2)


def media_aluno(aluno: dict) -> float:
    """Média do aluno a partir de VA1/VA2/VA3."""
    return media_validas([aluno.get("va1", 0), aluno.get("va2", 0), aluno.get("va3", 0)])


def mapa_turma_para_curso(turmas: list[dict]) -> dict[str, str]:
    """{ turmaId: cursoId } — para descobrir o curso de cada aluno."""
    return {t["id"]: t["cursoId"] for t in turmas}


def mapa_curso_para_nome(cursos: list[dict]) -> dict[str, str]:
    """{ cursoId: nome do curso }."""
    return {c["id"]: c["nome"] for c in cursos}


def extrair_periodo(nome_turma: str) -> str:
    """Extrai o período letivo (ex.: '2024.1') do nome da turma."""
    achado = re.search(r"(\d{4}\.\d)", nome_turma or "")
    return achado.group(1) if achado else "—"
