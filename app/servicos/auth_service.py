"""
auth_service.py — Regras de autenticação e emissão/leitura de tokens.

Responsável por validar credenciais (senha com hash) e emitir o JWT que carrega
o perfil do usuário. Também reconstrói o `UsuarioSistema` a partir de um token
válido — usado pelo RBAC para saber QUEM está chamando a API.
"""

from app.core.config import obter_config
from app.core.erros import NaoAutorizado
from app.core.logger import obter_logger
from app.core.seguranca import criar_token, verificar_senha
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.repositorios.usuario_repo import UsuarioRepositorio

_log = obter_logger("auth")


class AuthService:
    def __init__(self, usuarios: UsuarioRepositorio):
        self._usuarios = usuarios
        self._config = obter_config()

    # ── Login ────────────────────────────────────────────────────────────────
    def autenticar(self, email: str | None, cpf: str | None, senha: str) -> tuple[str, UsuarioSistema]:
        """Valida credenciais e devolve (token_jwt, usuario)."""
        usuario = self._usuarios.buscar_por_login(email, cpf)
        identificador = email or cpf or "?"

        if usuario is None or not verificar_senha(senha, usuario.senha_hash):
            # Mensagem genérica de propósito: não revela se o e-mail existe.
            _log.warning("Falha de login para '%s'.", identificador)
            raise NaoAutorizado("Usuário ou senha incorretos.")

        token = criar_token(
            dados=self._claims(usuario),
            chave_secreta=self._config.CHAVE_SECRETA,
            expira_minutos=self._config.TOKEN_EXPIRA_MINUTOS,
            algoritmo=self._config.ALGORITMO_JWT,
        )
        _log.info("Login OK: %s (%s)", usuario.email, usuario.perfil.value)
        return token, usuario

    # ── Token → Usuário ──────────────────────────────────────────────────────
    def usuario_do_payload(self, payload: dict) -> UsuarioSistema:
        """Reconstrói o usuário autenticado a partir das claims do token."""
        try:
            return UsuarioSistema(
                id=payload["id"],
                nome=payload["nome"],
                email=payload["sub"],
                cargo=payload["cargo"],
                avatar=payload["avatar"],
                perfil=Perfil(payload["perfil"]),
                cursos_acesso=payload["cursos_acesso"],
            )
        except (KeyError, ValueError) as exc:
            raise NaoAutorizado("Token sem informações de usuário válidas.") from exc

    # ── Helpers ──────────────────────────────────────────────────────────────
    @staticmethod
    def _claims(usuario: UsuarioSistema) -> dict:
        """Conteúdo que vai dentro do JWT (sem dados sensíveis como senha)."""
        return {
            "sub": usuario.email,
            "id": usuario.id,
            "nome": usuario.nome,
            "cargo": usuario.cargo,
            "avatar": usuario.avatar,
            "perfil": usuario.perfil.value,
            "cursos_acesso": usuario.cursos_acesso,
        }
