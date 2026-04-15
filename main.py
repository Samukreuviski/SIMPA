from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import pandas as pd
from models import RegistroAcademico
import os

from calculos_predicao import PreditorDesempenho, AnaliseTendencia
from calculos_risco import AnaliseRisco
from calculos_kpis import KPIAluno, KPITurma, KPIProfessor, KPIArea
from calculos_estatistica import EstatisticaGeral

app = FastAPI() # api mais complexa que o flask, mas melhor

# Prepara a infraestrutura para nosso front-end mágico
if not os.path.exists("frontend_dashboard"):
    os.makedirs("frontend_dashboard")
app.mount("/assets", StaticFiles(directory="frontend_dashboard"), name="assets")

@app.get("/painel")
def abrir_painel():
    """Servindo o nosso Dashboard moderno com o front-end"""
    caminho_index = os.path.join("frontend_dashboard", "index.html")
    if os.path.exists(caminho_index):
        return FileResponse(caminho_index)
    return {"erro": "Arquivo index.html não localizado na pasta frontend_dashboard."}

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

@app.get("/estatisticas/avancadas")
def estatisticas_avancadas():
    tabela = ler_banco_de_dados()
    if tabela is None:
        return {"erro": "O arquivo Excel ainda não foi colocado na pasta Banco_Dados_Academico!"}

    # Calcula médias e evasão (Reprovado/Reprovado por Falta)
    tabela['MEDIA_GERAL'] = (tabela['VA1'] + tabela['VA2'] + tabela['VA3']) / 3
    todas_notas = tabela['MEDIA_GERAL'].tolist()
    
    total = len(tabela)
    contagens = tabela['SITUAÇÃO'].value_counts()
    evadidos = int(contagens.get('Reprovado', 0) + contagens.get('Reprovado por Falta', 0))
    taxa_reprovacao = (evadidos / total) * 100 if total > 0 else 0

    quartis = EstatisticaGeral.calcular_quartis(todas_notas)
    dp_geral = KPITurma.desvio_padrao(todas_notas)
    media_global = sum(todas_notas)/len(todas_notas) if todas_notas else 0
    homogeneidade = KPITurma.indice_homogeneidade(media_global, dp_geral)
    indice_retencao = KPIProfessor.indice_retencao(taxa_reprovacao)
    
    return {
        "estatisticas_descritivas": {
            "notas_quartis": quartis,
            "desvio_padrao": dp_geral,
            "homogeneidade_turmas": homogeneidade
        },
        "kpis_desempenho": {
            "taxa_reprovacao_geral_pct": round(taxa_reprovacao, 2),
            "indice_retencao_alunos_pct": indice_retencao
        }
    }

@app.get("/predicao/{id_aluno}")
def predicao_aluno(id_aluno: str):
    tabela = ler_banco_de_dados()
    if tabela is None:
         return {"erro": "O arquivo Excel ainda não está disponível!"}

    id_procurado_limpo = str(id_aluno).strip()
    ids_da_planilha = tabela['ID_ALUNO'].fillna(0).astype('int64', errors='ignore').astype(str)
    filtro_aluno = tabela[ids_da_planilha == id_procurado_limpo]
    
    if filtro_aluno.empty:
        return {"erro": f"Nenhuma nota encontrada para predicão no ID: {id_aluno}"}

    # Pegamos o histórico e calculamos
    medias_historicas = ((filtro_aluno['VA1'] + filtro_aluno['VA2'] + filtro_aluno['VA3']) / 3).tolist()
    media_atual = medias_historicas[-1] if medias_historicas else 0.0
    media_anterior = medias_historicas[-2] if len(medias_historicas) > 1 else media_atual
    
    # Motor de Predição e Tendência
    linear = PreditorDesempenho.regressao_linear_simples(medias_historicas)
    tendencia = AnaliseTendencia.calcular_tendencia(media_atual, media_anterior)
    arima = AnaliseTendencia.prever_arima_simplificado(medias_historicas)
    
    # KPIs e Score (simulando 80% Freq)
    # Obs: Adaptável pro futuro com base na frequência da tabela real.
    freq_simulada = max(50.0, min(100.0, media_atual * 10 + 20))
    risco_log = PreditorDesempenho.regressao_logistica_probabilidade(media_atual, freq_simulada)
    score_nota = AnaliseRisco.analisar_score_nota(media_atual)
    irc = AnaliseRisco.indice_risco_combinado(media_atual, freq_simulada)

    return {
        "aluno_id": id_aluno,
        "historico_analisado": [round(m, 2) for m in medias_historicas],
        "motor_predicao": {
            "previsao_proxima_nota": linear,
            "curva_tendencia_percentual": tendencia,
            "previsao_arima": arima
        },
        "score_e_risco": {
            "score_desempenho": score_nota,
            "probabilidade_reprovacao": f"{risco_log}%",
            "indice_risco_combinado_irc": f"{irc}/100"
        }
    }

if __name__ == "__main__":
    # Inicia o servidor automaticamente através do comando "python main.py", como estávamos acostumados
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
