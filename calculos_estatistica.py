import math

class EstatisticaGeral:
    @staticmethod
    def calcular_quartis(valores: list) -> dict:
        """
        Para classificar alunos/turmas dentro de uma distribuição.
        Calculamos as estátisticas de amplitude manual:
        Q1: 25% | Q2: 50% (Mediana) | Q3: 75% | IQR = Q3 - Q1
        """
        if not valores: return {"Q1": 0, "Q2": 0, "Q3": 0, "IQR": 0}
        
        ordenados = sorted(valores)
        n = len(ordenados)
        
        def interpolar_percentil(p):
            k = (n - 1) * p
            f = math.floor(k)
            c = math.ceil(k)
            if f == c: return ordenados[int(k)]
            # Interpolação para cair no valor exato se não bater o len
            return ordenados[f] + (k - f) * (ordenados[c] - ordenados[f])
            
        q1 = interpolar_percentil(0.25)
        q2 = interpolar_percentil(0.50) # Mediana (linha de corte)
        q3 = interpolar_percentil(0.75)
        iqr = q3 - q1 # Amplitude interquartil
        
        return {
            "Q1": round(q1, 2),
            "Q2": round(q2, 2),
            "Q3": round(q3, 2),
            "IQR": round(iqr, 2)
        }

    @staticmethod
    def identificar_outliers(valores: list) -> list:
        """
        Identifica outliers de performance. 
        Mínimo: abaixo de Q1 - 1.5×IQR
        Máximo: acima de Q3 + 1.5×IQR
        """
        if not valores: return []
        quartis = EstatisticaGeral.calcular_quartis(valores)
        
        limite_inferior = quartis["Q1"] - 1.5 * quartis["IQR"]
        limite_superior = quartis["Q3"] + 1.5 * quartis["IQR"]
        
        # Filtra na lista todos os dados que ultrapassam os caixotes (Box Plot limits)
        outliers = [v for v in valores if v < limite_inferior or v > limite_superior]
        return outliers

    @staticmethod
    def matriz_de_correlacao_simples(lista_x: list, lista_y: list) -> float:
        """
        Identifica quais variáveis mais influenciam o desempenho.
        Ex: Frequência vs Nota Final (Equação de Pearson Manual).
        Retorna R variando de -1 (inversamente proprocional) a 1 (proporcional).
        """
        if len(lista_x) != len(lista_y) or len(lista_x) < 2: return 0.0
        
        n = len(lista_x)
        media_x = sum(lista_x) / n
        media_y = sum(lista_y) / n
        
        # Numerador: somatório do produto das diferenças da média
        numerador = sum((x - media_x) * (y - media_y) for x, y in zip(lista_x, lista_y))
        
        # Denominador: Raiz do produto da somatória das diferenças ao quadrado
        denominador_x = sum((x - media_x)**2 for x in lista_x)
        denominador_y = sum((y - media_y)**2 for y in lista_y)
        
        denominador = math.sqrt(denominador_x * denominador_y)
        
        if denominador == 0: return 0.0 # Sem variância, logo sem correlação observável
        
        return round(numerador / denominador, 3)
