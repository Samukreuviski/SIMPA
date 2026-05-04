import math
import numpy as np

class KPIAluno:
    """Indicadores de Desempenho relacionados estritamente ao Aluno."""
    
    @staticmethod
    def indice_desempenho_academico(notas: list, carga_horaria: list) -> float:
        """
        IDA (Índice de Desempenho Acadêmico) 
        Fórmula: Média Ponderada das notas daquele período pelos créditos/carga horária.
        """
        if not notas or not carga_horaria or len(notas) != len(carga_horaria): 
            return 0.0
        soma = sum(n * c for n, c in zip(notas, carga_horaria))
        return round(soma / sum(carga_horaria), 2)

    @staticmethod
    def taxa_de_evolucao(nota_atual: float, nota_anterior: float) -> float:
        """
        (Nota_Atual - Nota_Anterior) / Nota_Anterior
        """
        if nota_anterior == 0: return 0.0
        return round(((nota_atual - nota_anterior) / nota_anterior) * 100, 2)

    @staticmethod
    def score_engajamento(freq_percentual: float, entregas_percentual: float) -> float:
        """Score construído via pesos paritários de Frequência e Tarefas Entregues"""
        return round((freq_percentual * 0.5) + (entregas_percentual * 0.5), 2)


class AnaliseTurma:
    """Indicadores de Desempenho operando em nível de Turma Inteira (Orientado a Objeto com NumPy)."""
    
    def __init__(self):
        pass

    def calcular_metricas_turma(self, dados_notas: list) -> dict:
        """
        Retorna Média, Variância e Desvio Padrão usando NumPy de uma vez.
        """
        if not dados_notas:
            return {"media": 0.0, "variancia": 0.0, "desvio_padrao": 0.0}
            
        arr_notas = np.array(dados_notas)
        
        return {
            "media": round(np.mean(arr_notas), 2),
            "variancia": round(np.var(arr_notas), 2),
            "desvio_padrao": round(np.std(arr_notas), 2)
        }

    def taxa_aprovacao(self, aprovados: int, total_alunos: int) -> float:
        """Aprovados / Total × 100"""
        if total_alunos == 0: return 0.0
        return round((aprovados / total_alunos) * 100, 2)

    def desvio_padrao(self, notas: list) -> float:
        """Calcula o desvio padrão via NumPy"""
        if not notas or len(notas) == 0: return 0.0
        arr_notas = np.array(notas)
        return round(np.std(arr_notas), 2)

    def indice_homogeneidade(self, media_turma: float, desvio_padrao: float) -> float:
        """1 - (σ / Média) → quanto mais próximo de 1, mais uniforme/coesa a turma é."""
        if media_turma == 0: return 0.0
        homogeneidade = 1 - (desvio_padrao / media_turma)
        return round(homogeneidade, 2)


class KPIProfessor:
    """Indicadores atrelados ao nível Docente ou Retenção global."""

    @staticmethod
    def taxa_aprovacao_media_global(lista_taxas_turmas: list) -> float:
        """Média das aprovações de todas as turmas dadas pelas professor."""
        if not lista_taxas_turmas: return 0.0
        return round(sum(lista_taxas_turmas) / len(lista_taxas_turmas), 2)

    @staticmethod
    def indice_retencao(taxa_evasao_percentual: float) -> float:
        """1 - Taxa de Evasão → Quantos alunos foram retidos."""
        return round(100.0 - taxa_evasao_percentual, 2)

    @staticmethod
    def nps_pedagogico(promotores_pct: float, detratores_pct: float) -> float:
        """NPS clássico adaptado ao escopo acadêmico."""
        return round(promotores_pct - detratores_pct, 2)


class KPIArea:
    """Macro Indicadores de Área do Conhecimento (Pro-Reitorias/Coordenações)."""

    @staticmethod
    def identificar_area_destaque(areas: dict) -> str:
        """
        Recebe um dicionário {"Area Exatas": {"media": 8, "desvio": 1.2}, ...}
        Área de Destaque = Área com maior média global de alunos. Desempatador é o devio_padrao.
        """
        if not areas: return "Nenhuma"
        # Ordenamos inicialmente tentando criar uma razão (média / (desvio ou 1) caso penalize altos desvios)
        melhor_area = max(areas.items(), key=lambda x: x[1]['media'] / (x[1]['desvio'] if x[1]['desvio'] > 0 else 1.0))
        return melhor_area[0]
        
    @staticmethod
    def classificar_area_critica(areas: dict) -> str:
        """
        No mesmo formato do dicionário, recebe chave 'reprovacao_pct'.
        Área Crítica = Maior taxa de reprovação histórica.
        """
        if not areas: return "Nenhuma"
        try:
            pior_area = max(areas.items(), key=lambda x: x[1]['reprovacao_pct'])
            return pior_area[0]
        except KeyError:
            return "Dados Insuficientes"
