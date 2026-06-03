/**
 * Dashboard.js — Predicta
 * Visão Geral: KPIs + grade de turmas ativas (sem gráfico de linha).
 * Role-based: admin/gestao veem tudo; academico vê apenas suas turmas.
 */

import { state } from '../state.js';
import { getRiscoBadge, fmtNum, fmtPct, fmtNota } from '../utils.js';
import { openInterventionModal } from '../components/InterventionModal.js';

export async function renderDashboard(container) {
  const role = state.get('currentRole');
  const kpis = state.getKpis();
  const turmas = state.getTurmas();

  // ─── Label do período ──────────────────────────────────────
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) {
    periodoEl.innerHTML = `
      <div style="font-family:'Poppins', sans-serif; font-size:1.05rem; color:var(--text-main); display:flex; align-items:center;">
        <strong style="margin-right:6px;">Período:</strong> 26/03/2026 a 26/05/2026
      </div>
      <div style="font-family:'Poppins', sans-serif; font-size:1.05rem; color:var(--text-main); display:flex; flex-direction:column; gap:4px; margin-left:12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <strong>Semana</strong> 6 <span style="font-weight:300; font-size:1.15rem; color:var(--text-main);">|</span> 12
        </div>
        <div style="display:flex; width:100%; height:6px; border-radius:4px; overflow:hidden;">
          <div style="width:50%; background:var(--green);"></div>
          <div style="width:50%; background:var(--green); opacity:0.3;"></div>
        </div>
      </div>
    `;
  }

  // ─── Label de visão ───────────────────────────────────────
  const isAdmin = role === 'admin';
  const isGestao = role === 'gestao';
  const isAcademic = role === 'academico';

  const sectionLabel = isAdmin
    ? 'Todas as Turmas em Risco (Visão Global)'
    : isGestao
      ? 'Meus Cursos em Risco (Visão Geral)'
      : 'Minhas Turmas em Risco (Visão Geral)';

  // ─── KPI Cards (Personalizados conforme design Figma) ───────────
  // Calcula uma média geral simulada a partir das turmas
  const mediaGeral = (turmas.reduce((acc, t) => acc + t.mediaGeral, 0) / (turmas.length || 1)).toFixed(1);

  const customKpiHtml = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:22px;">
      <!-- Card 1: Média Geral -->
      <div style="background:var(--bg-card); border-radius:35px; padding:32px 36px; box-shadow:var(--shadow-md); position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:220px; transition:background 0.2s;">
        <div style="position:absolute; top:28px; left:36px; font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:600; color:var(--text-main); line-height:1.2; white-space:nowrap;">
          ${isGestao ? 'Média geral dos cursos' : 'Média geral das minhas turmas'}
        </div>
        <div style="position:absolute; top:28px; right:36px; background:var(--blue-primary); color:var(--bg-page); border-radius:4px; padding:6px 14px; font-family:'Poppins', sans-serif; font-size:.95rem; font-weight:600;">
          Alvo: 7.5
        </div>
        <div style="font-family:'Poppins', sans-serif; font-size:5.5rem; font-weight:700; color:var(--blue-primary); line-height:1; margin-top:20px;">
          ${mediaGeral}/10
        </div>
        <div style="font-family:'Poppins', sans-serif; font-size:.85rem; font-weight:600; color:var(--text-main); margin-top:10px;">
          Leve Alta vs. Semana Anterior (+0.2)
        </div>
      </div>

      <!-- Card 2: Frequência Média -->
      <div style="background:var(--bg-card); border-radius:35px; padding:32px 36px; box-shadow:var(--shadow-md); position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:220px; transition:background 0.2s;">
        <div style="position:absolute; top:28px; left:36px; font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:600; color:var(--text-main); line-height:1.2; white-space:nowrap;">
          Frequência Média de Alunos
        </div>
        <div style="font-family:'Poppins', sans-serif; font-size:5.5rem; font-weight:700; color:var(--blue-primary); line-height:1; margin-top:20px;">
          ${fmtPct(kpis.taxaFrequencia, 0)}
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-family:'Poppins', sans-serif; font-size:.85rem; font-weight:600; color:var(--text-main); margin-top:10px;">
          Estável <span style="width:12px; height:12px; background:var(--green); border-radius:50%; display:inline-block;"></span>
        </div>
      </div>
    </div>
  `;

  // ─── Turma rows (tabela) ───────────────────────────────────
  const turmasRows = turmas.map((t, index) => {
    const pctRisco = ((t.emRisco / t.alunos) * 100).toFixed(0);

    // Frequência
    let freqLabel = 'Alta';
    let freqIcon = '▲';
    let freqColor = 'var(--green)'; // Green
    if (t.taxaFreq < 75) {
      freqLabel = 'Baixa';
      freqIcon = '▼';
      freqColor = 'var(--red)';
    } else if (t.taxaFreq < 85) {
      freqLabel = 'Média';
      freqIcon = '▲';
      freqColor = 'var(--yellow)';
    }

    // Média
    let mediaColor = 'var(--green)';
    if (t.mediaGeral < 5) mediaColor = 'var(--red)';
    else if (t.mediaGeral < 7) mediaColor = 'var(--yellow)';

    // Status
    let statusLabel = 'Risco Baixo';
    let statusColor = 'var(--green)';
    if (t.risco === 'alto') {
      statusLabel = 'Risco alto';
      statusColor = 'var(--red)';
    } else if (t.risco === 'medio') {
      statusLabel = 'Risco Médio';
      statusColor = 'var(--yellow)';
    }

    const solidEnvelope = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>`;

    return `
      <tr style="background: ${index % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)'};">
        <td style="font-weight:600; color:var(--text-strong); padding:16px;">
          ${isGestao ? t.cursoId : t.nome.replace(' — ', ' ')}
        </td>
        <td style="font-weight:700; color:var(--text-strong); text-align:center; padding:16px;">
          ${fmtNum(t.alunos)}
        </td>
        <td style="font-weight:700; color:var(--text-strong); text-align:center; padding:16px;">
          ${fmtNum(t.emRisco)} alunos (${pctRisco}%)
        </td>
        <td style="font-weight:700; color:var(--text-strong); text-align:center; padding:16px;">
          ${fmtPct(t.taxaFreq, 0)} <span style="color:${freqColor}; font-size:.85rem; margin-left:2px;">${freqIcon}</span><span style="font-weight:500; color:var(--text-strong); margin-left:2px;">(${freqLabel})</span>
        </td>
        <td style="font-weight:700; color:var(--text-strong); text-align:center; padding:16px;">
          <span style="color:${mediaColor}; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;"></span>${fmtNota(t.mediaGeral)}
        </td>
        <td style="font-weight:700; color:var(--text-strong); text-align:center; padding:16px;">
          <span style="color:${statusColor}; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>${statusLabel}
        </td>
        <td style="text-align:center; padding:16px;">
          ${t.risco !== 'baixo' ? `
          <button class="btn-intervene btn-intervene-turma" data-turma="${t.id}"
                  style="background:transparent; color:var(--text-strong); border:none; cursor:pointer; padding:0; display:inline-flex; align-items:center; justify-content:center; transition:transform 0.2s;"
                  onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            ${solidEnvelope}
          </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  // ─── Render HTML ──────────────────────────────────────────
  container.innerHTML = `
    <div class="page-fade-in">

      <!-- KPI Grid Customizado -->
      ${customKpiHtml}

      <!-- Turmas Table -->
      <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:24px;">
        <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:700; color:var(--text-main);">${sectionLabel}</div>
          <div style="font-family:'Poppins', sans-serif; font-size:.85rem; color:var(--text-muted);">${turmas.length} turmas encontradas</div>
        </div>
        <div class="table-wrap" style="width:100%; overflow-x:auto;">
          <table id="turmas-table" style="width:100%; border-collapse:collapse; min-width:800px; font-family:'Poppins', sans-serif;">
            <thead>
              <tr style="background:var(--blue-primary); color:var(--bg-page);">
                <th style="padding:16px; text-align:left; font-weight:600; font-size:1.05rem;">${isGestao ? 'Curso:' : 'Turma:'}</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Total de Alunos:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Alunos em Risco:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Frequência:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Média:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Status:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Intervir</th>
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
          <div class="section-title">Grade Visual de Turmas</div>
        </div>
        <div class="turma-grid" id="turma-grid">
          ${turmas.map(t => `
            <div class="turma-card ${t.risco === 'alto' ? 'risco-alto' : t.risco === 'medio' ? 'risco-medio' : 'risco-baixo'}">
              <div class="turma-card-header">
                <div style="flex:1; padding-right:8px;">
                  <div class="turma-card-nome">${t.nome.split('—')[0].trim()}</div>
                  <div class="turma-card-serie">${t.serie} · ${t.professor}</div>
                </div>
                <div style="white-space:nowrap; flex-shrink:0;">
                  ${getRiscoBadge(t.risco)}
                </div>
              </div>
              <div class="turma-card-stats">
                <div class="turma-stat">
                  <span class="turma-stat-val" style="color:var(--text-strong);">${fmtNum(t.alunos)}</span>
                  <span class="turma-stat-label">Alunos</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val" style="color:var(--text-strong);"><span style="color:var(--red); font-size:.9rem; line-height:0; margin-right:2px;">●</span>${fmtNum(t.emRisco)}</span>
                  <span class="turma-stat-label">Em Risco</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val" style="color:var(--text-strong);"><span style="color:${t.mediaGeral < 5 ? 'var(--red)' : t.mediaGeral < 7 ? 'var(--yellow)' : 'var(--green)'}; font-size:.9rem; line-height:0; margin-right:2px;">●</span>${fmtNota(t.mediaGeral)}</span>
                  <span class="turma-stat-label">Média</span>
                </div>
                <div class="turma-stat">
                  <span class="turma-stat-val" style="color:var(--text-strong);"><span style="color:${t.taxaFreq < 75 ? 'var(--red)' : t.taxaFreq < 85 ? 'var(--yellow)' : 'var(--green)'}; font-size:.9rem; line-height:0; margin-right:2px;">●</span>${fmtPct(t.taxaFreq, 0)}</span>
                  <span class="turma-stat-label">Freq.</span>
                </div>
              </div>
              <div class="turma-card-footer">
                ${t.risco !== 'baixo' ? `
                  <span style="color:var(--blue-primary); font-size:.85rem; font-weight:600; font-family:'Poppins', sans-serif;">Precisa de intervenção</span>
                ` : `<span style="color:var(--blue-primary); font-size:.85rem; font-weight:600; font-family:'Poppins', sans-serif;">Situação OK</span>`}
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
      const turma = state.getTurmas().find(t => t.id === turmaId);
      const alunos = state.getAlunos(turmaId).filter(a => a.risco !== 'baixo');
      if (alunos.length > 0) {
        // Abre intervenção para o primeiro aluno em risco da turma
        openInterventionModal(alunos[0], turmaId);
      }
    });
  });
}

