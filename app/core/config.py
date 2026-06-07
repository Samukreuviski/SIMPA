"""
config.py — Configuração central da aplicação.

Implementa o padrão **Singleton** através de `functools.lru_cache`: por mais que
`obter_config()` seja chamado em vários lugares, sempre devolvemos a MESMA
instância de `Configuracoes`. Os valores são lidos de variáveis de ambiente
(com defaults seguros para desenvolvimento), o que segue o princípio
"12-Factor App" de separar configuração do código.
"""

import os
from functools import lru_cache


class Configuracoes:
    """Agrupa todos os parâmetros configuráveis do sistema em um só lugar."""

    def __init__(self) -> None:
        # ── Identidade da API ────────────────────────────────────────────────
        self.APP_NOME: str = "Predicta API — SIMPA"
        self.APP_VERSAO: str = "3.0.0"
        self.APP_DESCRICAO: str = (
            "Backend em camadas para o Sistema Inteligente de Monitoramento e "
            "Predição Acadêmica (Predicta). Consulta, estatística, predição, "
            "autenticação (JWT), controle de acesso por perfil e intervenções."
        )

        # ── Segurança / Autenticação ─────────────────────────────────────────
        # Em produção, defina PREDICTA_SECRET com um valor longo e aleatório.
        self.CHAVE_SECRETA: str = os.getenv(
            "PREDICTA_SECRET", "predicta-chave-de-desenvolvimento-NAO-USE-EM-PRODUCAO"
        )
        self.ALGORITMO_JWT: str = "HS256"
        self.TOKEN_EXPIRA_MINUTOS: int = int(os.getenv("PREDICTA_TOKEN_MIN", "480"))  # 8h
        # Senha padrão dos usuários de demonstração (a mesma exibida na tela de login).
        self.SENHA_DEMO: str = os.getenv("PREDICTA_SENHA_DEMO", "predicta123")

        # ── CORS ─────────────────────────────────────────────────────────────
        # Libera o front (servido em qualquer porta durante o desenvolvimento).
        origens = os.getenv("PREDICTA_CORS", "*")
        self.CORS_ORIGENS: list[str] = ["*"] if origens == "*" else origens.split(",")

        # ── Fonte de dados ───────────────────────────────────────────────────
        # Por padrão usamos o repositório SEED (em memória, espelha o mockData do
        # front) para que a API rode sem depender de um PostgreSQL instalado.
        # Defina PREDICTA_USAR_POSTGRES=true para ativar a leitura via data_base.py.
        self.USAR_POSTGRES: bool = os.getenv("PREDICTA_USAR_POSTGRES", "false").lower() == "true"

        # ── Conexão PostgreSQL (lida por ambiente — basta apontar para o banco) ─
        # Quando o banco for plugado, defina estas variáveis (ou um .env). Não é
        # preciso editar código: o `data_base.py` usa estes valores.
        self.DB_HOST: str = os.getenv("PREDICTA_DB_HOST", "localhost")
        self.DB_PORT: str = os.getenv("PREDICTA_DB_PORT", "5432")
        self.DB_NOME: str = os.getenv("PREDICTA_DB_NAME", "simpa_db")
        self.DB_USUARIO: str = os.getenv("PREDICTA_DB_USER", "postgres")
        self.DB_SENHA: str = os.getenv("PREDICTA_DB_PASSWORD", "123456")
        # Nome da tabela/view que contém os registros acadêmicos.
        self.DB_VIEW: str = os.getenv("PREDICTA_DB_VIEW", "estatisticasalunos")

        # ── Front-end estático ───────────────────────────────────────────────
        self.PASTA_FRONTEND: str = os.getenv("PREDICTA_FRONTEND_DIR", "frontend_dashboard")

        # ── Logging ──────────────────────────────────────────────────────────
        self.NIVEL_LOG: str = os.getenv("PREDICTA_LOG_LEVEL", "INFO").upper()


@lru_cache
def obter_config() -> Configuracoes:
    """Devolve a instância única (Singleton) de configuração."""
    return Configuracoes()
