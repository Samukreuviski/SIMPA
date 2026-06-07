"""
usuarios.py — Modelo de usuário autenticado + Fábrica de papéis.

Aqui ligamos a parte de autenticação à hierarquia de classes OO que já existia
no projeto (`pessoa.py`, `professor.py`, `pro_reitor.py`, `secretaria.py`).

`UsuarioFactory` é uma aplicação do **padrão de projeto Factory Method**: a
partir de um `Perfil`, ela decide QUAL subclasse concreta de `Pessoa` instanciar,
sem que o resto do sistema precise conhecer essa lógica. Isso demonstra, na
prática, herança e polimorfismo (cada papel responde `acessar_sistema()` de um
jeito diferente).
"""

from dataclasses import dataclass, field

from app.dominio.enums import Perfil

# A hierarquia OO mora na raiz do projeto (mantida intacta). Os imports ficam
# protegidos para que a API continue de pé mesmo que algum arquivo falte.
try:
    from pessoa import Pessoa
    from professor import Professor
    from pro_reitor import ProReitor
    from secretaria import Secretaria
    _HIERARQUIA_OK = True
except Exception:  # noqa: BLE001
    _HIERARQUIA_OK = False


@dataclass
class UsuarioSistema:
    """Representa o usuário logado e o que ele pode acessar.

    `cursos_acesso` segue a mesma convenção do front (`mockData.perfis`):
    a string ``"all"`` significa acesso a todos os cursos; uma lista de códigos
    significa acesso restrito àqueles cursos.
    """

    id: str
    nome: str
    email: str
    cargo: str
    avatar: str
    perfil: Perfil
    cursos_acesso: object = "all"  # "all" | list[str]
    senha_hash: str = field(default="", repr=False)

    # ── Regras de acesso (usadas pelo RBAC e pelos serviços) ─────────────────
    def tem_acesso_total(self) -> bool:
        return self.cursos_acesso == "all"

    def pode_ver_curso(self, cod_curso: str) -> bool:
        return self.tem_acesso_total() or cod_curso in self.cursos_acesso

    def cursos_permitidos(self, todos_cursos: list[str]) -> list[str]:
        """Filtra a lista de cursos conforme a permissão do usuário."""
        if self.tem_acesso_total():
            return list(todos_cursos)
        return [c for c in todos_cursos if c in self.cursos_acesso]

    # ── Ponte com a hierarquia OO (Factory + polimorfismo) ───────────────────
    def como_pessoa(self):
        """Devolve a instância de `Pessoa` correspondente ao perfil."""
        return UsuarioFactory.criar(self)

    def descrever_acesso(self) -> str:
        """Mensagem polimórfica de acesso (delega para a subclasse de Pessoa)."""
        pessoa = self.como_pessoa()
        if pessoa is None:
            return f"{self.nome} acessou o sistema ({self.perfil.value})."
        return pessoa.acessar_sistema()


class UsuarioFactory:
    """Fábrica que materializa o papel do usuário como subclasse de `Pessoa`."""

    @staticmethod
    def criar(usuario: "UsuarioSistema"):
        """Mapeia `Perfil` → subclasse concreta de `Pessoa`.

        - ADMIN     → ProReitor (acesso total irrestrito)
        - GESTAO    → Secretaria (visão macro de cursos/turmas)
        - ACADEMICO → Professor (seus cursos e alunos)
        """
        if not _HIERARQUIA_OK:
            return None

        # CPF fictício (o sistema só exibe mascarado); senha é tratada à parte.
        cpf_placeholder = "00000000000"

        if usuario.perfil == Perfil.ADMIN:
            return ProReitor(usuario.nome, usuario.email, cpf_placeholder, salario=0.0)
        if usuario.perfil == Perfil.GESTAO:
            return Secretaria(usuario.nome, usuario.email, cpf_placeholder, setor="Reitoria", salario=0.0)
        # Perfil.ACADEMICO (default)
        professor = Professor(usuario.nome, usuario.email, cpf_placeholder, departamento=usuario.cargo, salario=0.0)
        return professor
