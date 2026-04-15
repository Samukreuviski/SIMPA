class AnaliseRisco:
    @staticmethod
    def analisar_score_nota(nota_escala_10: float) -> str:
        """
        Risco por Nota
        Classificação se baseia na conversão da nota para escala 100 (ScoreRisco).
        0-40 🔴 Alto | 41-70 🟡 Médio | 71-100 🟢 Baixo
        """
        nota_100 = nota_escala_10 * 10
        if nota_100 <= 40:
            return "🔴 Alto"
        elif nota_100 <= 70:
            return "🟡 Médio"
        return "🟢 Baixo"

    @staticmethod
    def simular_risco_presenca(aulas_presentes: int, total_aulas: int) -> dict:
        """
        Risco por Presença - Limiar Regulatório
        Retorna projeção de quantas faltas o aluno ainda pode ter e o status.
        Mínimo MEC: 75%
        """
        if total_aulas == 0: return {}
        
        faltas_atuais = total_aulas - aulas_presentes
        freq_atual = (aulas_presentes / total_aulas) * 100
        aulas_faltaveis = (total_aulas * 0.25) - faltas_atuais
        
        status = "Reprovado por Falta" if aulas_faltaveis <= 0 else "Regular"
        
        return {
            "frequencia_atual_porcentagem": round(freq_atual, 2),
            "faltas_atuais": faltas_atuais,
            "aulas_faltaveis_projeccao": int(aulas_faltaveis),
            "status": status
        }

    @staticmethod
    def indice_risco_combinado(nota_atual: float, freq_atual: float) -> float:
        """
        Índice de Risco Combinado (IRC)
        Cruzamento de falta de nota e falta de frequência. 
        Retorna um valor de risco de 0% (ótimo) a 100% (altíssimo risco).
        Nesse modelo: 60% peso em reprovação por nota, 40% em presença.
        """
        deficiencia_nota = (10.0 - nota_atual) * 10 # Transforma para barra percentual de erro
        deficiencia_freq = 100.0 - freq_atual
        
        irc = (deficiencia_nota * 0.6) + (deficiencia_freq * 0.4)
        return min(round(irc, 2), 100.0)
