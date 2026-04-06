class Pessoa:
    """
    Abstração: Aqui definimos o que é essencial para o sistema sobre uma 'Pessoa'.
    Ignoramos coisas irrelevantes como 'cor do cabelo' e focamos no que importa:
    nome, email e cpf.
    """
    def __init__(self, nome: str, email: str, cpf: str):
        self.nome = nome
        self.email = email
        
        # Encapsulamento: O '__' antes do nome da variável torna o atributo "privado".
        # Isso significa que ele não pode ser acessado diretamente de fora da classe.
        self.__cpf = cpf
        self.__senha_sistema = "123456" # Senha padrão protegida

    # Encapsulamento (Getter): Como o CPF é privado, criamos um método seguro
    # para lê-lo. Podemos adicionar regras aqui, como mostrar apenas os últimos dígitos.
    @property
    def cpf(self):
        # Exemplo de segurança: retorna o CPF mascarado (ex: ***.***.***-12)
        if len(self.__cpf) == 11:
            return f"***.***.***-{self.__cpf[-2:]}"
        return self.__cpf
    
    # Encapsulamento (Setter): Método para alterar o CPF.
    # Isso impede que coloquem um CPF inválido de tamanho errado de fora.
    @cpf.setter
    def cpf(self, novo_cpf: str):
        if len(novo_cpf) == 11 and novo_cpf.isdigit():
            self.__cpf = novo_cpf
        else:
            print("Erro: CPF inválido. Deve conter 11 números.")

    def exibir_informacoes(self):
        """Método comum que será herdado."""
        return f"Nome: {self.nome} | Email: {self.email} | CPF: {self.cpf}"

    def acessar_sistema(self):
        """
        Polimorfismo: Este método existe na classe base, mas será
        comportado de forma diferente nas classes filhas (Alunos e Professores).
        """
        return f"{self.nome} está acessando o sistema como um visitante genérico."
