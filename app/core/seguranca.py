"""
seguranca.py — Primitivas de segurança (sem dependências externas).

Implementa dois mecanismos exigidos pelos princípios básicos de segurança:

1. **Hash de senha** com PBKDF2-HMAC-SHA256 (salt aleatório por senha + muitas
   iterações). As senhas NUNCA são guardadas em texto puro.
2. **JWT (JSON Web Token)** assinado com HMAC-SHA256, implementado com a
   biblioteca padrão do Python para não exigir `python-jose`/`PyJWT`. O token
   carrega o perfil do usuário e expira após um tempo configurável.

Comparações sensíveis usam `hmac.compare_digest` para evitar ataques de tempo.
"""

import base64
import hashlib
import hmac
import json
import os
import time

# ── Helpers de Base64 URL-safe (sem '=' de padding, como manda o padrão JWT) ──


def _b64url_encode(dado: bytes) -> str:
    return base64.urlsafe_b64encode(dado).rstrip(b"=").decode("ascii")


def _b64url_decode(texto: str) -> bytes:
    # Recoloca o padding removido antes de decodificar.
    padding = "=" * (-len(texto) % 4)
    return base64.urlsafe_b64decode(texto + padding)


# ── Hash de senha (PBKDF2) ────────────────────────────────────────────────────

_ITERACOES = 120_000


def gerar_hash_senha(senha: str, salt: bytes | None = None) -> str:
    """Gera um hash seguro no formato `pbkdf2_sha256$iteracoes$salt$digest`."""
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, _ITERACOES)
    return (
        f"pbkdf2_sha256${_ITERACOES}$"
        f"{base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"
    )


def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    """Confere uma senha em texto puro contra o hash salvo (tempo-constante)."""
    try:
        algoritmo, iteracoes, salt_b64, digest_b64 = hash_armazenado.split("$")
        if algoritmo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        esperado = base64.b64decode(digest_b64)
        calculado = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, int(iteracoes))
        return hmac.compare_digest(calculado, esperado)
    except (ValueError, TypeError):
        return False


# ── JWT (HMAC-SHA256) ─────────────────────────────────────────────────────────


class TokenInvalido(Exception):
    """Levantada quando um JWT é malformado, adulterado ou expirado."""


def criar_token(dados: dict, chave_secreta: str, expira_minutos: int, algoritmo: str = "HS256") -> str:
    """Cria um JWT assinado contendo `dados` + carimbos `iat`/`exp`."""
    if algoritmo != "HS256":
        raise ValueError("Apenas HS256 é suportado por esta implementação didática.")

    cabecalho = {"alg": "HS256", "typ": "JWT"}
    agora = int(time.time())
    payload = {**dados, "iat": agora, "exp": agora + expira_minutos * 60}

    seg_cabecalho = _b64url_encode(json.dumps(cabecalho, separators=(",", ":")).encode())
    seg_payload = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    base_assinatura = f"{seg_cabecalho}.{seg_payload}".encode("ascii")
    assinatura = hmac.new(chave_secreta.encode("utf-8"), base_assinatura, hashlib.sha256).digest()

    return f"{seg_cabecalho}.{seg_payload}.{_b64url_encode(assinatura)}"


def decodificar_token(token: str, chave_secreta: str) -> dict:
    """Valida assinatura e expiração, devolvendo o payload. Levanta `TokenInvalido`."""
    try:
        seg_cabecalho, seg_payload, seg_assinatura = token.split(".")
    except ValueError as exc:
        raise TokenInvalido("Token mal formatado.") from exc

    # Recalcula a assinatura e compara em tempo constante.
    base_assinatura = f"{seg_cabecalho}.{seg_payload}".encode("ascii")
    esperada = hmac.new(chave_secreta.encode("utf-8"), base_assinatura, hashlib.sha256).digest()
    if not hmac.compare_digest(esperada, _b64url_decode(seg_assinatura)):
        raise TokenInvalido("Assinatura inválida — token possivelmente adulterado.")

    payload = json.loads(_b64url_decode(seg_payload))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise TokenInvalido("Token expirado. Faça login novamente.")

    return payload
