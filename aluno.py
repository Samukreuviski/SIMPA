from pessoa import Pessoa

class Aluno(Pessoa):
    """
    Herança: Assim como o Professor, o Aluno 'é uma' Pessoa.
    Ele herda as propriedades básicas e ganha matrícula e curso.
    """
    def __init__(self, nome: str, email: str, cpf: str, matricula: str, curso: str):
        super().__init__(nome, email, cpf)
        self.matricula = matricula
        self.curso = curso

    def acessar_sistema(self):
        """
        Polimorfismo: Mais uma forma do método acessar_sistema. 
        Para o Aluno, as permissões são apenas para leitura de notas/boletim.
        """
        return f"ACESSO DISCENTE: O aluno {self.nome} entrou para consultar suas notas do curso de {self.curso}."
        
    def exibir_informacoes(self):
        info_basica = super().exibir_informacoes()
        return f"{info_basica} | Matrícula: {self.matricula} | Curso: {self.curso}"