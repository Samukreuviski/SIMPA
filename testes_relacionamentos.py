from professor import Professor
from coordenador import Coordenador
from aluno import Aluno
from turmas import Turma
from boletim import Boletim
from calculos import CalculadoraAcademica

print("=== INICIANDO TESTES DE RELACIONAMENTO ===\n")

# 1. HERANÇA EM MÚLTIPLOS NÍVEIS
print(">> CRIANDO COORDENADOR E PROFESSOR")
coord = Coordenador("Mestre Yoda", "yoda@jedi.academia", "00011122233", "Força", 20000, 100)
prof1 = Professor("Obi-Wan", "obi@jedi.academia", "22233344455", "Sabre de Luz", 10000)
prof2 = Professor("Anakin", "anakin@jedi.academia", "44455566677", "Pilotagem", 9000)

print(coord.acessar_sistema())
print(prof1.acessar_sistema())

print("\n-------------------------------\n")

# 2. ASSOCIAÇÃO E AGREGAÇÃO
print(">> CRIANDO TURMA E ADICIONANDO MEMBROS")
turma_jedi = Turma("Treinamento Jedi Básico 2024")

# Associando Professores (Pode ter mais de 1, como você pediu!)
print(turma_jedi.adicionar_professor(coord))
print(turma_jedi.adicionar_professor(prof1))
print(turma_jedi.adicionar_professor(prof2))

# Agregando Alunos
aluno1 = Aluno("Luke Skywalker", "luke@aluno.jedi", "77788899900", "MAT-001", "Jedi")
aluno2 = Aluno("Leia Organa", "leia@aluno.jedi", "88899900011", "MAT-002", "Jedi")

print(turma_jedi.adicionar_aluno(aluno1))
print(turma_jedi.adicionar_aluno(aluno2))

print("\n" + turma_jedi.listar_membros())

print("\n-------------------------------\n")

# 3. COMPOSIÇÃO, AVALIAÇÕES E CALCULADORA
print(">> GERANDO BOLETIM DO LUKE")
boletim_luke = Boletim(aluno1)

# Quando adicionamos a disciplina, Avaliacoes e Frequencias "nascem" dentro do Boletim
boletim_luke.adicionar_disciplina("Uso da Força 101", total_aulas=40)

# Acessando as avaliações que moram lá dentro para lançar as VAs
boletim_luke.avaliacoes["Uso da Força 101"].lancar_notas(va1=8.0, va2=6.0, va3=9.0)

# Acessando as frequencias lá dentro
boletim_luke.frequencias["Uso da Força 101"].registrar_falta(8) # 8 faltas em 40 aulas (20%)

print(boletim_luke.gerar_relatorio_completo())

# Testando a CalculadoraAcademica com o Luke
va1_luke = boletim_luke.avaliacoes["Uso da Força 101"].va1
va2_luke = boletim_luke.avaliacoes["Uso da Força 101"].va2
va3_luke = boletim_luke.avaliacoes["Uso da Força 101"].va3
freq_luke = boletim_luke.frequencias["Uso da Força 101"].situacao_frequencia()

media_luke = CalculadoraAcademica.calcular_media_vas(va1_luke, va2_luke, va3_luke)
situacao_luke = CalculadoraAcademica.verificar_aprovacao(media_luke, freq_luke)

print(f"Média Final calculada via Classe Estática: {media_luke:.2f}")
print(f"Situação Acadêmica Final: {situacao_luke}")

print("\n=== FIM DOS TESTES ===")
