/**
 * Dashboard.js — Predicta
 * Visão Geral: KPIs + grade de turmas ativas (sem gráfico de linha).
 * Role-based: admin/gestao veem tudo; academico vê apenas suas turmas.
 */

import { state }                    from '../state.js';
import { getRiscoBadge, fmtNum, fmtPct, fmtNota } from '../utils.js';
import { openInterventionModal }    from '../components/InterventionModal.js';

export async function renderDashboard(container) {
  const role  = state.get('currentRole');
  const kpis  = state.getKpis();
  const turmas = state.getTurmas();

  // ─── Label do período ──────────────────────────────────────
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) {
    periodoEl.innerHTML = `
      <span>Período: <strong>26/03/2026 a 26/05/2026</strong></span>
      <span class="period-badge">Semana 8/12</span>
    `;
  }

  // ─── Label de visão ───────────────────────────────────────
  const isAdmin   = role === 'admin';
  const isGestao  = role === 'gestao';
  const isAcademic = role === 'academico';

  const sectionLabel = isAdmin
    ? 'Todas as Turmas em Risco (Visão Global)'
    : isGestao
    ? 'Meus Cursos em Risco (Visão Geral)'
    : 'Minhas Turmas em Risco (Visão Geral)';

  // ─── KPI Cards ────────────────────────────────────────────
  const kpiCards = [
    {
      label: isAcademic ? 'Total de Alunos' : 'Total de Alunos',
      value: fmtNum(kpis.totalAlunos),
      desc:  `${fmtNum(kpis.turmasAtivas)} turmas ativas`,
      color: '',
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`,
    },
    {
      label: 'Em Risco',
      value: fmtNum(kpis.emRisco),
      desc:  `${((kpis.emRisco / kpis.totalAlunos) * 100).toFixed(1)}% do total`,
      color: 'kpi-red',
      valueColor: 'red',
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
    },
    {
      label: 'Taxa de Aprovação',
      value: fmtPct(kpis.taxaAprovacao),
      desc:  kpis.taxaAprovacao >= 75 ? '✅ Acima da meta (75%)' : '⚠️ Abaixo da meta (75%)',
      color: kpis.taxaAprovacao >= 75 ? 'kpi-green' : 'kpi-yellow',
      valueColor: kpis.taxaAprovacao >= 75 ? 'green' : 'yellow',
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`,
    },
    {
      label: isAcademic ? 'Disciplinas Ativas' : 'Cursos Ativos',
      value: isAcademic ? fmtNum(kpis.turmasAtivas) : fmtNum(kpis.cursosAtivos),
      desc:  `Frequência média: ${fmtPct(kpis.taxaFrequencia)}`,
      color: '',
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>`,
    },
  ];

  // ─── Turma rows (tabela) ───────────────────────────────────
  const turmasRows = turmas.map(t => {
    const pctRisco = ((t.emRisco / t.alunos) * 100).toFixed(0);
    const freqLabel = t.taxaFreq >= 85 ? 'Alta' : t.taxaFreq >= 75 ? 'Média' : 'Baixa';
    const freqColor = t.taxaFreq >= 85 ? 'var(--green)' : t.taxaFreq >= 75 ? 'var(--yellow)' : 'var(--red)';

    return `
      <tr>
        <td style="font-weight:700;color:var(--blue-dark);">
          ${isGestao ? t.cursoId : t.nome.replace(' — ', ' ')}
        </td>
        <td>${fmtNum(t.alunos)}</td>
        <td>
          <span style="color:${t.emRisco > 10 ? 'var(--red)' : 'var(--yellow)'}; font-weight:700;">
            ${fmtNum(t.emRisco)} alunos (${pctRisco}%)
          </span>
        </td>
        <td style="color:${freqColor}; font-weight:700;">
          ${fmtPct(t.taxaFreq, 0)} <small style="font-weight:400;color:var(--text-muted);">(${freqLabel})</small>
        </td>
        <td>
          <span style="color:var(--blue-dark);font-weight:700;">${fmtNota(t.mediaGeral)}</span>
        </td>
        <td>${getRiscoBadge(t.risco)}</td>
        <td>
          ${t.risco !== 'baixo' ? `
            <button class="btn-intervene btn-intervene-turma" data-turma="${t.id}"
                    style="font-size:.72rem;padding:5px 10px;border:none;cursor:pointer;border-radius:6px;
                    background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-weight:700;
                    display:inline-flex;align-items:center;gap:4px;">
              ✉️ Intervir
            </button>
          ` : '<span style="color:var(--text-muted);font-size:.75rem;">—</span>'}
        </td>
      </tr>
    `;
  }).join('');

  // ─── Render HTML ──────────────────────────────────────────
  container.innerHTML = `
    <div class="page-fade-in">

      <!-- KPI Grid -->
      <div class="kpi-grid">
        ${kpiCards.map(k => `
          <div class="kpi-card ${k.color}">
            <div class="kpi-icon">${k.icon}</div>
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value ${k.valueColor || ''}">${k.value}</div>
            <div class="kpi-desc">${k.desc}</div>
          </div>
        `).join('')}
      </div>

      <!-- Detalhamento btn + label -->
      <div class="section-header" style="margin-bottom:14px;">
        <div class="section-title">
          📋 ${sectionLabel}
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span style="font-size:.78rem;color:var(--text-muted);">${turmas.length} turmas encontradas</span>
        </div>
      </div>

      <!-- Turmas Table -->
      <div class="section-card" style="padding:0;overflow:hidden;">
        <div class="table-wrap">
          <table id="turmas-table">
            <thead>
              <tr>
                <th>${isGestao ? 'Curso' : 'Turma'}</th>
                <th>Total de Alunos</th>
                <th>Alunos em Risco</th>
                <th>Frequência</th>
                <th>Média</th>
                <th>Status</th>
                <th>Intervir</th>
              </tr>
            </thead>
            <tbody>${turmasRows}</tbody>
          </table>
        </div>
      </div>

      ${role !== 'gestao' ? `
      <!-- Grade Visual de Turmas -->
      <div style="margin-top:24px;">
        <div class="section-header">
          <div class="section-title">🗂️ Grade Visual de Turmas</div>
        </div>
        <div class="turma-grid" id="turma-grid">
          ${turmas.map(t => `
            <div class="turma-card ${t.risco === 'alto' ? 'risco-alto' : t.risco === 'medio' ? 'risco-medio' : 'risco-baixo'}">
              <div class="turma-card-header">
                <div>
                  <div class="turma-card-nome">${t.nome.split('—')[0].trim()}</div>
                  <div class="turma-card-serie">${t.serie} · ${t.professor}</div>
                </div>
                ${getRiscoBadge(t.risco)}
              </div>
              <div class="turma-card-stats">
                <div class="turma-stat">
                  <span class="turma-stat-val">${fmtNum(t.alunos)}</span>
                  <span class="turma-stat-label">Alunos</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val" style="color:var(--red);">${fmtNum(t.emRisco)}</span>
                  <span class="turma-stat-label">Em Risco</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val">${fmtNota(t.mediaGeral)}</span>
                  <span class="turma-stat-label">Média</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val">${fmtPct(t.taxaFreq, 0)}</span>
                  <span class="turma-stat-label">Freq.</span>
                </div>
              </div>
              <div class="turma-card-footer">
                ${t.risco !== 'baixo' ? `
                  <button class="btn-intervene btn-intervene-turma" data-turma="${t.id}"
                          style="border:none;cursor:pointer;">
                    ✉️ Gerar Intervenção
                  </button>
                ` : `<span style="color:var(--green);font-size:.75rem;font-weight:600;">✅ Situação OK</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

    </div>
  `;

  // ─── Event listeners: botões de intervenção ────────────────
  container.querySelectorAll('.btn-intervene-turma').forEach(btn => {
    btn.addEventListener('click', () => {
      const turmaId = btn.dataset.turma;
      const turma   = state.getTurmas().find(t => t.id === turmaId);
      const alunos  = state.getAlunos(turmaId).filter(a => a.risco !== 'baixo');
      if (alunos.length > 0) {
        // Abre intervenção para o primeiro aluno em risco da turma
        openInterventionModal(alunos[0], turmaId);
      }
    });
  });
}
