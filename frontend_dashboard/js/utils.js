/**
 * utils.js — Predicta
 * Funções auxiliares: saudação dinâmica, formatação, helpers.
 */

/** Retorna saudação baseada no horário local */
export function getGreeting(nome = '') {
  const h = new Date().getHours();
  let saudacao;
  if (h >= 5 && h < 12)  { saudacao = 'Bom dia';   }
  else if (h >= 12 && h < 18) { saudacao = 'Boa tarde'; }
  else                         { saudacao = 'Boa noite'; }

  return nome
    ? `${saudacao}, ${nome}!`
    : `${saudacao}!`;
}

/** Retorna período acadêmico atual simulado */
export function getCurrentPeriod() {
  const d = new Date();
  const y = d.getFullYear();
  const sem = d.getMonth() < 6 ? 1 : 2;
  return `${y}.${sem}`;
}

/** Formata número com separador de milhar */
export function fmtNum(n) {
  return Number(n).toLocaleString('pt-BR');
}

/** Formata porcentagem */
export function fmtPct(n, decimals = 1) {
  return `${Number(n).toFixed(decimals)}%`;
}

/** Formata nota com 1 decimal */
export function fmtNota(n) {
  return Number(n).toFixed(1);
}

/** Retorna classe CSS de cor baseada no risco */
export function getRiscoClass(risco) {
  switch (risco) {
    case 'alto':  return 'risco-alto';
    case 'medio': return 'risco-medio';
    case 'baixo': return 'risco-baixo';
    default:      return '';
  }
}

/** Retorna badge HTML de risco */
export function getRiscoBadge(risco) {
  switch (risco) {
    case 'alto':  return '<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:\'Poppins\', sans-serif;"><span style="color:var(--red); font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>Risco Alto</span>';
    case 'medio': return '<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:\'Poppins\', sans-serif;"><span style="color:var(--yellow); font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>Risco Médio</span>';
    case 'baixo': return '<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:\'Poppins\', sans-serif;"><span style="color:var(--green); font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>Risco Baixo</span>';
    default:      return '<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:\'Poppins\', sans-serif;"><span style="color:#9e9e9e; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>–</span>';
  }
}

/** Retorna badge de nota */
export function getNotaBadge(nota) {
  const n = Number(nota);
  if (isNaN(n) || nota === '–' || nota === null || nota === '') return `<span style="color:var(--text-muted);">–</span>`;
  if (n >= 7) return `<span style="color:var(--text-strong); font-weight:700;"><span style="color:var(--green); font-size:.85rem; margin-right:4px;">▲</span>${fmtNota(n)}</span>`;
  if (n >= 5) return `<span style="color:var(--text-strong); font-weight:700;"><span style="color:var(--yellow); font-size:.85rem; margin-right:4px;">▶</span>${fmtNota(n)}</span>`;
  return `<span style="color:var(--text-strong); font-weight:700;"><span style="color:var(--red); font-size:.85rem; margin-right:4px;">▼</span>${fmtNota(n)}</span>`;
}

/** Retorna subtítulo de greeting (removido a pedido) */
export function getGreetingSub(role) {
  return `Bem-vindo ao <img src="Predicta_sem_símbolo.png" alt="Predicta" style="height: .85rem; vertical-align: middle; margin-left: 3px; margin-top: -3px; object-fit: contain;">`;
}

/** Formata data para exibição */
export function fmtDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

/** Debounce helper */
export function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Cria elemento HTML a partir de string */
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}

/** Escape HTML para prevenir XSS */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

