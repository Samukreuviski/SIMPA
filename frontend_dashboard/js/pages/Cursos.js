/**
 * Cursos.js — Predicta
 * Navegação em cascata: Cursos → Turmas → Alunos
 * Botão proeminente "Conectar ao Lyceum"
 */

import { state }                 from '../state.js';
import { getRiscoBadge, fmtNum, fmtNota, fmtPct } from '../utils.js';
import { openInterventionModal } from '../components/InterventionModal.js';
import { syncLyceum }            from '../api.js';
import { showToast }             from '../components/Modal.js';

let _currentCursoId = null;
let _currentTurmaId = null;

export async function renderCursos(container) {
  _currentCursoId = null;
  _currentTurmaId = null;

  // Reset period label
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) periodoEl.innerHTML = '';

  renderCursosList(container);
}

// ── NÍVEL 1: Lista de Cursos ──────────────────────────────────
function renderCursosList(container) {
  const cursos = state.getCursos();

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Botão Lyceum (hero) -->
      <div style="background:linear-gradient(135deg,var(--blue-dark),var(--blue-deep));
          border-radius:var(--radius);padding:28px 32px;margin-bottom:28px;
          display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;
          box-shadow:var(--shadow-lg);">
        <div>
          <div style="color:rgba(255,255,255,.65);font-size:.8rem;font-weight:600;
              text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">
            🔗 Integração Institucional
          </div>
          <div style="color:#fff;font-size:1.2rem;font-weight:800;margin-bottom:6px;">
            Portal Académico Lyceum
          </div>
          <div style="color:rgba(255,255,255,.65);font-size:.85rem;max-width:460px;">
            Sincronize matrícula, notas e frequência diretamente do sistema acadêmico da UniEVANGÉLICA.
            Última sincronização: <strong style="color:rgba(255,255,255,.85);">há 5 dias</strong>
          </div>
        </div>
        <button class="btn-lyceum" id="btn-lyceum" type="button">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.49"/>
          </svg>
          Conectar ao Lyceum
        </button>
      </div>

      <!-- Breadcrumb -->
      <div class="breadcrumb" id="breadcrumb">
        <span class="breadcrumb-current">Cursos</span>
      </div>

      <!-- Header -->
      <div class="section-header">
        <div class="section-title">
          📚 Cursos Disponíveis
          <span class="section-badge">${cursos.length}</span>
        </div>
      </div>

      <!-- Grid de cursos -->
      <div class="cursos-grid" id="cursos-grid">
        ${cursos.map(c => `
          <div class="curso-card risco-${c.risco}" data-curso="${c.id}" tabindex="0" role="button">
            <div class="curso-card-codigo">${c.codigo} · ${c.id}</div>
            <div class="curso-card-nome">${c.nome}</div>
            <div class="curso-card-stats">
              <div class="curso-stat">
                <span class="curso-stat-val">${fmtNum(c.alunos)}</span>
                <span class="curso-stat-label">Alunos</span>
              </div>
              <div class="curso-stat">
                <span class="curso-stat-val">${c.turmas}</span>
                <span class="curso-stat-label">Turmas</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              ${getRiscoBadge(c.risco)}
              <span style="font-size:.78rem;color:var(--blue-primary);font-weight:600;">
                Ver turmas →
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // ─── Lyceum sync ──────────────────────────────────────────
  const btnLyceum = container.querySelector('#btn-lyceum');
  btnLyceum?.addEventListener('click', async () => {
    btnLyceum.disabled = true;
    btnLyceum.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" style="animation:spin 1s linear infinite;">
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
      </svg>
      Sincronizando...
    `;
    try {
      const res = await syncLyceum();
      showToast(`✅ Lyceum sincronizado! ${fmtNum(res.sincronizados)} registros atualizados.`, 'success', 4000);
    } catch {
      showToast('❌ Falha na sincronização. Tente novamente.', 'error');
    }
    btnLyceum.disabled = false;
    btnLyceum.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.49"/>
      </svg>
      Conectar ao Lyceum
    `;
  });

  // ─── Clique no curso → turmas ─────────────────────────────
  container.querySelectorAll('.curso-card').forEach(card => {
    card.addEventListener('click', () => {
      _currentCursoId = card.dataset.curso;
      renderTurmasList(container, _currentCursoId);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });
}

// ── NÍVEL 2: Lista de Turmas ──────────────────────────────────
function renderTurmasList(container, cursoId) {
  const curso  = state.getCursos().find(c => c.id === cursoId);
  const turmas = state.getTurmas(cursoId);

  container.innerHTML = `
    <div class="page-fade-in">
      <div class="breadcrumb" id="breadcrumb">
        <span class="breadcrumb-item" id="bc-cursos">Cursos</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${curso?.nome}</span>
      </div>

      <div class="section-header">
        <div class="section-title">
          🏫 Turmas — ${curso?.nome}
          <span class="section-badge">${turmas.length}</span>
        </div>
        <button class="btn btn-outline btn-sm" id="bc-cursos-btn">← Voltar</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
        ${turmas.map(t => `
          <div class="turma-card ${t.risco === 'alto' ? 'risco-alto' : t.risco === 'medio' ? 'risco-medio' : 'risco-baixo'}"
               data-turma="${t.id}" style="cursor:pointer;" tabindex="0" role="button">
            <div class="turma-card-header">
              <div>
                <div class="turma-card-nome">${t.nome}</div>
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
            <div style="color:var(--blue-primary);font-size:.78rem;font-weight:600;text-align:right;">
              Ver alunos →
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#bc-cursos')?.addEventListener('click', () => renderCursosList(container));
  container.querySelector('#bc-cursos-btn')?.addEventListener('click', () => renderCursosList(container));

  container.querySelectorAll('[data-turma]').forEach(card => {
    card.addEventListener('click', () => {
      _currentTurmaId = card.dataset.turma;
      renderAlunosList(container, cursoId, _currentTurmaId);
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter') card.click(); });
  });
}

// ── NÍVEL 3: Lista de Alunos ──────────────────────────────────
function renderAlunosList(container, cursoId, turmaId) {
  const curso  = state.getCursos().find(c => c.id === cursoId);
  const turma  = state.getTurmas(cursoId).find(t => t.id === turmaId);
  const alunos = state.getAlunos(turmaId);

  const rows = alunos.map(a => {
    const media = ((a.va1 + a.va2 + (a.va3 || 0)) / (a.va3 !== 0 ? 3 : 2)).toFixed(1);
    const mediaNum = parseFloat(media);
    const mediaClass = mediaNum >= 7 ? 'nota-alta' : mediaNum >= 5 ? 'nota-media' : 'nota-baixa';

    return `
      <tr>
        <td>
          <div style="font-weight:700;color:var(--text);">${a.nome}</div>
          <div style="font-size:.72rem;color:var(--text-muted);">#${a.id}</div>
        </td>
        <td>${a.va1 !== 0 ? fmtNota(a.va1) : '–'}</td>
        <td>${a.va2 !== 0 ? fmtNota(a.va2) : '–'}</td>
        <td>${a.va3 !== 0 ? fmtNota(a.va3) : '–'}</td>
        <td><span class="${mediaClass}">${media}</span></td>
        <td>${fmtPct(a.frequencia, 0)}</td>
        <td>${getRiscoBadge(a.risco)}</td>
        <td>
          ${a.risco !== 'baixo' ? `
            <button class="btn-intervene" data-aluno="${a.id}"
                    style="border:none;cursor:pointer;border-radius:6px;">
              ✉️ Intervir
            </button>
          ` : '—'}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="page-fade-in">
      <div class="breadcrumb">
        <span class="breadcrumb-item" id="bc-cursos2">Cursos</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-item" id="bc-turmas2">${curso?.nome}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${turma?.nome}</span>
      </div>

      <div class="section-header">
        <div class="section-title">
          👥 Alunos — ${turma?.nome}
          <span class="section-badge">${alunos.length}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" id="bc-turmas-btn">← Voltar</button>
          ${alunos.some(a => a.risco !== 'baixo') ? `
            <button class="btn btn-dark btn-sm" id="btn-intervene-all">
              ✉️ Intervir em Todos em Risco
            </button>
          ` : ''}
        </div>
      </div>

      <div class="section-card" style="padding:0;overflow:hidden;">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>VA1</th><th>VA2</th><th>VA3</th>
                <th>Média</th>
                <th>Frequência</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#bc-cursos2')?.addEventListener('click', () => renderCursosList(container));
  container.querySelector('#bc-turmas2')?.addEventListener('click', () => renderTurmasList(container, cursoId));
  container.querySelector('#bc-turmas-btn')?.addEventListener('click', () => renderTurmasList(container, cursoId));

  container.querySelectorAll('.btn-intervene[data-aluno]').forEach(btn => {
    btn.addEventListener('click', () => {
      const aluno = alunos.find(a => a.id === btn.dataset.aluno);
      if (aluno) openInterventionModal(aluno, turmaId);
    });
  });

  container.querySelector('#btn-intervene-all')?.addEventListener('click', () => {
    const primeiro = alunos.find(a => a.risco !== 'baixo');
    if (primeiro) openInterventionModal(primeiro, turmaId);
  });
}
