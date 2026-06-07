"""
data_base.py — Conexão e leitura do PostgreSQL.

Os dados de conexão (host, banco, usuário, senha, porta e nome da view) são
lidos das configurações por VARIÁVEL DE AMBIENTE — assim, quando o banco for
plugado, basta apontar as variáveis `PREDICTA_DB_*` (ou um arquivo .env), sem
editar este arquivo. Veja `app/core/config.py`.

O `psycopg2` é importado de forma preguiçosa (dentro da função): isso permite
que toda a API rode no modo SEED mesmo sem o driver instalado.
"""

import pandas as pd


def _parametros_conexao() -> dict:
    """Monta os parâmetros de conexão a partir da configuração (com defaults)."""
    try:
        from app.core.config import obter_config

        cfg = obter_config()
        return {
            "host": cfg.DB_HOST,
            "database": cfg.DB_NOME,
            "user": cfg.DB_USUARIO,
            "password": cfg.DB_SENHA,
            "port": cfg.DB_PORT,
            "view": cfg.DB_VIEW,
        }
    except Exception:
        # Fallback para os valores originais, caso usado fora do pacote app.
        return {
            "host": "localhost", "database": "simpa_db", "user": "postgres",
            "password": "123456", "port": "5432", "view": "estatisticasalunos",
        }


def obter_tabela_alunos():
    """Conecta ao PostgreSQL, lê a view de registros e devolve um DataFrame padronizado.

    Devolve `None` (em vez de levantar) se o driver/banco não estiverem
    disponíveis — o repositório então cai no modo SEED.
    """
    cfg = _parametros_conexao()
    try:
        import psycopg2  # import preguiçoso: só exigido no modo PostgreSQL
    except ImportError:
        print("psycopg2 não instalado — instale 'psycopg2-binary' para usar o PostgreSQL.")
        return None

    try:
        conexao = psycopg2.connect(
            host=cfg["host"],
            database=cfg["database"],
            user=cfg["user"],
            password=cfg["password"],
            port=cfg["port"],
        )

        # Puxamos os dados com o Pandas para manter a compatibilidade com a API.
        query = f"SELECT * FROM {cfg['view']};"
        tabela = pd.read_sql_query(query, conexao)
        conexao.close()

        # O Postgres devolve colunas em minúsculo; padronizamos para MAIÚSCULO.
        tabela.columns = [col.upper() for col in tabela.columns]

        # Corrige SITUACAO sem acento, se for o caso.
        if "SITUACAO" in tabela.columns and "SITUAÇÃO" not in tabela.columns:
            tabela.rename(columns={"SITUACAO": "SITUAÇÃO"}, inplace=True)

        return tabela

    except Exception as e:  # noqa: BLE001
        print(f"Erro ao conectar ao PostgreSQL: {e}")
        return None
