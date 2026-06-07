"""Camada `repositorios` — acesso a dados (padrão Repository).

Isola o restante do sistema da ORIGEM dos dados. Hoje a origem padrão é o
conjunto SEED em memória (`seed.py`), que espelha o `mockData.js` do front;
amanhã pode ser PostgreSQL (`data_base.py`) sem que serviços/controladores
precisem mudar — basta trocar a implementação por trás da mesma interface.
"""
