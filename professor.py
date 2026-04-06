from pessoa import Pessoa

class Professor(Pessoa):
    """
    Herança: O Professor 'é uma' Pessoa. 
    A classe Professor herda TUDO que Pessoa tem (nome, email, cpf) e adiciona 
    características específicas de um professor.
    """
    def __init__(self, nome: str, email: str, cpf: str, departamento: str, salario: float):
        # A função super() chama o __init__ da classe pai (Pessoa) para registrar nome, email e cpf
        super().__init__(nome, email, cpf)
        
        self.departamento = departamento
        self.salario = salario
        self.disciplinas_lecionadas = []

    def adicionar_disciplina(self, disciplina: str):
        self.disciplinas_lecionadas.append(disciplina)
        return f"Disciplina {disciplina} adicionada ao professor {self.nome}."

    def acessar_sistema(self):
        """
        Polimorfismo: O método tem o mesmo nome que o da classe mãe (Pessoa),
        mas se comporta de maneira diferente. O professor tem permissões de Lançar Notas.
        """
        return f"ACESSO DECORPO DOCENTE: {self.nome} acessou o sistema com permissão para lançar notas."
    
    def exibir_informacoes(self):
        # Usamos o exibir_informacoes base e adicionamos algo novo
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Departamento: {self.departamento}"