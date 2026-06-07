"""DTOs de autenticação e perfil do usuário."""

from typing import Optional, Union

from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    """Corpo do POST /auth/login.

    Aceita `email` (usado pela tela de login real) ou `cpf` (citado no contrato
    original do `api.js`). A senha é obrigatória.
    """

    email: Optional[str] = Field(default=None, description="E-mail institucional")
    cpf: Optional[str] = Field(default=None, description="CPF (alternativa ao e-mail)")
    senha: str = Field(..., description="Senha do usuário")


class PerfilOut(BaseModel):
    """Perfil do usuário (mesmo formato de `mockData.perfis`)."""

    id: str
    nome: str
    cargo: str
    email: str
    avatar: str
    cursos_acesso: Union[str, list[str]]


class TokenOut(BaseModel):
    """Resposta do login: token JWT + perfil (contrato `{ token, perfil }`)."""

    token: str
    perfil: PerfilOut
    tipo_token: str = "bearer"
    expira_em_min: int = 0
