"""
postgres_mapper.py — Conversão DataFrame (PostgreSQL) → objetos do front.

Funções PURAS (recebem um DataFrame, devolvem listas/dicionários) que montam
cursos, turmas, alunos e KPIs no MESMO formato do `mockData.js`. Ficam separadas
da conexão para serem testáveis sem banco (ver `testes_postgres.py`).

São TOLERANTES a esquema: cada campo é buscado entre vários nomes de coluna
candidatos e, quando ausente, recebe um default sensato. Assim, quando o banco
real for plugado, a integração funciona mesmo com pequenas variações de nomes.

Colunas reconhecidas (maiúsculas; ✱ = recomendada):
    ✱ ID_ALUNO | MATRICULA | ID
      NOME_ALUNO | NOME | ALUNO
    ✱ COD_CURSO | CURSO_ID | CODIGO_CURSO         (ou NOME_CURSO)
      NOME_CURSO | CURSO
    ✱ TURMA | COD_TURMA | TURMA_ID
      SERIE | PERIODO        ·  ANO  ·  SEMESTRE
    ✱ VA1, VA2, VA3
      FREQUENCIA | FREQ | FREQUENCIA_PCT
      SITUAÇÃO | SITUACAO | STATUS
      GENERO | SEXO         ·  PROFESSOR | DOCENTE
"""

import numpy as np
import pandas as pd

from app.dominio.enums import COR_RISCO, NivelRisco
from app.servicos.calculo_academico import media_validas

from calculos_risco import AnaliseRisco


# ── Helpers de acesso tolerante a colunas ─────────────────────────────────────
def _achar_coluna(df: pd.DataFrame, *candidatos: str) -> str | None:
    for nome in candidatos:
        if nome in df.columns:
            return nome
    return None


def _exigir_coluna(df: pd.DataFrame, *candidatos: str) -> str:
    col = _achar_coluna(df, *candidatos)
    if col is None:
        raise RuntimeError(
            f"Coluna obrigatória ausente no banco (esperava uma de: {', '.join(candidatos)})."
        )
    return col


def _primeiro_valor(serie: pd.Series, default=None):
    for v in serie:
        if pd.notna(v) and str(v).strip() != "":
            return v
    return default


def _media_nao_zero(serie: pd.Series) -> float:
    valores = [float(v) for v in serie if pd.notna(v) and float(v) > 0]
    return round(sum(valores) / len(valores), 2) if valores else 0.0


def _motivo_risco(media: float, freq: float, risco: str) -> str | None:
    if freq < 75:
        return "faltas"
    if media < 5.0:
        return "notas"
    if risco != NivelRisco.BAIXO.value:
        return "geral"
    return None


# ── Construtores ──────────────────────────────────────────────────────────────
def construir_alunos(df: pd.DataFrame, freq_padrao: float = 80.0) -> list[dict]:
    """Um aluno por ID_ALUNO, agregando VAs (média das notas lançadas) entre linhas."""
    col_id = _exigir_coluna(df, "ID_ALUNO", "MATRICULA", "ID")
    col_va1 = _exigir_coluna(df, "VA1")
    col_va2 = _achar_coluna(df, "VA2")
    col_va3 = _achar_coluna(df, "VA3")
    col_turma = _exigir_coluna(df, "TURMA", "COD_TURMA", "TURMA_ID")
    col_nome = _achar_coluna(df, "NOME_ALUNO", "NOME", "ALUNO")
    col_freq = _achar_coluna(df, "FREQUENCIA", "FREQ", "FREQUENCIA_PCT")
    col_sit = _achar_coluna(df, "SITUAÇÃO", "SITUACAO", "STATUS")
    col_genero = _achar_coluna(df, "GENERO", "SEXO")

    alunos: list[dict] = []
    for id_aluno, grupo in df.groupby(df[col_id].astype(str)):
        va1 = _media_nao_zero(grupo[col_va1])
        va2 = _media_nao_zero(grupo[col_va2]) if col_va2 else 0.0
        va3 = _media_nao_zero(grupo[col_va3]) if col_va3 else 0.0
        media = media_validas([va1, va2, va3])
        freq = float(_primeiro_valor(grupo[col_freq], freq_padrao)) if col_freq else freq_padrao
        irc = AnaliseRisco.indice_risco_combinado(media, freq)
        risco = NivelRisco.a_partir_do_irc(irc).value

        # Turma representativa (a mais frequente do aluno).
        turma_id = str(grupo[col_turma].mode().iloc[0]) if not grupo[col_turma].mode().empty else ""

        alunos.append({
            "id": str(id_aluno),
            "nome": str(_primeiro_valor(grupo[col_nome], f"Aluno {id_aluno}")) if col_nome else f"Aluno {id_aluno}",
            "turmaId": turma_id,
            "va1": va1, "va2": va2, "va3": va3,
            "frequencia": round(freq, 1),
            "situacao": str(_primeiro_valor(grupo[col_sit], "Cursando")) if col_sit else "Cursando",
            "risco": risco,
            "genero": (str(_primeiro_valor(grupo[col_genero])) if col_genero else None),
            "motivoRisco": _motivo_risco(media, freq, risco),
        })
    return alunos


def _mapa_turma_curso(df: pd.DataFrame) -> dict[str, str]:
    col_turma = _exigir_coluna(df, "TURMA", "COD_TURMA", "TURMA_ID")
    col_curso = _achar_coluna(df, "COD_CURSO", "CURSO_ID", "CODIGO_CURSO", "NOME_CURSO", "CURSO")
    mapa: dict[str, str] = {}
    if col_curso is None:
        return {str(t): "GERAL" for t in df[col_turma].dropna().unique()}
    for _, linha in df[[col_turma, col_curso]].dropna().iterrows():
        mapa[str(linha[col_turma])] = str(linha[col_curso])
    return mapa


def construir_cursos(df: pd.DataFrame, alunos: list[dict]) -> list[dict]:
    col_curso = _achar_coluna(df, "COD_CURSO", "CURSO_ID", "CODIGO_CURSO", "NOME_CURSO", "CURSO")
    col_nome_curso = _achar_coluna(df, "NOME_CURSO", "CURSO")
    turma_para_curso = _mapa_turma_curso(df)

    # Nome legível por código de curso.
    nome_por_codigo: dict[str, str] = {}
    if col_curso and col_nome_curso:
        for _, linha in df[[col_curso, col_nome_curso]].dropna().iterrows():
            nome_por_codigo.setdefault(str(linha[col_curso]), str(linha[col_nome_curso]))

    cursos: list[dict] = []
    codigos = sorted({turma_para_curso.get(a["turmaId"], "GERAL") for a in alunos})
    for cod in codigos:
        alunos_curso = [a for a in alunos if turma_para_curso.get(a["turmaId"]) == cod]
        turmas_ids = sorted({a["turmaId"] for a in alunos_curso if a["turmaId"]})
        medias = [media_validas([a["va1"], a["va2"], a["va3"]]) for a in alunos_curso]
        media_curso = round(float(np.mean(medias)), 2) if medias else 0.0
        freq_curso = round(float(np.mean([a["frequencia"] for a in alunos_curso])), 1) if alunos_curso else 0.0
        risco = NivelRisco.a_partir_do_irc(AnaliseRisco.indice_risco_combinado(media_curso, freq_curso)).value
        nome = nome_por_codigo.get(cod, cod)
        cursos.append({
            "id": cod,
            "nome": nome,
            "codigo": "".join(p[0] for p in nome.split()[:2]).upper() or cod[:2].upper(),
            "turmas": len(turmas_ids),
            "alunos": len(alunos_curso),
            "risco": risco,
            "corRisco": COR_RISCO[risco],
            "turmasIds": turmas_ids,
        })
    return cursos


def construir_turmas(df: pd.DataFrame, alunos: list[dict]) -> list[dict]:
    col_nome_curso = _achar_coluna(df, "NOME_CURSO", "CURSO")
    col_serie = _achar_coluna(df, "SERIE", "PERIODO")
    col_ano = _achar_coluna(df, "ANO")
    col_sem = _achar_coluna(df, "SEMESTRE")
    col_prof = _achar_coluna(df, "PROFESSOR", "DOCENTE", "NOME_PROFESSOR")
    col_turma = _exigir_coluna(df, "TURMA", "COD_TURMA", "TURMA_ID")
    turma_para_curso = _mapa_turma_curso(df)

    turmas: list[dict] = []
    for turma_id in sorted({a["turmaId"] for a in alunos if a["turmaId"]}):
        alunos_turma = [a for a in alunos if a["turmaId"] == turma_id]
        linhas = df[df[col_turma].astype(str) == turma_id]
        medias = [media_validas([a["va1"], a["va2"], a["va3"]]) for a in alunos_turma]
        media_geral = round(float(np.mean(medias)), 2) if medias else 0.0
        taxa_freq = round(float(np.mean([a["frequencia"] for a in alunos_turma])), 1) if alunos_turma else 0.0
        risco = NivelRisco.a_partir_do_irc(AnaliseRisco.indice_risco_combinado(media_geral, taxa_freq)).value

        nome_curso = _primeiro_valor(linhas[col_nome_curso]) if col_nome_curso is not None and not linhas.empty else None
        periodo = ""
        if col_ano and col_sem and not linhas.empty:
            periodo = f" — {_primeiro_valor(linhas[col_ano], '')}.{_primeiro_valor(linhas[col_sem], '')}"
        nome = f"{nome_curso}{periodo}" if nome_curso else f"Turma {turma_id}"

        turmas.append({
            "id": turma_id,
            "cursoId": turma_para_curso.get(turma_id, "GERAL"),
            "nome": nome,
            "serie": str(_primeiro_valor(linhas[col_serie], "")) if col_serie is not None and not linhas.empty else "",
            "alunos": len(alunos_turma),
            "emRisco": sum(1 for a in alunos_turma if a["risco"] == NivelRisco.ALTO.value),
            "mediaGeral": media_geral,
            "taxaFreq": taxa_freq,
            "risco": risco,
            "professor": str(_primeiro_valor(linhas[col_prof], "—")) if col_prof is not None and not linhas.empty else "—",
        })
    return turmas


def construir_kpis(alunos: list[dict], cursos: list[dict], turmas: list[dict]) -> dict:
    total = len(alunos)
    em_risco = sum(1 for a in alunos if a["risco"] == NivelRisco.ALTO.value)
    aprovados = sum(1 for a in alunos if media_validas([a["va1"], a["va2"], a["va3"]]) >= 7.0)
    freq_media = round(float(np.mean([a["frequencia"] for a in alunos])), 1) if alunos else 0.0
    return {
        "totalAlunos": total,
        "emRisco": em_risco,
        "taxaAprovacao": round((aprovados / total) * 100, 1) if total else 0.0,
        "cursosAtivos": len(cursos),
        "turmasAtivas": len(turmas),
        "taxaFrequencia": freq_media,
    }
