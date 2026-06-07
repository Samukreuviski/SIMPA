"""
predicao_service.py — Mecanismo de predição de desempenho/risco.

Cumpre o requisito de "mecanismos de predição usando regressão, correlação,
análise matricial ou lógica heurística", reaproveitando o motor analítico:

    - PreditorDesempenho (regressão linear/matricial, regressão logística)  → calculos_predicao.py
    - AnaliseTendencia   (tendência percentual, ARIMA simplificado)         → calculos_predicao.py
    - AnaliseRisco       (score por nota, IRC — Índice de Risco Combinado)  → calculos_risco.py

A predição é feita sobre a série temporal das VAs já lançadas do aluno.
"""

from app.core.logger import obter_logger
from app.dominio.usuarios import UsuarioSistema
from app.servicos.aluno_service import AlunoService
from app.servicos.calculo_academico import media_validas

from calculos_predicao import AnaliseTendencia, PreditorDesempenho
from calculos_risco import AnaliseRisco

_log = obter_logger("predicao")


class PredicaoService:
    def __init__(self, alunos: AlunoService):
        self._alunos = alunos
        self._preditor = PreditorDesempenho()
        self._tendencia = AnaliseTendencia()

    def prever_aluno(self, usuario: UsuarioSistema, aluno_id: str) -> dict:
        """Gera a predição completa de um aluno (com checagem de acesso)."""
        aluno = self._alunos.obter(usuario, aluno_id)  # já valida RBAC / 404

        # Série temporal = VAs já lançadas (0 = ainda sem nota, é descartado).
        historico = [n for n in (aluno["va1"], aluno["va2"], aluno["va3"]) if n and n > 0]
        media_atual = media_validas([aluno["va1"], aluno["va2"], aluno["va3"]])
        media_anterior = historico[-2] if len(historico) > 1 else media_atual
        freq = float(aluno.get("frequencia", 0))

        # Motor de predição (regressão linear/matricial, tendência e ARIMA).
        previsao_linear = self._preditor.regressao_linear_simples(historico)
        tendencia_pct = self._tendencia.calcular_tendencia(media_atual, media_anterior)
        previsao_arima = self._tendencia.prever_arima_simplificado(historico)

        # Score e risco (regressão logística + IRC).
        prob_reprov = self._preditor.regressao_logistica_probabilidade(media_atual, freq)
        score_nota = AnaliseRisco.analisar_score_nota(media_atual)
        irc = AnaliseRisco.indice_risco_combinado(media_atual, freq)

        _log.info("Predição aluno %s: IRC=%.1f risco=%s", aluno_id, irc, aluno["risco"])

        return {
            "alunoId": aluno["id"],
            "nome": aluno["nome"],
            "risco": aluno["risco"],   # mantém o rótulo que o front já exibe
            "irc": irc,
            "historico": [round(float(n), 2) for n in historico],
            "motorPredicao": {
                "previsaoProximaNota": previsao_linear,
                "curvaTendenciaPercentual": tendencia_pct,
                "previsaoArima": previsao_arima,
            },
            "scoreRisco": {
                "scoreDesempenho": score_nota,
                "probabilidadeReprovacao": prob_reprov,
                "indiceRiscoCombinado": irc,
            },
        }

    def prever_batch(self, usuario: UsuarioSistema, aluno_ids: list[str]) -> list[dict]:
        """Predição em lote — ignora silenciosamente IDs inacessíveis/inexistentes."""
        from app.core.erros import ErroDominio

        resultados: list[dict] = []
        for aluno_id in aluno_ids:
            try:
                resultados.append(self.prever_aluno(usuario, aluno_id))
            except ErroDominio:
                continue
        return resultados
