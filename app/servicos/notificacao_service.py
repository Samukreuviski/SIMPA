"""
notificacao_service.py — Notificações e intervenções automáticas.

Atende ao requisito de "Envio de mensagem para o aluno em risco de reprovação
por WhatsApp (mensagem automática)". A geração das mensagens usa os modelos do
Seed (mesmos textos do front) preenchidos com nome do aluno, curso e disciplina.

Obs.: o envio é SIMULADO (registrado em log). Em produção, este é o ponto de
integração com a API oficial do WhatsApp Business / provedor de e-mail.
"""

from datetime import datetime

from app.core.erros import NaoEncontrado
from app.core.logger import obter_logger
from app.dominio.usuarios import UsuarioSistema
from app.repositorios.base import RepositorioAcademico
from app.repositorios.notificacao_repo import NotificacaoRepositorio
from app.servicos.aluno_service import AlunoService

_log = obter_logger("notificacao")


class NotificacaoService:
    def __init__(self, repo_notif: NotificacaoRepositorio, repo_acad: RepositorioAcademico, alunos: AlunoService):
        self._notif = repo_notif
        self._acad = repo_acad
        self._alunos = alunos

    # ── Leituras simples ─────────────────────────────────────────────────────
    def listar_notificacoes(self) -> list[dict]:
        return self._notif.listar_notificacoes()

    def listar_historico(self) -> list[dict]:
        return self._notif.listar_historico()

    def obter_envio(self, id_envio: str) -> dict:
        envio = self._notif.buscar_envio(id_envio)
        if envio is None:
            raise NaoEncontrado(f"Envio '{id_envio}' não encontrado.")
        return envio

    def faq(self) -> list[dict]:
        return self._notif.faq()

    # ── Geração e envio de intervenção ───────────────────────────────────────
    def gerar_intervencao(self, usuario: UsuarioSistema, aluno_id: str) -> list[dict]:
        """Gera os 3 modelos de mensagem (faltas, notas, geral) para um aluno."""
        aluno = self._alunos.obter(usuario, aluno_id)  # valida RBAC / 404
        curso, disciplina = self._contexto_aluno(aluno)

        titulos = {"faltas": "Excesso de Faltas", "notas": "Baixo Desempenho", "geral": "Risco Geral de Reprovação"}
        return [
            {
                "tipo": tipo,
                "titulo": titulos[tipo],
                "mensagem": self._notif.gerar_mensagem(tipo, aluno["nome"], curso, disciplina),
            }
            for tipo in ("faltas", "notas", "geral")
        ]

    def enviar_intervencao(self, usuario: UsuarioSistema, aluno_ids: list[str], tipo: str, canal: str) -> dict:
        """Dispara (simulado) a mensagem automática para os alunos informados."""
        mensagens: list[dict] = []
        for aluno_id in aluno_ids:
            aluno = self._alunos.obter(usuario, aluno_id)  # valida RBAC / 404
            curso, disciplina = self._contexto_aluno(aluno)
            # Se 'tipo' não foi forçado, escolhe pelo motivo de risco do aluno.
            tipo_msg = tipo if tipo in ("faltas", "notas", "geral") else self._notif.template_para_motivo(aluno.get("motivoRisco"))
            texto = self._notif.gerar_mensagem(tipo_msg, aluno["nome"], curso, disciplina)
            mensagens.append({"tipo": tipo_msg, "titulo": aluno["nome"], "mensagem": texto})
            _log.info("Intervenção (%s) enviada para %s [%s] por %s", canal, aluno["nome"], aluno_id, usuario.email)

        return {
            "ok": True,
            "enviados": len(mensagens),
            "canal": canal,
            "dataHora": datetime.now().isoformat(timespec="seconds"),
            "mensagens": mensagens,
        }

    # ── Helper de contexto ───────────────────────────────────────────────────
    def _contexto_aluno(self, aluno: dict) -> tuple[str, str]:
        """Descobre o nome do curso e uma disciplina representativa do aluno."""
        turma = next((t for t in self._acad.listar_turmas() if t["id"] == aluno["turmaId"]), None)
        curso_nome = "seu curso"
        if turma:
            curso = next((c for c in self._acad.listar_cursos() if c["id"] == turma["cursoId"]), None)
            curso_nome = curso["nome"] if curso else curso_nome
        disciplina = next((d for d in self._acad.listar_disciplinas() if d["turmaId"] == aluno["turmaId"]), None)
        disciplina_nome = disciplina["nome"] if disciplina else "sua disciplina"
        return curso_nome, disciplina_nome
