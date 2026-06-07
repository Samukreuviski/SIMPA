"""
testes_postgres.py — Testes do mapeador PostgreSQL (sem banco).

Valida que a agregação DataFrame → objetos do front produz exatamente o formato
esperado, conferindo cada item contra os DTOs Pydantic (AlunoOut/CursoOut/
TurmaOut/KpisOut). Assim garantimos que, ao plugar o banco real, o contrato com
o front continua idêntico.

Execução:  python testes_postgres.py
"""

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import pandas as pd  # noqa: E402

from app.esquemas.academico import AlunoOut, CursoOut, TurmaOut  # noqa: E402
from app.esquemas.analitico import KpisOut  # noqa: E402
from app.repositorios import postgres_mapper as mapper  # noqa: E402

_total = {"ok": 0, "falhou": 0}


def checar(descricao: str, condicao: bool, detalhe: str = "") -> None:
    marca = "✅" if condicao else "❌"
    _total["ok" if condicao else "falhou"] += 1
    print(f"  {marca} {descricao}" + (f"  [{detalhe}]" if detalhe and not condicao else ""))


# DataFrame sintético no formato da view 'estatisticasalunos' (1 linha por aluno×disciplina).
linhas = [
    # Ana — curso ENG, turma T1, boa frequência e notas → baixo risco
    {"ID_ALUNO": 1, "NOME_ALUNO": "Ana Souza", "COD_CURSO": "ENG", "NOME_CURSO": "Engenharia de Software", "TURMA": "T1", "SERIE": "4º Período", "ANO": 2024, "SEMESTRE": 1, "VA1": 8.0, "VA2": 7.5, "VA3": 0, "FREQUENCIA": 92, "SITUAÇÃO": "Cursando", "GENERO": "F", "PROFESSOR": "Prof. Eduardo"},
    {"ID_ALUNO": 1, "NOME_ALUNO": "Ana Souza", "COD_CURSO": "ENG", "NOME_CURSO": "Engenharia de Software", "TURMA": "T1", "SERIE": "4º Período", "ANO": 2024, "SEMESTRE": 1, "VA1": 6.0, "VA2": 7.0, "VA3": 0, "FREQUENCIA": 92, "SITUAÇÃO": "Cursando", "GENERO": "F", "PROFESSOR": "Prof. Eduardo"},
    # Bia — curso ENG, turma T1, notas baixas e pouca presença → alto risco
    {"ID_ALUNO": 2, "NOME_ALUNO": "Bia Lima", "COD_CURSO": "ENG", "NOME_CURSO": "Engenharia de Software", "TURMA": "T1", "SERIE": "4º Período", "ANO": 2024, "SEMESTRE": 1, "VA1": 3.0, "VA2": 2.5, "VA3": 0, "FREQUENCIA": 55, "SITUAÇÃO": "Cursando", "GENERO": "F", "PROFESSOR": "Prof. Eduardo"},
    # Caio — curso DIR, turma T2, intermediário
    {"ID_ALUNO": 3, "NOME_ALUNO": "Caio Reis", "COD_CURSO": "DIR", "NOME_CURSO": "Direito", "TURMA": "T2", "SERIE": "2º Período", "ANO": 2024, "SEMESTRE": 1, "VA1": 6.0, "VA2": 6.0, "VA3": 0, "FREQUENCIA": 80, "SITUAÇÃO": "Cursando", "GENERO": "M", "PROFESSOR": "Profa. Maria"},
]
df = pd.DataFrame(linhas)

print("=== TESTES DO MAPEADOR POSTGRESQL (DataFrame sintético) ===\n")

alunos = mapper.construir_alunos(df)
cursos = mapper.construir_cursos(df, alunos)
turmas = mapper.construir_turmas(df, alunos)
kpis = mapper.construir_kpis(alunos, cursos, turmas)

print("1. AGREGAÇÃO")
checar("3 alunos agregados (1 por ID_ALUNO)", len(alunos) == 3, str(len(alunos)))
checar("2 cursos derivados (ENG, DIR)", len(cursos) == 2, str(len(cursos)))
checar("2 turmas derivadas (T1, T2)", len(turmas) == 2, str(len(turmas)))

ana = next(a for a in alunos if a["id"] == "1")
checar("Ana agrega VA1 das 2 disciplinas (média 7.0)", ana["va1"] == 7.0, str(ana["va1"]))
checar("Ana fica em baixo risco", ana["risco"] == "baixo", ana["risco"])

bia = next(a for a in alunos if a["id"] == "2")
checar("Bia (notas baixas + 55% freq) fica em alto risco", bia["risco"] == "alto", bia["risco"])
checar("Bia tem motivoRisco='faltas' (freq < 75)", bia["motivoRisco"] == "faltas", str(bia["motivoRisco"]))

print("\n2. CONFORMIDADE COM OS DTOs DO FRONT (Pydantic)")
try:
    [AlunoOut(**a) for a in alunos]
    checar("Todos os alunos validam como AlunoOut", True)
except Exception as e:  # noqa: BLE001
    checar("Todos os alunos validam como AlunoOut", False, str(e))

try:
    [CursoOut(**c) for c in cursos]
    checar("Todos os cursos validam como CursoOut", True)
except Exception as e:  # noqa: BLE001
    checar("Todos os cursos validam como CursoOut", False, str(e))

try:
    [TurmaOut(**t) for t in turmas]
    checar("Todas as turmas validam como TurmaOut", True)
except Exception as e:  # noqa: BLE001
    checar("Todas as turmas validam como TurmaOut", False, str(e))

try:
    KpisOut(**kpis)
    checar("KPIs validam como KpisOut", True)
except Exception as e:  # noqa: BLE001
    checar("KPIs validam como KpisOut", False, str(e))

print("\n3. TOLERÂNCIA A ESQUEMA (sem NOME_ALUNO, sem FREQUENCIA)")
df_minimo = df.drop(columns=["NOME_ALUNO", "FREQUENCIA", "GENERO", "PROFESSOR"])
try:
    alunos_min = mapper.construir_alunos(df_minimo)
    ok = len(alunos_min) == 3 and all(AlunoOut(**a) for a in alunos_min)
    checar("Constrói alunos mesmo com colunas opcionais ausentes", ok, str(len(alunos_min)))
except Exception as e:  # noqa: BLE001
    checar("Constrói alunos mesmo com colunas opcionais ausentes", False, str(e))

print("\n" + "=" * 48)
print(f"  RESULTADO: {_total['ok']} passaram | {_total['falhou']} falharam")
print("=" * 48)
sys.exit(1 if _total["falhou"] else 0)
