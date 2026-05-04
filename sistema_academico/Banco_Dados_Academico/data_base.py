import psycopg2
import pandas as pd

def obter_tabela_alunos():
    """Conecta ao PostgreSQL, busca a view estatisticasalunos e retorna um DataFrame padronizado."""
    try:
        conexao = psycopg2.connect(
            host="localhost",
            database="simpa_db",
            user="postgres",
            password="123456",
            port="5432"
        )
        
        # Puxamos os dados com o Pandas para manter a compatibilidade com nossa API
        query = "SELECT * FROM estatisticasalunos;"
        tabela = pd.read_sql_query(query, conexao)
        
        conexao.close()
        
        # O Postgres retorna colunas em minúsculo, então forçamos para MAIÚSCULO para não quebrar a API
        tabela.columns = [col.upper() for col in tabela.columns]
        
        # Corrige SITUACAO caso no banco esteja sem acento
        if 'SITUACAO' in tabela.columns and 'SITUAÇÃO' not in tabela.columns:
            tabela.rename(columns={'SITUACAO': 'SITUAÇÃO'}, inplace=True)
            
        return tabela
        
    except Exception as e:
        print(f"Erro ao conectar ao PostgreSQL: {e}")
        return None