"""
estatistica_service.py — Indicadores estatísticos e KPIs.

Calcula DE VERDADE (com o motor analítico NumPy já existente) as estatísticas
que alimentam os 6 gráficos do front, mantendo o MESMO formato de
`mockData.estatisticas`. Atende aos requisitos de "cálculo de indicadores
estatísticos (médias, dispersão, variações)" e "integração dos cálculos à API".

Reaproveita:
    - EstatisticaGeral (quartis, correlação de Pearson)   → calculos_estatistica.py
    - AnaliseTurma     (desvio padrão, homogeneidade)     → calculos_kpis.py
"""

import numpy as np

from app.dominio.usuarios import UsuarioSistema
from app.repositorios.base import RepositorioAcademico
from app.servicos.calculo_academico import extrair_periodo, media_aluno

# Motor analítico (mantido na raiz do projeto e reusado aqui).
from calculos_estatistica import EstatisticaGeral
from calculos_kpis import AnaliseTurma


class EstatisticaService:
    def __init__(self, repo: RepositorioAcademico):
        self._repo = repo
        self._estatistica = EstatisticaGeral()
        self._turma = AnaliseTurma()

    # ── KPIs (Visão Geral) ───────────────────────────────────────────────────
    def kpis(self, usuario: UsuarioSistema) -> dict:
        return self._repo.kpis_por_perfil(usuario.perfil.value)

    # ── Estatísticas avançadas (gráficos) ────────────────────────────────────
    def estatisticas_avancadas(self, usuario: UsuarioSistema, curso_id: str | None = None) -> dict:
        cursos = self._repo.listar_cursos()
        turmas = self._repo.listar_turmas()
        alunos = self._repo.listar_alunos()

        # 1) Escopo por perfil (RBAC) — admin/gestão veem tudo; acadêmico, só seus cursos.
        if not usuario.tem_acesso_total():
            cursos = [c for c in cursos if usuario.pode_ver_curso(c["id"])]
            turmas = [t for t in turmas if usuario.pode_ver_curso(t["cursoId"])]
        ids_turmas_acesso = {t["id"] for t in turmas}
        alunos_acesso = [a for a in alunos if a["turmaId"] in ids_turmas_acesso]

        # 2) Filtro opcional por curso (barra de filtros da página).
        cursos_f, turmas_f, alunos_f = cursos, turmas, alunos_acesso
        if curso_id:
            cursos_f = [c for c in cursos if c["id"] == curso_id]
            turmas_f = [t for t in turmas if t["cursoId"] == curso_id]
            ids_f = {t["id"] for t in turmas_f}
            alunos_f = [a for a in alunos_acesso if a["turmaId"] in ids_f]

        return {
            "regressao": self._calc_regressao(alunos_f),
            "variancia": self._calc_variancia(cursos_f, turmas_f, alunos_f),
            "mediaMediana": self._calc_media_mediana(turmas_f, alunos_f),
            "homogeneidade": self._calc_homogeneidade(cursos_f, turmas_f, alunos_f),
            "desvioPadrao": self._calc_desvio_padrao(cursos_f, turmas_f, alunos_f),
            "registros": self._calc_registros(turmas_f, alunos_acesso, alunos_f),
        }

    # ── Cálculos auxiliares ──────────────────────────────────────────────────
    def _medias_por_curso(self, cursos, turmas, alunos) -> dict[str, list[float]]:
        turma_para_curso = {t["id"]: t["cursoId"] for t in turmas}
        agrupado: dict[str, list[float]] = {c["id"]: [] for c in cursos}
        for aluno in alunos:
            cod_curso = turma_para_curso.get(aluno["turmaId"])
            if cod_curso in agrupado:
                agrupado[cod_curso].append(media_aluno(aluno))
        return agrupado

    def _calc_regressao(self, alunos) -> dict:
        """Dispersão frequência × desempenho + reta de tendência (mínimos quadrados)."""
        freqs = [float(a.get("frequencia", 0)) for a in alunos]
        medias = [media_aluno(a) for a in alunos]
        pontos = [{"x": f, "y": m} for f, m in zip(freqs, medias)]

        if len(alunos) >= 2 and np.std(freqs) > 0:
            coef_a, coef_b = np.polyfit(freqs, medias, 1)  # y = a*x + b
            x_min, x_max = min(freqs), max(freqs)
            linha = [
                {"x": round(x_min, 2), "y": round(float(coef_a * x_min + coef_b), 2)},
                {"x": round(x_max, 2), "y": round(float(coef_a * x_max + coef_b), 2)},
            ]
            r = self._estatistica.matriz_de_correlacao_simples(freqs, medias)
            r2 = round(r ** 2, 2)
        else:
            linha, r2 = [], 0.0

        return {"pontos": pontos, "linha": linha, "r2": r2}

    def _calc_variancia(self, cursos, turmas, alunos) -> dict:
        por_curso = self._medias_por_curso(cursos, turmas, alunos)
        labels, valores = [], []
        for curso in cursos:
            notas = por_curso.get(curso["id"], [])
            labels.append(curso["nome"])
            valores.append(round(float(np.var(notas)), 2) if notas else 0.0)
        media = round(float(np.mean(valores)), 2) if valores else 0.0
        return {"labels": labels, "valores": valores, "media": media}

    def _calc_media_mediana(self, turmas, alunos) -> dict:
        labels, medias, medianas = [], [], []
        for turma in turmas:
            notas = [media_aluno(a) for a in alunos if a["turmaId"] == turma["id"]]
            if not notas:
                continue
            labels.append(turma["id"])
            medias.append(round(float(np.mean(notas)), 2))
            medianas.append(round(float(np.median(notas)), 2))
        return {"labels": labels, "medias": medias, "medianas": medianas}

    def _calc_homogeneidade(self, cursos, turmas, alunos) -> dict:
        por_curso = self._medias_por_curso(cursos, turmas, alunos)
        labels, valores = [], []
        for curso in cursos:
            notas = por_curso.get(curso["id"], [])
            labels.append(curso["nome"])
            if notas:
                media = float(np.mean(notas))
                dp = self._turma.desvio_padrao(notas)
                indice = self._turma.indice_homogeneidade(media, dp)  # 0..1
                valores.append(round(max(0.0, min(1.0, indice)) * 100, 0))
            else:
                valores.append(0.0)
        return {"labels": labels, "valores": valores}

    def _calc_desvio_padrao(self, cursos, turmas, alunos) -> dict:
        por_curso = self._medias_por_curso(cursos, turmas, alunos)
        labels, valores = [], []
        for curso in cursos:
            notas = por_curso.get(curso["id"], [])
            labels.append(curso["nome"])
            valores.append(self._turma.desvio_padrao(notas) if notas else 0.0)
        return {"labels": labels, "valores": valores}

    def _calc_registros(self, turmas_f, alunos_acesso, alunos_f) -> dict:
        # Distribui os alunos filtrados por período letivo (extraído do nome da turma).
        periodo_por_turma = {t["id"]: extrair_periodo(t["nome"]) for t in turmas_f}
        contagem: dict[str, int] = {}
        for aluno in alunos_f:
            periodo = periodo_por_turma.get(aluno["turmaId"], "—")
            contagem[periodo] = contagem.get(periodo, 0) + 1

        periodos = sorted(p for p in contagem if p != "—")
        por_periodo = [contagem[p] for p in periodos]

        return {
            "total": len(alunos_acesso),
            "analisados": len(alunos_acesso),
            "filtrado": len(alunos_f),
            "periodos": periodos,
            "porPeriodo": por_periodo,
        }
