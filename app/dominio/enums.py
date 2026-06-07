"""
enums.py — Tipos enumerados do domínio.

Centralizam "valores mágicos" (strings soltas) em tipos seguros, evitando erros
de digitação e documentando as opções válidas.
"""

from enum import Enum


class Perfil(str, Enum):
    """Perfis de acesso do sistema (alinhados ao `mockData.perfis` do front)."""

    ADMIN = "admin"          # Administrador / equipe — vê tudo
    GESTAO = "gestao"        # Reitor, Pró-Reitor, Secretaria — cursos e turmas (macro)
    ACADEMICO = "academico"  # Professor / Coordenador — apenas seus cursos e alunos


class NivelRisco(str, Enum):
    """Classificação de risco de reprovação/evasão (cores no front)."""

    BAIXO = "baixo"   # 🟢 verde
    MEDIO = "medio"   # 🟡 amarelo
    ALTO = "alto"     # 🔴 vermelho

    @classmethod
    def a_partir_do_irc(cls, irc: float) -> "NivelRisco":
        """Converte um Índice de Risco Combinado (0–100) em nível de risco.

        Faixas conforme a FAQ do produto: <30 baixo, 30–60 médio, >60 alto.
        """
        if irc < 30:
            return cls.BAIXO
        if irc <= 60:
            return cls.MEDIO
        return cls.ALTO


# Cores oficiais por nível de risco (mesmos HEX usados no front).
COR_RISCO: dict[str, str] = {
    NivelRisco.BAIXO.value: "#22C55E",
    NivelRisco.MEDIO.value: "#EAB308",
    NivelRisco.ALTO.value: "#EF4444",
}
