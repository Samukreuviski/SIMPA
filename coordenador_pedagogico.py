from pessoa import Pessoa

class CoordenadorPedagogico(Pessoa):
    """
    Herança: Herda diretamente de Pessoa.
    Esta classe é separada da de Coordenador de Curso e lida com a parte metodológica e corpo docente.
    """
    def __init__(self, nome: str, email: str, cpf: str, departamento: str, salario: float, nivel_permissao: int = 50):
        super().__init__(nome, email, cpf)
        self.departamento = departamento
        self.salario = salario
        self.nivel_permissao = nivel_permissao
        
    def acessar_sistema(self):
        return f"ACESSO DE COORD. PEDAGÓGICO (Nível {self.nivel_permissao}): {self.nome} acessou o sistema para gerir metodologias e corpo docente."

    def criar_turma(self, nome_turma: str):
        return f"A coordenação pedagógica ({self.nome}) gerou a nova turma: {nome_turma}"
        
    def exibir_informacoes(self):
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Departamento: {self.departamento} | Nível: {self.nivel_permissao}"
