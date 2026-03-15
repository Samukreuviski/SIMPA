from fastapi import FastAPI
import uvicorn
import pandas as pd
from models import RegistroAcademico
import os

app = FastAPI() # api mais complexa que o flask, mas melhor

# local onde atualizamos o banco de dados, que atualmente é um excel
CAMINHO_BANCO = "sistema_academico/Banco_Dados_Academico/Banco_Dados_Academico.xlsx"

@app.get("/")
def pagina_inicial():
    return {"mensagem": "API de Leitura e Predição Acadêmica pronta! Acesse /docs"}

# Assim que a API for chamada, aqui testamos o banco de dados
def ler_banco_de_dados():
    # Verifica se o arquivo já foi colocado na pasta
    if not os.path.exists(CAMINHO_BANCO):
        return None
        
    try:
        # O Pandas transforma a planilha do Excel em uma tabela interna do Python chamada DataFrame
        tabela = pd.read_excel(CAMINHO_BANCO)
        
        # Como o Pandas lê tudo, campos vazios precisam ser tratados, trocando por 0 ou texto vazio)
        tabela.fillna({
            'VA1': 0.0, 'VA2': 0.0, 'VA3': 0.0,
            'PROUNI': 'NAO INFORMADO', 'FIES': 'NAO INFORMADO', 'BOLSA': 'NENHUMA',
            'SITUAÇÃO': 'Cursando'
        }, inplace=True)
        
        return tabela
    except Exception as e:
        print(f"Erro ao ler o arquivo: {e}")
        return None


# ROTAS DE CONSULTA E PREDIÇÃO

@app.get("/alunos/todos")
def listar_todos_alunos():
    tabela = ler_banco_de_dados()
    
    # Se o arquivo não existir ou estiver vazio, aparece essa mensagem
    if tabela is None:
        return {"erro": "O arquivo Excel ainda não foi colocado na pasta Banco_Dados_Academico!"}
    
    # Pegamos os dados e removemos alunos duplicados, já que mais pra frente o banco de dados terá mais materias
    alunos_unicos = tabela[['ID_ALUNO', 'NOME_CURSO', 'CIDADE', 'ESTADO', 'SITUAÇÃO']].drop_duplicates()
    
    # Convertendo a tabelinha do Pandas de volta para exibir na API
    return alunos_unicos.to_dict(orient="records")

@app.get("/registros/{id_aluno}")
def ver_boletim_do_aluno(id_aluno: str):
    tabela = ler_banco_de_dados()
    
    if tabela is None:
        return {"erro": "O arquivo Excel ainda não foi colocado na pasta Banco_Dados_Academico!"}
        

    # 1. Transformamos o ID em texto limpo
    id_procurado_limpo = str(id_aluno).strip()
    
    # 2. Convertemos a coluna inteira do Pandas para texto limpo:

    ids_da_planilha = tabela['ID_ALUNO'].fillna(0).astype('int64', errors='ignore').astype(str)
    
    filtro_aluno = tabela[ids_da_planilha == id_procurado_limpo]
    
    if filtro_aluno.empty:
        return {"erro": f"Nenhum registro encontrado para o ID_ALUNO: {id_aluno}"}
        

    boletim = []
    for indice, linha in filtro_aluno.iterrows():
        # objeto RegistroAcademico passando as colunas reais do Excel
        registro = RegistroAcademico(
            id_aluno=str(linha['ID_ALUNO']),
            cod_curso=str(linha['COD_CURSO']),
            cod_disciplina=str(linha['COD_DISCIPLINA']),
            ano=int(linha['ANO']),
            semestre=int(linha['SEMESTRE']),
            turma=str(linha['TURMA']),
            serie=str(linha['SERIE']),
            va1=float(linha['VA1']),
            va2=float(linha['VA2']),
            va3=float(linha['VA3']),
            situacao=str(linha['SITUAÇÃO'])
        )
        
        # cálculo da real situação através das notas
        registro.atualizar_situacao()
        boletim.append(registro)
        
    return {"id_aluno": id_aluno, "boletim": boletim}

@app.get("/estatisticas/gerais")
def ver_estatisticas():
    # indicativos gerais!
    tabela = ler_banco_de_dados()
    if tabela is None:
        return {"erro": "O arquivo Excel ainda não foi colocado na pasta Banco_Dados_Academico!"}
        
    total_linhas = len(tabela)
    # Conta quantas vezes a palavra Aprovado e Reprovado aparece na coluna de status
    contagem_situacao = tabela['SITUAÇÃO'].value_counts().to_dict()
    
    return {
        "total_registros_analisados": total_linhas,
        "indicadores_de_situacao": contagem_situacao
    }

if __name__ == "__main__":
    # Inicia o servidor automaticamente através do comando "python main.py", como estávamos acostumados
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
