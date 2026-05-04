import math
import numpy as np

class PreditorDesempenho:
    """Classe responsável pelos cálculos matemáticos estáticos e simulações de tendências futuras orientada a objeto."""
    
    def __init__(self):
        pass

    def regressao_linear_simples(self, notas_historicas: list, pesos: list = None) -> float:
        """
        Simulação de Regressão Linear usando NumPy: Prever próxima nota baseada no histórico.
        Para prever desempenho progressivo - mostra o quanto as variáveis explicam o resultado.
        """
        if not notas_historicas: return 0.0
        if not pesos or len(pesos) != len(notas_historicas):
            pesos = [i for i in range(1, len(notas_historicas) + 1)]
        
        arr_notas = np.array(notas_historicas)
        arr_pesos = np.array(pesos)
        
        soma_pesos = np.sum(arr_pesos)
        nota_projetada = np.dot(arr_notas, arr_pesos) / soma_pesos
        return round(float(nota_projetada), 2)

    def regressao_matricial_multipla(self, matriz_alunos: list, vetor_pesos: list) -> list:
        """
        Calcula o score de cada aluno através de uma Regressão Matricial (Produto Escalar).
        O 'vetor de atributos' do aluno pode ser (notas, faltas_invertidas, tempo_estudo).
        Utiliza np.dot para multiplicar a matriz_alunos pelo vetor_pesos.
        """
        if not matriz_alunos or not vetor_pesos:
            return []
            
        matriz = np.array(matriz_alunos) # Ex: [[7.0, 90, 10], [5.0, 50, 2]]
        pesos = np.array(vetor_pesos)    # Ex: [0.5, 0.3, 0.2]
        
        # O cálculo matricial de similaridade ou score
        scores = np.dot(matriz, pesos)
        return [round(float(s), 2) for s in scores]

    def regressao_logistica_probabilidade(self, nota_media: float, frequencia: float) -> float:
        """
        Simulação da Função Sigmoide para encontrar a Probabilidade de Risco.
        Regressão Logística (binária: aprova ou reprova).
        """
        nota_100 = nota_media * 10
        z = -((nota_100 * 0.6) + (frequencia * 0.4) - 50) / 10 
        
        # np.exp é mais robusto para arrays, mas aqui é um escalar
        try:
            probabilidade = 1 / (1 + np.exp(-z))
        except OverflowError:
            probabilidade = 1.0 
            
        return round(float(probabilidade * 100), 2)

    def media_movel_ponderada(self, notas: list) -> float:
        """Média Móvel Ponderada"""
        return self.regressao_linear_simples(notas)

class AnaliseTendencia:
    def __init__(self):
        pass

    def calcular_tendencia(self, media_atual: float, media_anterior: float) -> float:
        """Análise de Regressão/Progressão"""
        if media_anterior == 0: return 0.0
        tendencia = ((media_atual - media_anterior) / media_anterior) * 100
        return round(tendencia, 2)

    def prever_arima_simplificado(self, notas: list) -> float:
        """Série Temporal (ARIMA simplificado) para prever o próximo ponto Y(t+1)"""
        if len(notas) < 2: return 0.0 if not notas else notas[0]
        
        media_recentes = sum(notas[-2:]) / 2
        tendencia_percentual = self.calcular_tendencia(notas[-1], notas[-2])
        
        previsao = media_recentes * (1 + (tendencia_percentual / 100))
        return min(round(previsao, 2), 10.0)
