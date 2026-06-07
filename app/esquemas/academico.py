"""DTOs do domínio acadêmico: alunos, cursos, turmas e disciplinas.

Campos em camelCase batem 1:1 com o `mockData.js` do front.
"""

from typing import Optional

from pydantic import BaseModel


class AlunoOut(BaseModel):
    id: str
    nome: str
    turmaId: str
    va1: float
    va2: float
    va3: float
    frequencia: float
    situacao: str
    risco: str
    genero: Optional[str] = None
    motivoRisco: Optional[str] = None


class CursoOut(BaseModel):
    id: str
    nome: str
    codigo: str
    turmas: int
    alunos: int
    risco: str
    corRisco: str
    turmasIds: list[str]


class TurmaOut(BaseModel):
    id: str
    cursoId: str
    nome: str
    serie: str
    alunos: int
    emRisco: int
    mediaGeral: float
    taxaFreq: float
    risco: str
    professor: str


class DisciplinaOut(BaseModel):
    id: str
    turmaId: str
    nome: str
    codigo: str
