"""DTOs analíticos: KPIs, estatísticas avançadas e predição.

A estrutura de `EstatisticasOut` espelha `mockData.estatisticas` (consumido
pelos 6 gráficos Chart.js do front), mas os valores são CALCULADOS de verdade
pelo motor analítico (NumPy) a partir dos dados — atendendo ao requisito de
"integração dos cálculos à API".
"""

from pydantic import BaseModel


# ── KPIs globais (cartões da Visão Geral) ─────────────────────────────────────
class KpisOut(BaseModel):
    totalAlunos: int
    emRisco: int
    taxaAprovacao: float
    cursosAtivos: int
    turmasAtivas: int
    taxaFrequencia: float


# ── Estatísticas avançadas (gráficos) ─────────────────────────────────────────
class PontoXY(BaseModel):
    x: float
    y: float


class RegressaoOut(BaseModel):
    pontos: list[PontoXY]
    linha: list[PontoXY]
    r2: float


class VarianciaOut(BaseModel):
    labels: list[str]
    valores: list[float]
    media: float


class MediaMedianaOut(BaseModel):
    labels: list[str]
    medias: list[float]
    medianas: list[float]


class SerieRotuladaOut(BaseModel):
    labels: list[str]
    valores: list[float]


class RegistrosOut(BaseModel):
    total: int
    analisados: int
    filtrado: int
    periodos: list[str]
    porPeriodo: list[int]


class EstatisticasOut(BaseModel):
    regressao: RegressaoOut
    variancia: VarianciaOut
    mediaMediana: MediaMedianaOut
    homogeneidade: SerieRotuladaOut
    desvioPadrao: SerieRotuladaOut
    registros: RegistrosOut


# ── Predição por aluno ────────────────────────────────────────────────────────
class MotorPredicaoOut(BaseModel):
    previsaoProximaNota: float
    curvaTendenciaPercentual: float
    previsaoArima: float


class ScoreRiscoOut(BaseModel):
    scoreDesempenho: str
    probabilidadeReprovacao: float
    indiceRiscoCombinado: float


class PredicaoOut(BaseModel):
    """Resultado de /predicao/{id}.

    `risco` e `irc` ficam no topo porque é o que o front lê no fallback do
    `api.js`; o restante enriquece o resultado para a página de predição.
    """

    alunoId: str
    nome: str
    risco: str
    irc: float
    historico: list[float]
    motorPredicao: MotorPredicaoOut
    scoreRisco: ScoreRiscoOut


class PredicaoBatchIn(BaseModel):
    """Corpo do POST /predicao/batch."""

    alunoIds: list[str]
