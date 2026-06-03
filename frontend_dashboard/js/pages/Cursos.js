/**
 * Cursos.js — Predicta
 * Navegação em cascata: Cursos → Turmas → Alunos
 * Botão proeminente "Conectar ao Lyceum"
 */

import { state } from '../state.js';
import { getRiscoBadge, getNotaBadge, fmtNum, fmtNota, fmtPct } from '../utils.js';
import { openInterventionModal } from '../components/InterventionModal.js';
import { syncLyceum } from '../api.js';
import { showToast } from '../components/Modal.js';

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
      <div style="position:relative; overflow:hidden; background:linear-gradient(105deg, #002942 0%, #0B4F7C 45%, #2586ce 100%);
          border-radius:var(--radius);padding:32px 36px;margin-bottom:28px;
          display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;
          box-shadow:var(--shadow-lg);">
        
        <!-- Elementos Decorativos -->
        <div style="position:absolute; top:-60px; right:-20px; width:300px; height:300px; background:radial-gradient(circle, rgba(63,169,245,0.4) 0%, transparent 70%); pointer-events:none;"></div>
        <div style="position:absolute; bottom:-100px; left:20%; width:400px; height:200px; background:radial-gradient(ellipse, rgba(0,212,255,0.15) 0%, transparent 70%); pointer-events:none; transform:rotate(-15deg);"></div>
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg=='); opacity:0.3; pointer-events:none;"></div>

        <div style="position:relative; z-index:1;">
          <div style="display:flex; align-items:center; gap:8px; color:#8cd3ff; font-size:.8rem; font-weight:700;
              text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Integração Institucional
          </div>
          <div style="color:#ffffff; font-size:1.6rem; font-weight:800; margin-bottom:8px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
            Portal Acadêmico Lyceum
          </div>
          <div style="color:#d0ebff; font-size:.9rem; max-width:480px; line-height:1.5;">
            Sincronize matrícula, notas e frequência diretamente do sistema acadêmico da UniEVANGÉLICA.
            <br/><span style="opacity:0.8;">Última sincronização:</span> <strong style="color:#fff;">há 5 dias</strong>
          </div>
        </div>
        
        <button class="btn-lyceum" id="btn-lyceum" type="button" style="position:relative; z-index:1; background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.3); color:#fff; padding:14px 28px; border-radius:12px; font-family:'Poppins', sans-serif; font-weight:600; font-size:1rem; cursor:pointer; display:flex; align-items:center; gap:10px; box-shadow:0 8px 32px rgba(0,0,0,0.2); transition:all 0.3s; text-shadow:0 1px 2px rgba(0,0,0,0.1);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
           Cursos Disponíveis
          <span class="section-badge">${cursos.length}</span>
        </div>
      </div>

      <!-- Grid de cursos -->
      <div class="cursos-grid" id="cursos-grid">
        ${cursos.map(c => `
          <div class="curso-card risco-${c.risco}" data-curso="${c.id}" tabindex="0" role="button" style="padding-top:24px;">
            <div class="curso-card-nome">${c.nome}</div>
            <div class="curso-card-stats">
              <div class="curso-stat">
                <span class="curso-stat-val" style="color:var(--text-strong);">${fmtNum(c.alunos)}</span>
                <span class="curso-stat-label">Alunos</span>
              </div>
              <div class="curso-stat">
                <span class="curso-stat-val" style="color:var(--text-strong);">${c.turmas}</span>
                <span class="curso-stat-label">Turmas</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:'Poppins', sans-serif;"><span style="color:${c.risco === 'alto' ? 'var(--red)' : c.risco === 'medio' ? 'var(--yellow)' : 'var(--green)'}; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>Risco ${c.risco === 'alto' ? 'Alto' : c.risco === 'medio' ? 'Médio' : 'Baixo'}</span>
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
  const curso = state.getCursos().find(c => c.id === cursoId);
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
              <div style="flex:1; padding-right:8px;">
                <div class="turma-card-nome">${t.nome}</div>
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
            <div style="display:flex; justify-content:space-between; align-items:center;">
              ${t.risco !== 'baixo' ? `
                <span style="color:var(--blue-primary); font-size:.85rem; font-weight:600; font-family:'Poppins', sans-serif;">Precisa de intervenção</span>
              ` : `<span style="color:var(--blue-primary); font-size:.85rem; font-weight:600; font-family:'Poppins', sans-serif;">Situação OK</span>`}
              <div style="color:var(--blue-primary);font-size:.78rem;font-weight:600;text-align:right;">
                Ver alunos →
              </div>
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
  const curso = state.getCursos().find(c => c.id === cursoId);
  const turma = state.getTurmas(cursoId).find(t => t.id === turmaId);
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
        <td style="text-align:center;">${a.va1 !== 0 ? fmtNota(a.va1) : '–'}</td>
        <td style="text-align:center;">${a.va2 !== 0 ? fmtNota(a.va2) : '–'}</td>
        <td style="text-align:center;">${a.va3 !== 0 ? fmtNota(a.va3) : '–'}</td>
        <td style="text-align:center;">${getNotaBadge(mediaNum)}</td>
        <td style="text-align:center;">${fmtPct(a.frequencia, 0)}</td>
        <td style="text-align:center;">${getRiscoBadge(a.risco)}</td>
        <td style="text-align:center;">
          ${a.risco !== 'baixo' ? `
            <button class="btn-intervene-turma" data-aluno="${a.id}"
                    style="background:transparent; color:var(--text-strong); border:none; cursor:pointer; padding:0; display:inline-flex; align-items:center; justify-content:center; transition:transform 0.2s;"
                    onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>
            </button>
          ` : ''}
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

      <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:24px;">
        <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:700; color:var(--text-main);">Alunos — ${turma?.nome}</div>
          <div style="display:flex;gap:8px; align-items:center;">
            <span style="font-family:'Poppins', sans-serif; font-size:.85rem; color:var(--text-muted);">${alunos.length} alunos</span>
            <button class="btn btn-outline btn-sm" id="bc-turmas-btn">← Voltar</button>
          </div>
        </div>
        <div class="table-wrap" style="width:100%; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; min-width:800px; font-family:'Poppins', sans-serif;">
            <thead>
              <tr>
                <th style="padding:16px; text-align:left; font-weight:600; font-size:1.05rem;">Aluno:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA1:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA2:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA3:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Média:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Frequência:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Status:</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Ação</th>
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


}

