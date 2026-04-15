from pessoa import Pessoa

class CoordenadorCurso(Pessoa):
    """
    Herança: Herda diretamente de Pessoa.
    Esta classe é separada da de Coordenador Pedagógico e lida com a parte de estrutura do curso.
    """
    def __init__(self, nome: str, email: str, cpf: str, departamento: str, salario: float, nivel_permissao: int = 50):
        super().__init__(nome, email, cpf)
        self.departamento = departamento
        self.salario = salario
        self.nivel_permissao = nivel_permissao
        
    def acessar_sistema(self):
        return f"ACESSO DE COORD. DE CURSO (Nível {self.nivel_permissao}): {self.nome} acessou o sistema para gerir e estruturar a grade curricular do curso."

    def criar_turma(self, nome_turma: str):
        return f"A coordenação de curso ({self.nome}) gerou a nova turma: {nome_turma}"
    
    def exibir_informacoes(self):
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Departamento: {self.departamento} | Nível: {self.nivel_permissao}"
