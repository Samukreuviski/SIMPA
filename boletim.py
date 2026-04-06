from avaliacoes import Avaliacao
from frequencia import Frequencia
from aluno import Aluno

class Boletim:
    """
    Composição: O Boletim não faz sentido sozinho, ele "nasce e morre" junto
    com as obrigações acadêmicas do Aluno.
    Ele será COMPOSTO por Avaliações e Frequências.
    """
    def __init__(self, aluno: Aluno):
        self.aluno = aluno
        # Aqui acontece a composição! O Boletim INSTANCIA e GERE os objetos dependentes.
        self.avaliacoes = {} # Dicionário de disciplina -> Avaliacao
        self.frequencias = {} # Dicionário de disciplina -> Frequencia

    def adicionar_disciplina(self, disciplina: str, total_aulas: int = 60):
        """Ao adicionar uma disciplina no boletim, criamos automaticamente
        os objetos que compõem o desempenho daquela disciplina."""
        
        self.avaliacoes[disciplina] = Avaliacao(disciplina)
        self.frequencias[disciplina] = Frequencia(disciplina, total_aulas)
        return f"Disciplina {disciplina} adicionada ao boletim do(a) {self.aluno.nome}."

    def gerar_relatorio_completo(self):
        """Mostra como todos os objetos interagem para formar um resultado."""
        resultado = f"\n=== BOLETIM: {self.aluno.nome} ===\n"
        resultado += f"Curso: {self.aluno.curso}\n"
        resultado += "---------------------------------\n"
        
        if not self.avaliacoes:
            resultado += "Nenhuma disciplina cadastrada.\n"
            return resultado

        for disciplina in self.avaliacoes.keys():
            av = self.avaliacoes[disciplina]
            freq = self.frequencias[disciplina]
            
            resultado += f"{av.listar_notas()}\n"
            resultado += f"Faltas: {freq.faltas} | Frequência: {freq.situacao_frequencia():.1f}%\n"
            resultado += "---------------------------------\n"
            
        return resultado
