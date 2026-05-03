/**
 * utils.js — Funções utilitárias compartilhadas
 * Notas em escala 0-100 conforme banco de dados real
 */

const Utils = {
  saudacao() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  },

  fmt2(n) { return typeof n === 'number' ? n.toFixed(2) : '—'; },
  fmtPct(n) { return typeof n === 'number' ? `${n.toFixed(1)}%` : '—'; },

  /** Classe CSS da nota (escala 0-100) */
  notaClass(nota) {
    if (nota >= 70) return 'nota-alta';
    if (nota >= 50) return 'nota-media';
    return 'nota-baixa';
  },

  /** Cor CSS da nota (escala 0-100) */
  notaColor(nota) {
    if (nota >= 70) return 'var(--green)';
    if (nota >= 50) return 'var(--yellow)';
    return 'var(--red)';
  },

  /** Badge da situação do aluno */
  situacaoBadge(sit) {
    const map = {
      'Aprovado':           { cls: 'green',  label: 'Aprovado' },
      'Reprovado':          { cls: 'red',    label: 'Reprovado' },
      'Reprovado por Falta':{ cls: 'orange', label: 'Rep. Falta' },
      'Cursando':           { cls: 'blue',   label: 'Cursando' },
      'Evadido':            { cls: 'gray',   label: 'Evadido' },
    };
    return map[sit] || { cls: 'gray', label: sit || '—' };
  },

  /** Badge de nível de risco */
  riscoBadge(nivel) {
    const map = {
      baixo:   { cls: 'green',  label: 'Baixo'   },
      medio:   { cls: 'yellow', label: 'Médio'   },
      alto:    { cls: 'orange', label: 'Alto'    },
      critico: { cls: 'red',    label: 'Crítico' },
    };
    return map[nivel] || { cls: 'gray', label: nivel };
  },

  /**
   * Converte IRC do formato "25/100" para número.
   * parseInt("25/100") → 25 (JS para no '/')
   */
  parseIRC(ircStr) {
    if (typeof ircStr === 'number') return ircStr;
    return parseInt(String(ircStr)) || 0;
  },

  /** Mapeia score IRC (0-100) para nível de risco */
  ircToNivel(irc) {
    if (irc <= 25) return 'baixo';
    if (irc <= 50) return 'medio';
    if (irc <= 75) return 'alto';
    return 'critico';
  },

  /** Calcula média das notas VA1+VA2+VA3 (escala 0-100) */
  calcMedia(rec) {
    const v1 = rec.va1 ?? 0;
    const v2 = rec.va2 ?? 0;
    const v3 = rec.va3 ?? 0;
    return (v1 + v2 + v3) / 3;
  },

  /** Nome de exibição do aluno (API não retorna nome) */
  nomeAluno(id) { return `Aluno #${id}`; },

  /** Período formatado: "2024.1" */
  periodo(ano, semestre) { return `${ano}.${semestre}`; },
};

window.Utils = Utils;
