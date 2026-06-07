"""
usuario_repo.py — Repositório de usuários para autenticação.

Constrói os usuários a partir dos perfis do Seed e guarda a senha já com HASH
(PBKDF2). Em um sistema real, isto viria de uma tabela `usuarios` no banco; a
interface (buscar por e-mail/CPF) permaneceria idêntica.
"""

from app.core.config import obter_config
from app.core.seguranca import gerar_hash_senha
from app.dominio.enums import Perfil
from app.dominio.usuarios import UsuarioSistema
from app.repositorios import seed


class UsuarioRepositorio:
    """Acesso aos usuários do sistema (lista fixa derivada dos perfis)."""

    def __init__(self) -> None:
        config = obter_config()
        # Hash da senha demo é calculado UMA vez na inicialização.
        senha_hash = gerar_hash_senha(config.SENHA_DEMO)

        self._por_email: dict[str, UsuarioSistema] = {}
        for chave_perfil, dados in seed.PERFIS.items():
            usuario = UsuarioSistema(
                id=dados["id"],
                nome=dados["nome"],
                email=dados["email"],
                cargo=dados["cargo"],
                avatar=dados["avatar"],
                perfil=Perfil(chave_perfil),
                cursos_acesso=dados["cursos_acesso"],
                senha_hash=senha_hash,
            )
            self._por_email[dados["email"].lower()] = usuario

        # E-mails alternativos (atalhos de demonstração) apontam para o mesmo perfil.
        for email_alt, chave_perfil in seed.EMAILS_ALTERNATIVOS.items():
            base = seed.PERFIS[chave_perfil]
            self._por_email[email_alt.lower()] = UsuarioSistema(
                id=base["id"], nome=base["nome"], email=email_alt, cargo=base["cargo"],
                avatar=base["avatar"], perfil=Perfil(chave_perfil),
                cursos_acesso=base["cursos_acesso"], senha_hash=senha_hash,
            )

    def buscar_por_email(self, email: str) -> UsuarioSistema | None:
        if not email:
            return None
        return self._por_email.get(email.strip().lower())

    def buscar_por_login(self, email: str | None, cpf: str | None) -> UsuarioSistema | None:
        """Resolve o usuário por e-mail (preferencial) ou por CPF (não usado no Seed)."""
        if email:
            return self.buscar_por_email(email)
        # O Seed não indexa por CPF; ponto de extensão para a versão com banco.
        return None

    def listar(self) -> list[UsuarioSistema]:
        # Evita duplicar o mesmo perfil que aparece com vários e-mails.
        vistos: dict[str, UsuarioSistema] = {}
        for usuario in self._por_email.values():
            vistos.setdefault(usuario.perfil.value, usuario)
        return list(vistos.values())
