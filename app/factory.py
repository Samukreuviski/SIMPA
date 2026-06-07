"""
factory.py — Application Factory.

Monta e configura a instância do FastAPI (padrão **Application Factory**):
middlewares, CORS, tratadores de erro, routers de cada domínio e o serviço de
arquivos estáticos do front. Centralizar a criação aqui facilita testes (cada
teste pode criar sua própria app) e mantém o `main.py` enxuto.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.controladores import (
    alunos,
    auth,
    cursos,
    estatisticas,
    lyceum,
    notificacoes,
    perfil,
    predicao,
)
from app.core.config import obter_config
from app.core.erros import registrar_handlers
from app.core.logger import configurar_logging
from app.core.middleware import RegistroRequisicoesMiddleware


def create_app() -> FastAPI:
    config = obter_config()
    log = configurar_logging()

    app = FastAPI(
        title=config.APP_NOME,
        version=config.APP_VERSAO,
        description=config.APP_DESCRICAO,
        contact={"name": "Equipe Predicta — SIMPA / UniEVANGÉLICA"},
    )

    # ── Middlewares ──────────────────────────────────────────────────────────
    # CORS liberado para o front (que usa JWT no cabeçalho Authorization, sem cookies).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGENS,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Tempo-Processamento-ms", "X-Request-ID"],
    )
    # Log/monitoramento de todas as requisições.
    app.add_middleware(RegistroRequisicoesMiddleware)

    # ── Tratadores de erro de domínio (404/401/403/400 padronizados) ─────────
    registrar_handlers(app)

    # ── Routers (camada de apresentação) ─────────────────────────────────────
    for modulo in (auth, perfil, cursos, alunos, estatisticas, predicao, notificacoes, lyceum):
        app.include_router(modulo.router)

    # ── Endpoint-raiz informativo da API ─────────────────────────────────────
    @app.get("/", tags=["Infra"], summary="Status da API")
    def raiz() -> dict:
        return {
            "aplicacao": config.APP_NOME,
            "versao": config.APP_VERSAO,
            "documentacao": "/docs",
            "painel_frontend": "/painel/",
            "mensagem": "API de Predição Acadêmica no ar. Faça login em POST /auth/login.",
        }

    # ── Front-end estático (sem alterar nenhum arquivo do front) ─────────────
    # Servido em /painel/ com html=True, de modo que os caminhos relativos do
    # index.html (styles.css, js/App.js, imagens) resolvam corretamente.
    pasta_front = config.PASTA_FRONTEND
    if os.path.isdir(pasta_front):
        app.mount("/painel", StaticFiles(directory=pasta_front, html=True), name="painel")
        # Compatibilidade com a montagem antiga (/assets) do main.py original.
        app.mount("/assets", StaticFiles(directory=pasta_front), name="assets")
        log.info("Front-end servido em /painel/ (pasta: %s)", pasta_front)
    else:
        log.warning("Pasta do front-end '%s' não encontrada — /painel desativado.", pasta_front)

    log.info("%s v%s pronta. Origem de dados: %s",
             config.APP_NOME, config.APP_VERSAO,
             "PostgreSQL" if config.USAR_POSTGRES else "SEED")
    return app
