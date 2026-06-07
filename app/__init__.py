"""
Pacote `app` — Backend Predicta (SIMPA)
=======================================

Camada de aplicação organizada em arquitetura em camadas (Layered Architecture):

    controladores/  → Camada de Apresentação (rotas/endpoints FastAPI)
    servicos/       → Camada de Negócio (regras, RBAC, orquestração)
    repositorios/   → Camada de Acesso a Dados (padrão Repository)
    esquemas/       → DTOs de entrada/saída (Pydantic)
    dominio/        → Entidades e regras de domínio (enums, fábricas)
    core/           → Infraestrutura transversal (config, segurança, logs)

O ponto de montagem da aplicação é `app.factory.create_app()`.
"""
