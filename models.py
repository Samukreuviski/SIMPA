from pydantic import BaseModel
from typing import Optional

# Classe Curso: curso do banco de dados
class Curso(BaseModel):
    cod_curso: str
    nome_curso: str

# Classe Disciplina: matérias
class Disciplina(BaseModel):
    cod_disciplina: str
    nome_disciplina: str

# Classe RegistroAcademico: toda a linha do banco de dados
class RegistroAcademico(BaseModel):
    id_aluno: str
    cod_curso: str
    cod_disciplina: str
    ano: int
    semestre: int
    turma: str
    serie: str
    
    # Notas - valor padrão 0.0 caso o aluno ainda não tenha nota
    va1: float = 0.0
    va2: float = 0.0
    va3: float = 0.0
    
    # Situação - Aprovado ou Reprovado
    situacao: str = "Cursando"

    # Método de Cálculo de Média da classe
    def calcular_media(self):

        return (self.va1 + self.va2 + self.va3) / 3.0 # média das 3 notas

    # Método para atualizar a coluna "SITUAÇÃO" baseado nas notas
    def atualizar_situacao(self):
        media = self.calcular_media()
        
        
        if media >= 7.0:
            self.situacao = "Aprovado"
        else:
            self.situacao = "Reprovado"
            
        return self.situacao
    