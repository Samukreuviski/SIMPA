/**
 * Notas.js — Predicta
 * Planilha de rendimento acadêmico com filtro de busca e intervenção.
 */

import { state }                 from '../state.js';
import { MOCK_DATA }             from '../mockData.js';
import { fmtNota, fmtPct, getRiscoBadge, getNotaBadge } from '../utils.js';
import { openInterventionModal } from '../components/InterventionModal.js';
import { debounce }              from '../utils.js';

export async function renderNotas(container) {
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) periodoEl.innerHTML = '';

  const alunos  = state.getAlunos();
  const turmas  = state.getTurmas();
  const discs   = MOCK_DATA.disciplinas;

  // Monta linhas: um aluno × disciplina por linha
  const rows = [];
  alunos.forEach(a => {
    const turma = turmas.find(t => t.id === a.turmaId);
    const aDiscs = discs.filter(d => d.turmaId === a.turmaId);

    if (aDiscs.length === 0) {
      // Sem disciplina registrada — usa dados gerais da turma
      rows.push({ aluno: a, turma, disciplina: { nome: turma?.nome || '–', codigo: '–' } });
    } else {
      aDiscs.forEach(d => rows.push({ aluno: a, turma, disciplina: d }));
    }
  });

  function calcMedia(a) {
    const vals = [a.va1, a.va2, a.va3].filter(v => v && v > 0);
    if (!vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }

  function buildRows(data) {
    return data.map(({ aluno: a, turma, disciplina }) => {
      const media   = calcMedia(a);
      const mediaStr = media !== null ? fmtNota(media) : '—';
      const mediaCls = media === null ? '' : media >= 7 ? 'nota-alta' : media >= 5 ? 'nota-media' : 'nota-baixa';
      const situacao = media === null ? '–' : media >= 7 ? 'Aprovado' : media >= 5 ? 'Recuperação' : 'Reprovado';

      return `
        <tr data-search="${a.nome.toLowerCase()} ${disciplina.nome.toLowerCase()}">
          <td>
            <div style="font-weight:700;color:var(--text);">${a.nome}</div>
            <div style="font-size:.7rem;color:var(--text-muted);">#${a.id}</div>
          </td>
          <td>
            <div style="font-weight:600;color:var(--text);font-size:.84rem;">${disciplina.nome}</div>
            <div style="font-size:.7rem;color:var(--text-muted);">${disciplina.codigo}</div>
          </td>
          <td style="text-align:center;font-size:.82rem;color:var(--text-muted);">${turma?.nome?.split('—')[1]?.trim() || '–'}</td>
          <td style="text-align:center;">${a.va1 > 0 ? getNotaBadge(a.va1) : '—'}</td>
          <td style="text-align:center;">${a.va2 > 0 ? getNotaBadge(a.va2) : '—'}</td>
          <td style="text-align:center;">${a.va3 > 0 ? getNotaBadge(a.va3) : '—'}</td>
          <td style="text-align:center;">${getNotaBadge(media)}</td>
          <td style="text-align:center;">${fmtPct(a.frequencia, 0)}</td>
          <td style="text-align:center;font-size:.82rem;">${situacao}</td>
          <td style="text-align:center;">${getRiscoBadge(a.risco)}</td>
          <td style="text-align:center;">
            ${a.risco !== 'baixo' ? `
              <button class="btn-intervene btn-notas-intervene" data-aluno="${a.id}"
                      style="background:transparent; color:var(--text-strong); border:none; cursor:pointer; padding:0; display:inline-flex; align-items:center; justify-content:center; transition:transform 0.2s;"
                      onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ─── Estatísticas rápidas ──────────────────────────────────
  const totalAlunos  = alunos.length;
  const emRisco      = alunos.filter(a => a.risco !== 'baixo').length;
  const mediaGeral   = (alunos.reduce((s, a) => {
    const m = calcMedia(a); return s + (m ?? 0);
  }, 0) / alunos.filter(a => calcMedia(a) !== null).length).toFixed(1);

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Stats rápidas -->
      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
        <div class="kpi-card">
          <div class="kpi-label">Total de Alunos</div>
          <div class="kpi-value">${totalAlunos}</div>
          <div class="kpi-desc">Com registros de notas</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-label">Em Risco de Reprovação</div>
          <div class="kpi-value red">${emRisco}</div>
          <div class="kpi-desc">${((emRisco / totalAlunos) * 100).toFixed(1)}% do grupo</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Média Geral do Grupo</div>
          <div class="kpi-value ${parseFloat(mediaGeral) >= 7 ? 'green' : parseFloat(mediaGeral) >= 5 ? 'yellow' : 'red'}">${mediaGeral}</div>
          <div class="kpi-desc">Escala 0–10</div>
        </div>
      </div>

      <!-- Filtros + tabela -->
      <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:24px;">
        <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="font-family:'Poppins', sans-serif; font-size:1.05rem; color:var(--text-main); display:flex; align-items:center;">Planilha de Rendimento Acadêmico</div>
          <div class="notas-search-bar" style="margin-bottom:0; display:flex; gap:8px;">
            <input type="text" class="filter-input" id="notas-search"
                   placeholder="Buscar aluno ou disciplina..." style="min-width:240px; padding:6px 12px; border-radius:6px; border:1px solid var(--border-color);" />
            <select class="filter-select" id="notas-risco-filter" style="padding:6px 12px; border-radius:6px; border:1px solid var(--border-color);">
              <option value="">Todos os riscos</option>
              <option value="alto">Alto Risco</option>
              <option value="medio">Risco Médio</option>
              <option value="baixo">Baixo Risco</option>
            </select>
          </div>
        </div>
        <div class="table-wrap" style="width:100%; overflow-x:auto;">
          <table id="notas-table" style="width:100%; border-collapse:collapse; min-width:800px; font-family:'Poppins', sans-serif;">
            <thead>
              <tr>
                <th style="padding:16px; text-align:left; font-weight:600; font-size:1.05rem;">Aluno</th>
                <th style="padding:16px; text-align:left; font-weight:600; font-size:1.05rem;">Disciplina</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Período</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA1</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA2</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">VA3</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Média</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Freq.</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Situação</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Risco</th>
                <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Ação</th>
              </tr>
            </thead>
            <tbody id="notas-tbody">
              ${buildRows(rows)}
            </tbody>
          </table>
        </div>
        <div style="padding:12px 20px;border-top:1px solid var(--border-color);
            font-size:.78rem;color:var(--text-muted);">
          Exibindo <span id="notas-count">${rows.length}</span> registros
        </div>
      </div>

      <!-- Legenda -->
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-size:.78rem;color:var(--text-muted);">
        <span><span style="color:var(--green); font-size:.85rem; margin-right:4px;">▲</span> Aprovado (≥ 7.0)</span>
        <span><span style="color:var(--yellow); font-size:.85rem; margin-right:4px;">▶</span> Recuperação (5.0 – 6.9)</span>
          <strong>Semana</strong> 6 <span style="font-weight:300; font-size:1.15rem; color:var(--text-main);">|</span> 12Reprovado (< 5.0)</span>
      </div>
    </div>
  `;

  // ─── Busca e filtro ───────────────────────────────────────
  const searchInput  = container.querySelector('#notas-search');
  const riscoSelect  = container.querySelector('#notas-risco-filter');
  const tbody        = container.querySelector('#notas-tbody');
  const countEl      = container.querySelector('#notas-count');

  function applyFilters() {
    const q     = searchInput.value.toLowerCase().trim();
    const risco = riscoSelect.value;
    let visible = 0;

    // Rebuild from data instead of DOM for correctness
    const filtered = rows.filter(({ aluno: a, disciplina }) => {
      const matchText = !q || a.nome.toLowerCase().includes(q) || disciplina.nome.toLowerCase().includes(q);
      const matchRisco = !risco || a.risco === risco;
      return matchText && matchRisco;
    });

    tbody.innerHTML = buildRows(filtered);
    if (countEl) countEl.textContent = filtered.length;
    bindInterventionBtns();
  }

  searchInput?.addEventListener('input', debounce(applyFilters, 200));
  riscoSelect?.addEventListener('change', applyFilters);

  // ─── Botões de intervenção ────────────────────────────────
  function bindInterventionBtns() {
    container.querySelectorAll('.btn-notas-intervene').forEach(btn => {
      btn.addEventListener('click', () => {
        const aluno = alunos.find(a => a.id === btn.dataset.aluno);
        if (aluno) openInterventionModal(aluno);
      });
    });
  }

  bindInterventionBtns();
}

