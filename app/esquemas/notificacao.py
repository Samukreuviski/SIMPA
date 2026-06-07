"""DTOs de notificações, intervenções (WhatsApp/e-mail), Lyceum e FAQ."""

from typing import Optional

from pydantic import BaseModel


# ── Sininho de notificações do sistema ────────────────────────────────────────
class NotificacaoOut(BaseModel):
    id: str
    tipo: str
    titulo: str
    descricao: str
    tempo: str
    lida: bool


# ── Histórico de envios (Central de Notificações) ─────────────────────────────
class DestinatarioOut(BaseModel):
    id: str
    nome: str
    curso: str
    turma: str
    frequencia: float
    va1: float
    va2: float
    risco: str
    statusEntrega: str


class EnvioHistoricoOut(BaseModel):
    id: str
    data: str
    hora: str
    tipo: str
    tipoLabel: str
    template: str
    canal: str
    status: str
    remetente: str
    destinatarios: list[DestinatarioOut]


# ── Geração e envio de intervenção ────────────────────────────────────────────
class GerarIntervencaoIn(BaseModel):
    """Pede ao sistema as 3 mensagens-modelo para um aluno em risco."""

    alunoId: str


class MensagemModeloOut(BaseModel):
    tipo: str           # 'faltas' | 'notas' | 'geral'
    titulo: str
    mensagem: str


class EnviarIntervencaoIn(BaseModel):
    """Dispara a mensagem automática (ex.: WhatsApp) para um ou mais alunos."""

    alunoIds: list[str]
    tipo: str = "geral"        # 'faltas' | 'notas' | 'geral'
    canal: str = "WhatsApp"    # 'WhatsApp' | 'E-mail'


class EnviarIntervencaoOut(BaseModel):
    ok: bool
    enviados: int
    canal: str
    dataHora: str
    mensagens: list[MensagemModeloOut]


# ── Lyceum (sincronização) ────────────────────────────────────────────────────
class LyceumSyncOut(BaseModel):
    ok: bool
    sincronizados: int
    dataHora: str


class LyceumStatusOut(BaseModel):
    lastSync: Optional[str] = None
    status: str


# ── FAQ ───────────────────────────────────────────────────────────────────────
class FaqItemOut(BaseModel):
    pergunta: str
    resposta: str
