from professor import Professor

class Coordenador(Professor):
    """
    Herança em Multinível / Extensão:
    O Coordenador é um Professor (que por sua vez é uma Pessoa).
    Ele ganha acesso e poderes maiores no sistema e front-end.
    """
    def __init__(self, nome: str, email: str, cpf: str, departamento: str, salario: float, nivel_permissao: int = 10):
        # Chama o __init__ do Professor, que por sua vez chama o de Pessoa
        super().__init__(nome, email, cpf, departamento, salario)
        self.nivel_permissao = nivel_permissao # Permissão máxima no front-end por padrão

    def acessar_sistema(self):
        """
        Polimorfismo: Sobrescrevemos o acesso do Professor para conceder acesso de Coordenador.
        O sistema/front-end usa esse método para saber que módulos liberar.
        """
        return f"ACESSO DE COORDENAÇÃO (Nível {self.nivel_permissao}): {self.nome} acessou o sistema com permissão total (lançar notas, editar turmas, remover alunos)."

    def criar_turma(self, nome_turma: str):
        """
        Método exclusivo do Coordenador. Um Professor comum não tem esse acesso.
        """
        return f"O coordenador {self.nome} criou a nova turma: {nome_turma}"
