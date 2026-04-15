from pessoa import Pessoa

class Secretaria(Pessoa):
    """
    Herança: Secretaria herda diretamente de Pessoa.
    Está acima do Professor na hierarquia de permissões.
    """
    def __init__(self, nome: str, email: str, cpf: str, setor: str, salario: float, nivel_permissao: int = 20):
        super().__init__(nome, email, cpf)
        self.setor = setor
        self.salario = salario
        self.nivel_permissao = nivel_permissao

    def acessar_sistema(self):
        """
        Polimorfismo: Acesso com nível superior ao de professor.
        """
        return f"ACESSO DE SECRETARIA (Nível {self.nivel_permissao}): {self.nome} acessou o sistema para gerenciar matrículas e documentos corporativos."
        
    def exibir_informacoes(self):
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Setor: {self.setor} | Salário: R${self.salario:.2f}"
