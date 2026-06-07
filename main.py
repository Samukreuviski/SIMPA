"""
main.py — Ponto de entrada do backend Predicta (SIMPA).

A aplicação FastAPI é montada pela Application Factory em `app/factory.py`,
que organiza todas as camadas (controladores → serviços → repositórios) e
serve o front-end estático em /painel/.

Como executar (igual de antes):
    python main.py
ou
    uvicorn main:app --reload

Documentação interativa: http://localhost:8000/docs
Painel (front-end):       http://localhost:8000/painel/
"""

import uvicorn

from app.factory import create_app

# Instância da aplicação (usada por `uvicorn main:app`).
app = create_app()


if __name__ == "__main__":
    # Sobe o servidor automaticamente com `python main.py`.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
