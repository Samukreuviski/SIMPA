from professor import Professor
from aluno import Aluno

class Turma:
    """
    Turma demonstra dois conceitos importantes:
    1. Associação: A turma tem uma LISTA de Professores. A turma conhece o professor e vice-versa.
    2. Agregação: A turma é composta por Alunos. Um aluno existe independente da turma,
                  mas ele pode ser adicionado à turma. (Eles se agregam aqui).
    """
    def __init__(self, nome_turma: str):
        self.nome_turma = nome_turma
        # Listas para guardar os objetos Associados/Agregados
        self.professores = [] 
        self.alunos = []

    def adicionar_professor(self, professor: Professor):
        """Associação: Atrelando professores (ou coordenadores) à turma."""
        if professor not in self.professores:
            self.professores.append(professor)
            return f"Professor(a) {professor.nome} foi associado(a) à turma {self.nome_turma}."
        return "Professor já está na turma."

    def adicionar_aluno(self, aluno: Aluno):
        """Agregação: Agregando um aluno já existente à turma."""
        if aluno not in self.alunos:
            self.alunos.append(aluno)
            return f"Aluno(a) {aluno.nome} foi matriculado(a) na turma {self.nome_turma}."
        return "Aluno já está matriculado."

    def listar_membros(self):
        """Lista os objetos agregados/associados, mostrando polimorfismo e chamada de métodos dos objetos"""
        nomes_professores = [p.nome for p in self.professores]
        nomes_alunos = [a.nome for a in self.alunos]
        
        return (
            f"=== Turma {self.nome_turma} ===\n"
            f"Professores: {', '.join(nomes_professores) if nomes_professores else 'Nenhum professor associado.'}\n"
            f"Total de Alunos: {len(self.alunos)}\n"
            f"Nomes dos Alunos: {', '.join(nomes_alunos) if nomes_alunos else 'Turma vazia.'}"
        )
