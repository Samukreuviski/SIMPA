"""Camada `esquemas` — DTOs (Data Transfer Objects) de entrada e saída da API.

Os nomes dos campos seguem EXATAMENTE as chaves esperadas pelo front-end
(`frontend_dashboard/js/mockData.js`) — por isso há `camelCase` em alguns
campos (ex.: `turmaId`, `corRisco`). Isso garante que, ao conectar o front à
API, os objetos JSON sejam idênticos aos do mock, sem precisar alterar o front.
"""
