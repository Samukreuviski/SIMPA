"""
logger.py — Configuração centralizada de logs.

Atende ao requisito de "Logs ou monitoramento de requisições". Disponibiliza
um logger nomeado `predicta` usado por toda a aplicação (serviços, middleware,
autenticação). A configuração é idempotente: chamar `configurar_logging()`
várias vezes não duplica handlers.
"""

import logging
import sys

from app.core.config import obter_config

_LOGGER_NOME = "predicta"
_configurado = False


def configurar_logging() -> logging.Logger:
    """Configura (uma única vez) e devolve o logger raiz da aplicação."""
    global _configurado
    logger = logging.getLogger(_LOGGER_NOME)

    if not _configurado:
        config = obter_config()
        logger.setLevel(getattr(logging, config.NIVEL_LOG, logging.INFO))

        # No Windows o console costuma ser cp1252; força UTF-8 (tolerante a erros)
        # para que acentos/símbolos nos logs nunca derrubem a aplicação.
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

        manipulador = logging.StreamHandler(sys.stdout)
        formato = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        manipulador.setFormatter(formato)

        logger.handlers.clear()
        logger.addHandler(manipulador)
        logger.propagate = False  # evita logs duplicados via root logger
        _configurado = True

    return logger


def obter_logger(sufixo: str | None = None) -> logging.Logger:
    """Devolve o logger da aplicação (ou um filho, ex.: `predicta.auth`)."""
    base = configurar_logging()
    return base.getChild(sufixo) if sufixo else base
