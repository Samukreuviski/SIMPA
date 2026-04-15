from pessoa import Pessoa

class ProReitor(Pessoa):
    """
    Herança: Pro-Reitor herda de Pessoa e está no topo da hierarquia (acima de Coordenador).
    """
    def __init__(self, nome: str, email: str, cpf: str, salario: float, nivel_permissao: int = 100):
        super().__init__(nome, email, cpf)
        self.salario = salario
        self.nivel_permissao = nivel_permissao

    def acessar_sistema(self):
        """
        Polimorfismo: O Pro-Reitor tem acesso total ao sistema.
        """
        return f"ACESSO DE PRÓ-REITOR (Nível {self.nivel_permissao}): {self.nome} acessou o sistema com ACESSO TOTAL IRRESTRITO."
        
    def exibir_informacoes(self):
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Cargo: Pró-Reitor"
