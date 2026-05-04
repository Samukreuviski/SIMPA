import math
import numpy as np

class EstatisticaGeral:
    def __init__(self):
        pass

    def calcular_quartis(self, valores: list) -> dict:
        """
        Para classificar alunos/turmas dentro de uma distribuição usando NumPy.
        """
        if not valores: return {"Q1": 0, "Q2": 0, "Q3": 0, "IQR": 0}
        
        arr = np.array(valores)
        q1 = np.percentile(arr, 25)
        q2 = np.percentile(arr, 50) # Mediana
        q3 = np.percentile(arr, 75)
        iqr = q3 - q1
        
        return {
            "Q1": round(float(q1), 2),
            "Q2": round(float(q2), 2),
            "Q3": round(float(q3), 2),
            "IQR": round(float(iqr), 2)
        }

    def identificar_outliers(self, valores: list) -> list:
        """
        Identifica outliers de performance. 
        Mínimo: abaixo de Q1 - 1.5×IQR
        Máximo: acima de Q3 + 1.5×IQR
        """
        if not valores: return []
        quartis = self.calcular_quartis(valores)
        
        limite_inferior = quartis["Q1"] - 1.5 * quartis["IQR"]
        limite_superior = quartis["Q3"] + 1.5 * quartis["IQR"]
        
        # Filtra na lista todos os dados que ultrapassam os caixotes (Box Plot limits)
        outliers = [v for v in valores if v < limite_inferior or v > limite_superior]
        return outliers

    def matriz_de_correlacao_simples(self, lista_x: list, lista_y: list) -> float:
        """
        Identifica quais variáveis mais influenciam o desempenho usando NumPy.
        Ex: Frequência vs Nota Final (Equação de Pearson).
        Retorna R variando de -1 (inversamente proporcional) a 1 (proporcional).
        """
        if len(lista_x) != len(lista_y) or len(lista_x) < 2: return 0.0
        
        arr_x = np.array(lista_x)
        arr_y = np.array(lista_y)
        
        # se as variâncias forem 0, corrcoef retorna NaN, trataremos isso
        if np.std(arr_x) == 0 or np.std(arr_y) == 0:
            return 0.0
            
        matriz_corr = np.corrcoef(arr_x, arr_y)
        return round(float(matriz_corr[0, 1]), 3)

