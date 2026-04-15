import math

class PreditorDesempenho:
    """Classe responsável pelos cálculos matemáticos estáticos e simulações de tendências futuras."""

    @staticmethod
    def regressao_linear_simples(notas_historicas: list, pesos: list = None) -> float:
        """
        Simulação de Regressão Linear: Prever próxima nota baseada no histórico.
        Para prever desempenho progressivo - mostra o quanto as variáveis explicam o resultado.
        *(Em ambiente produtivo de larga escala usaríamos scikit-learn LinearRegression)*
        """
        if not notas_historicas: return 0.0
        if not pesos or len(pesos) != len(notas_historicas):
            # Cria pesos crescentes (períodos mais recentes pesam mais)
            pesos = [i for i in range(1, len(notas_historicas) + 1)]
        
        soma_pesos = sum(pesos)
        nota_projetada = sum(n * p for n, p in zip(notas_historicas, pesos)) / soma_pesos
        return round(nota_projetada, 2)

    @staticmethod
    def regressao_logistica_probabilidade(nota_media: float, frequencia: float) -> float:
        """
        Simulação da Função Sigmoide para encontrar a Probabilidade de Risco.
        Regressão Logística (binária: aprova ou reprova).
        Retorna a probabilidade de REPROVAÇÃO de 0% a 100%.
        """
        # Score_z ajustado: nota baixa (0-10) e falta alta diminuem drasticamente o peso.
        # Converta nota pra base 100.
        nota_100 = nota_media * 10
        # Formula matemática linear provisória para "z" na regressão logística do MEC
        z = -((nota_100 * 0.6) + (frequencia * 0.4) - 50) / 10 
        
        try:
            probabilidade = 1 / (1 + math.exp(-z))
        except OverflowError:
            probabilidade = 1.0 # Risco máximo absoluto se z for muito negativo
            
        return round(probabilidade * 100, 2)

    @staticmethod
    def media_movel_ponderada(notas: list) -> float:
        """
        Média Móvel Ponderada
        Suaviza tendência no decorrer do tempo: pesos maiores para notas recentes gerando trajetória.
        """
        return PreditorDesempenho.regressao_linear_simples(notas)

class AnaliseTendencia:
    @staticmethod
    def calcular_tendencia(media_atual: float, media_anterior: float) -> float:
        """
        Análise de Regressão/Progressão:
        Tendência = (Atual - Anterior) / Anterior * 100
        Positiva → Melhora | Negativa → Declínio
        """
        if media_anterior == 0: return 0.0
        tendencia = ((media_atual - media_anterior) / media_anterior) * 100
        return round(tendencia, 2)

    @staticmethod
    def prever_arima_simplificado(notas: list) -> float:
        """
        Série Temporal (ARIMA simplificado) para prever o próximo ponto Y(t+1)
        Ŷ(t+1) = média_recentes + tendência_linear
        """
        if len(notas) < 2: return 0.0 if not notas else notas[0]
        
        media_recentes = sum(notas[-2:]) / 2
        tendencia_percentual = AnaliseTendencia.calcular_tendencia(notas[-1], notas[-2])
        
        # Projeção ARIMA manual do próximo eixo
        previsao = media_recentes * (1 + (tendencia_percentual / 100))
        return min(round(previsao, 2), 10.0) # Limita a nota a 10
