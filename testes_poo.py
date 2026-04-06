from pessoa import Pessoa
from professor import Professor
from aluno import Aluno

print("=== INICIANDO TESTES DE POO NO SIMPA ===\n")

print("1. ABSTRAÇÃO E ENCAPSULAMENTO")
# Criamos uma pessoa genérica (Abstração)
p1 = Pessoa("João Silva", "joao@email.com", "12345678901")

print(f"Tentando ver o CPF encapsulado de P1: {p1.cpf}")
# O CPF interno na verdade se chama _Pessoa__cpf (o Python esconde), se tentarmos p1.__cpf dará erro!
try:
    print(p1.__cpf)
except Exception as e:
    print(f"Erro ao tentar acessar a variável privada: {e}")

# Tentando colocar um CPF inválido
print("\nTentando atribuir CPF curto para P1:")
p1.cpf = "123" # Aciona a validação setter e não deixa
print(f"Ainda é: {p1.cpf}")

print("\n-------------------------------\n")

print("2. HERANÇA")
prof = Professor("Alan Turing", "turing@comp.com", "98765432100", "Ciência da Computação", 15000.0)
aluno = Aluno("Maria Dev", "maria@dev.com", "11122233344", "MAT-2024", "Sistemas de Informação")

# Eles conseguem usar os métodos criados na classe mãe Pessoa!
print("Informações do Professor:")
print(prof.exibir_informacoes())

print("\nInformações do Aluno:")
print(aluno.exibir_informacoes())


print("\n-------------------------------\n")

print("3. POLIMORFISMO")
# O mesmo comando se comporta diferente para cada tipo!
usuarios = [p1, prof, aluno]

for usuario in usuarios:
    # A mágica acontece aqui. Não precisamos fazer "if tipo == professor". 
    # O Python já sabe qual função chamar!
    print(usuario.acessar_sistema())

print("\n=== FIM DOS TESTES ===")
