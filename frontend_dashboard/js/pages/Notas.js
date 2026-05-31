/**
 * Notas.js — Predicta
 * Planilha de rendimento acadêmico com filtro de busca e intervenção.
 */

import { state }                 from '../state.js';
import { MOCK_DATA }             from '../mockData.js';
import { fmtNota, fmtPct, getRiscoBadge } from '../utils.js';
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
      const situacao = media === null ? '–' : media >= 7 ? '✅ Aprovado' : media >= 5 ? '⚠️ Recuperação' : '❌ Reprovado';

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
          <td style="font-size:.82rem;color:var(--text-muted);">${turma?.nome?.split('—')[1]?.trim() || '–'}</td>
          <td>${a.va1 > 0 ? `<span class="${a.va1 >= 7 ? 'nota-alta' : a.va1 >= 5 ? 'nota-media' : 'nota-baixa'}">${fmtNota(a.va1)}</span>` : '—'}</td>
          <td>${a.va2 > 0 ? `<span class="${a.va2 >= 7 ? 'nota-alta' : a.va2 >= 5 ? 'nota-media' : 'nota-baixa'}">${fmtNota(a.va2)}</span>` : '—'}</td>
          <td>${a.va3 > 0 ? `<span class="${a.va3 >= 7 ? 'nota-alta' : a.va3 >= 5 ? 'nota-media' : 'nota-baixa'}">${fmtNota(a.va3)}</span>` : '—'}</td>
          <td><span class="${mediaCls}" style="font-size:.95rem;">${mediaStr}</span></td>
          <td>${fmtPct(a.frequencia, 0)}</td>
          <td style="font-size:.82rem;">${situacao}</td>
          <td>${getRiscoBadge(a.risco)}</td>
          <td>
            ${a.risco !== 'baixo' ? `
              <button class="btn-intervene btn-notas-intervene" data-aluno="${a.id}"
                      style="border:none;cursor:pointer;border-radius:6px;
                      background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;
                      font-size:.72rem;padding:5px 10px;font-weight:700;
                      display:inline-flex;align-items:center;gap:4px;">
                ✉️
              </button>
            ` : '—'}
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
      <div class="section-card" style="padding:0;overflow:hidden;">
        <div style="padding:18px 20px;border-bottom:1px solid var(--border-color);
            display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div class="section-title">📋 Planilha de Rendimento Acadêmico</div>
          <div class="notas-search-bar" style="margin-bottom:0;">
            <input type="text" class="filter-input" id="notas-search"
                   placeholder="🔍 Buscar aluno ou disciplina..." style="min-width:240px;" />
            <select class="filter-select" id="notas-risco-filter">
              <option value="">Todos os riscos</option>
              <option value="alto">🔴 Alto Risco</option>
              <option value="medio">🟡 Risco Médio</option>
              <option value="baixo">🟢 Baixo Risco</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table id="notas-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Disciplina</th>
                <th>Período</th>
                <th>VA1</th><th>VA2</th><th>VA3</th>
                <th>Média</th>
                <th>Freq.</th>
                <th>Situação</th>
                <th>Risco</th>
                <th>Ação</th>
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
        <span><span class="nota-alta">■</span> Aprovado (≥ 7.0)</span>
        <span><span class="nota-media">■</span> Recuperação (5.0 – 6.9)</span>
        <span><span class="nota-baixa">■</span> Reprovado (< 5.0)</span>
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
