"""
testes_api.py — Testes de integração do backend Predicta.

Exercita a API de ponta a ponta (autenticação, RBAC, consultas, estatística,
predição e intervenção) usando o TestClient do FastAPI. Não precisa de servidor
rodando nem de banco de dados (usa o repositório SEED).

Execução:  python testes_api.py
"""

import sys
import io

# Garante saída UTF-8 no terminal do Windows (emojis/acentos).
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from fastapi.testclient import TestClient  # noqa: E402

from app.factory import create_app  # noqa: E402

cliente = TestClient(create_app())

_total = {"ok": 0, "falhou": 0}


def checar(descricao: str, condicao: bool, detalhe: str = "") -> None:
    marca = "✅" if condicao else "❌"
    _total["ok" if condicao else "falhou"] += 1
    print(f"  {marca} {descricao}" + (f"  [{detalhe}]" if detalhe and not condicao else ""))


def logar(email: str, senha: str = "predicta123") -> str | None:
    resp = cliente.post("/auth/login", json={"email": email, "senha": senha})
    if resp.status_code != 200:
        return None
    return resp.json()["token"]


print("=== TESTES DE INTEGRAÇÃO — BACKEND PREDICTA ===\n")

# ── 1. Autenticação ───────────────────────────────────────────────────────────
print("1. AUTENTICAÇÃO E SEGURANÇA")
token_admin = logar("admin@unievangelica.edu.br")
checar("Login admin retorna token", bool(token_admin))

token_gestao = logar("reitoria@unievangelica.edu.br")
checar("Login gestão retorna token", bool(token_gestao))

token_prof = logar("prof@unievangelica.edu.br")
checar("Login professor retorna token", bool(token_prof))

senha_errada = cliente.post("/auth/login", json={"email": "admin@unievangelica.edu.br", "senha": "errada"})
checar("Senha incorreta é rejeitada (401)", senha_errada.status_code == 401, str(senha_errada.status_code))

sem_token = cliente.get("/alunos/todos")
checar("Rota protegida sem token retorna 401", sem_token.status_code == 401, str(sem_token.status_code))

cabecalho_admin = {"Authorization": f"Bearer {token_admin}"}
cabecalho_gestao = {"Authorization": f"Bearer {token_gestao}"}
cabecalho_prof = {"Authorization": f"Bearer {token_prof}"}

# ── 2. Controle de acesso (RBAC) ──────────────────────────────────────────────
print("\n2. CONTROLE DE ACESSO POR PERFIL (RBAC)")
cursos_admin = cliente.get("/cursos/todos", headers=cabecalho_admin).json()
checar("Admin vê todos os 6 cursos", len(cursos_admin) == 6, str(len(cursos_admin)))

cursos_prof = cliente.get("/cursos/todos", headers=cabecalho_prof).json()
checar("Professor vê apenas seus 2 cursos", len(cursos_prof) == 2, str(len(cursos_prof)))

gestao_alunos = cliente.get("/alunos/todos", headers=cabecalho_gestao)
checar("Gestão é bloqueada em /alunos (403)", gestao_alunos.status_code == 403, str(gestao_alunos.status_code))

# ── 3. Consultas acadêmicas ───────────────────────────────────────────────────
print("\n3. CONSULTAS ACADÊMICAS")
alunos_admin = cliente.get("/alunos/todos", headers=cabecalho_admin).json()
checar("Admin lista os 15 alunos do seed", len(alunos_admin) == 15, str(len(alunos_admin)))

turmas_eng = cliente.get("/cursos/ENGSOFT/turmas", headers=cabecalho_admin).json()
checar("ENGSOFT possui 3 turmas", len(turmas_eng) == 3, str(len(turmas_eng)))

aluno = cliente.get("/alunos/A001", headers=cabecalho_admin)
checar("GET /alunos/A001 retorna o aluno", aluno.status_code == 200 and aluno.json()["nome"].startswith("Ana"))

inexistente = cliente.get("/alunos/ZZZ", headers=cabecalho_admin)
checar("Aluno inexistente retorna 404", inexistente.status_code == 404, str(inexistente.status_code))

# ── 4. Estatística ────────────────────────────────────────────────────────────
print("\n4. ESTATÍSTICA E KPIs")
kpis = cliente.get("/estatisticas/gerais", headers=cabecalho_admin).json()
checar("KPIs trazem totalAlunos", "totalAlunos" in kpis, str(kpis))

est = cliente.get("/estatisticas/avancadas", headers=cabecalho_admin).json()
chaves_ok = all(k in est for k in ("regressao", "variancia", "mediaMediana", "homogeneidade", "desvioPadrao", "registros"))
checar("Estatísticas avançadas têm as 6 seções", chaves_ok)
checar("Regressão calcula r² (correlação freq×nota)", isinstance(est["regressao"]["r2"], (int, float)),
       str(est["regressao"]["r2"]))

# ── 5. Predição ───────────────────────────────────────────────────────────────
print("\n5. PREDIÇÃO")
pred = cliente.get("/predicao/A001", headers=cabecalho_admin)
checar("Predição de A001 responde 200", pred.status_code == 200)
if pred.status_code == 200:
    corpo = pred.json()
    checar("Predição tem 'risco' e 'irc' (compatível com o front)",
           "risco" in corpo and "irc" in corpo)
    checar("Predição inclui motorPredicao + scoreRisco",
           "motorPredicao" in corpo and "scoreRisco" in corpo)

batch = cliente.post("/predicao/batch", headers=cabecalho_admin, json={"alunoIds": ["A001", "A003", "ZZZ"]})
checar("Batch ignora IDs inválidos e prediz os válidos",
       batch.status_code == 200 and len(batch.json()) == 2, str(batch.status_code))

# ── 6. Notificações / Intervenção ─────────────────────────────────────────────
print("\n6. NOTIFICAÇÕES E INTERVENÇÃO (WHATSAPP)")
gerar = cliente.post("/notificacoes/intervencao/gerar", headers=cabecalho_admin, json={"alunoId": "A001"})
checar("Geração de intervenção devolve 3 modelos",
       gerar.status_code == 200 and len(gerar.json()) == 3, str(gerar.status_code))

enviar = cliente.post(
    "/notificacoes/intervencao/enviar",
    headers=cabecalho_admin,
    json={"alunoIds": ["A001", "A007"], "tipo": "faltas", "canal": "WhatsApp"},
)
checar("Envio de intervenção confirma 2 mensagens",
       enviar.status_code == 200 and enviar.json()["enviados"] == 2, str(enviar.status_code))

hist = cliente.get("/notificacoes/historico", headers=cabecalho_admin).json()
checar("Histórico de envios tem 3 registros", len(hist) == 3, str(len(hist)))

# ── 7. Lyceum ─────────────────────────────────────────────────────────────────
print("\n7. INTEGRAÇÃO LYCEUM")
sync = cliente.post("/lyceum/sync", headers=cabecalho_admin).json()
checar("Sincronização Lyceum retorna ok=True", sync.get("ok") is True)
status = cliente.get("/lyceum/status", headers=cabecalho_admin).json()
checar("Status reflete a sincronização", status.get("status") == "sincronizado", str(status))

# ── Resumo ────────────────────────────────────────────────────────────────────
print("\n" + "=" * 48)
print(f"  RESULTADO: {_total['ok']} passaram | {_total['falhou']} falharam")
print("=" * 48)
sys.exit(1 if _total["falhou"] else 0)
