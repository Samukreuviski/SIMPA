"""
lyceum_service.py — Integração (simulada) com o portal acadêmico Lyceum.

Representa o "botão de conexão com o Lyceum" da página de Cursos. O envio real
exigiria credenciais e a API do Lyceum; aqui simulamos a sincronização e
guardamos o horário da última execução para o endpoint de status.
"""

from datetime import datetime

from app.core.logger import obter_logger
from app.repositorios.base import RepositorioAcademico

_log = obter_logger("lyceum")


class LyceumService:
    def __init__(self, repo: RepositorioAcademico):
        self._repo = repo
        self._ultima_sync: str | None = None

    def sincronizar(self) -> dict:
        """Simula a sincronização e devolve quantos registros foram processados."""
        # Usa o total de alunos conhecido (KPI macro) como volume sincronizado.
        total = self._repo.kpis_por_perfil("admin").get("totalAlunos", 0)
        self._ultima_sync = datetime.now().isoformat(timespec="seconds")
        _log.info("Sincronização Lyceum concluída: %s registros.", total)
        return {"ok": True, "sincronizados": total, "dataHora": self._ultima_sync}

    def status(self) -> dict:
        return {
            "lastSync": self._ultima_sync,
            "status": "sincronizado" if self._ultima_sync else "nunca_sincronizado",
        }
