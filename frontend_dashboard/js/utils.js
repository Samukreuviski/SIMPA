/**
 * utils.js — Predicta
 * Funções auxiliares: saudação dinâmica, formatação, helpers.
 */

/** Retorna saudação baseada no horário local */
export function getGreeting(nome = '') {
  const h = new Date().getHours();
  let saudacao, emoji;
  if (h >= 5 && h < 12)  { saudacao = 'Bom dia';   emoji = '☀️'; }
  else if (h >= 12 && h < 18) { saudacao = 'Boa tarde'; emoji = '🌤️'; }
  else                         { saudacao = 'Boa noite'; emoji = '🌙'; }

  return nome
    ? `${saudacao}, ${nome}! ${emoji}`
    : `${saudacao}! ${emoji}`;
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
    case 'alto':  return '<span class="badge badge-red">🔴 Risco Alto</span>';
    case 'medio': return '<span class="badge badge-yellow">🟡 Risco Médio</span>';
    case 'baixo': return '<span class="badge badge-green">🟢 Risco Baixo</span>';
    default:      return '<span class="badge badge-gray">–</span>';
  }
}

/** Retorna badge de nota */
export function getNotaBadge(nota) {
  const n = Number(nota);
  if (n >= 7) return `<span class="nota-alta">${fmtNota(n)}</span>`;
  if (n >= 5) return `<span class="nota-media">${fmtNota(n)}</span>`;
  return `<span class="nota-baixa">${fmtNota(n)}</span>`;
}

/** Retorna subtítulo de greeting baseado no perfil */
export function getGreetingSub(role) {
  switch (role) {
    case 'admin':    return 'Visão completa do sistema — todos os cursos e turmas.';
    case 'gestao':   return 'Resumo preditivo geral dos seus cursos e indicadores.';
    case 'academico':return 'Resumo preditivo das suas turmas e alertas de alunos.';
    default:         return '';
  }
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
