"""
notificacao_repo.py — Repositório de notificações, histórico de envios,
modelos de mensagem (templates) e FAQ. Lê do Seed.
"""

import copy

from app.repositorios import seed


class NotificacaoRepositorio:
    def listar_notificacoes(self) -> list[dict]:
        return copy.deepcopy(seed.NOTIFICACOES)

    def listar_historico(self) -> list[dict]:
        return copy.deepcopy(seed.HISTORICO_ENVIOS)

    def buscar_envio(self, id_envio: str) -> dict | None:
        for envio in seed.HISTORICO_ENVIOS:
            if envio["id"] == id_envio:
                return copy.deepcopy(envio)
        return None

    def faq(self) -> list[dict]:
        return copy.deepcopy(seed.FAQ)

    def gerar_mensagem(self, tipo: str, aluno: str, curso: str, disciplina: str) -> str:
        """Renderiza um template de intervenção (faltas/notas/geral)."""
        gerador = seed.TEMPLATES.get(tipo, seed.TEMPLATES["geral"])
        return gerador(aluno, curso, disciplina)

    def template_para_motivo(self, motivo: str | None) -> str:
        """Escolhe o template mais adequado ao motivo de risco do aluno."""
        return seed.TEMPLATE_POR_MOTIVO.get(motivo, "geral")
