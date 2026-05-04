import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from calculos_predicao import PreditorDesempenho, AnaliseTendencia
from calculos_risco import AnaliseRisco
from calculos_kpis import KPIAluno, AnaliseTurma, KPIProfessor, KPIArea
from calculos_estatistica import EstatisticaGeral

print("=== TESTES: MOTOR ANALÍTICO ACADÊMICO (NUMPY) ===\n")

# Instanciando as classes
preditor = PreditorDesempenho()
analise_tend = AnaliseTendencia()
analise_turma = AnaliseTurma()
estatistica = EstatisticaGeral()

print("1. PREDITOR DE DESEMPENHO")
historico = [5.5, 6.0, 6.2, 7.0]
projecao = preditor.regressao_linear_simples(historico)
print(f"Histórico: {historico} -> Projeção Linear Simples: {projecao}")

prob_reprov = preditor.regressao_logistica_probabilidade(nota_media=4.0, frequencia=60)
print(f"Prob. de Reprovação (Logística) p/ Nota 4 e 60% Freq: {prob_reprov}%")

tendencia = analise_tend.calcular_tendencia(7.0, 6.2)
print(f"Tendência de Melhora: {tendencia}%")
print(f"Previsão ARIMA Simplificada: {analise_tend.prever_arima_simplificado(historico)}\n")

print("-> TESTE DE REGRESSÃO MATRICIAL MULTIPLA <-")
# Alunos: [Nota, Freq_Invertida, Horas_Estudo]
matriz_atributos = [
    [8.0, 95.0, 15.0], # Aluno Excelente
    [4.0, 60.0, 5.0]   # Aluno em Risco
]
pesos = [0.5, 0.3, 0.2] # Importância de cada atributo
scores = preditor.regressao_matricial_multipla(matriz_atributos, pesos)
print(f"Scores (Produto Escalar via NumPy) para os alunos: {scores}\n")

print("2. ANÁLISE DE RISCO")
print(f"Score Nota (4.0): {AnaliseRisco.analisar_score_nota(4.0)}")
presenca_info = AnaliseRisco.simular_risco_presenca(aulas_presentes=30, total_aulas=40)
print(f"Simulacao Presença (30/40): {presenca_info}")
irc = AnaliseRisco.indice_risco_combinado(nota_atual=6.5, freq_atual=75)
print(f"Índice de Risco Combinado (IRC): {irc}/100\n")

print("3. KPIs APLICADOS")
print(f"Score de Engajamento Aluno (80% req, 100% ent): {KPIAluno.score_engajamento(80, 100)}")
notas_turma = [2, 5, 6, 6, 7, 8, 9, 10]
metricas = analise_turma.calcular_metricas_turma(notas_turma)
print(f"Métricas da Turma (NumPy): {metricas}")
dp_turma = metricas["desvio_padrao"]
print(f"Índice Homogeneidade (media {metricas['media']}, dev {dp_turma}): {analise_turma.indice_homogeneidade(metricas['media'], dp_turma)}\n")

print("4. ESTATÍSTICA GERAL")
quartis = estatistica.calcular_quartis(notas_turma)
print(f"Quartis da Turma: {quartis}")
y_freq = [40, 60, 70, 70, 75, 90, 95, 100] # frequencias relacionadas as notas
correlacao = estatistica.matriz_de_correlacao_simples(y_freq, notas_turma)
print(f"Correlação de Pearson (Frequencia x Nota via NumPy): {correlacao}")
print("\n=== FIM DOS TESTES ===")

