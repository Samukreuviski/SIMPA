/**
 * FilterPanel.js — Predicta
 * Painel lateral deslizante (drawer) de filtros avançados.
 * Estilo "busca de passagens" com calendário interativo.
 */

import { state }     from '../state.js';
import { MOCK_DATA } from '../mockData.js';

export function openFilterPanel(onApply) {
  // Cria overlay + drawer
  const overlay = document.createElement('div');
  overlay.className = 'filter-panel-overlay';
  overlay.id = 'filter-panel-overlay';

  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  panel.id = 'filter-panel';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'Filtros avançados');

  const turmas = MOCK_DATA.turmas;
  const now    = new Date();

  panel.innerHTML = `
    <div class="filter-panel-header">
      <div>
        <div class="filter-panel-title">Filtros Avançados</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px;">
          Refine os resultados com precisão
        </div>
      </div>
      <button class="modal-close" id="fp-close" aria-label="Fechar filtros">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="filter-panel-body">

      <!-- Gênero -->
      <div class="filter-section">
        <div class="filter-section-title">Gênero</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${['Todos', 'Feminino', 'Masculino'].map(g => `
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;
              padding:7px 14px;border-radius:99px;border:1.5px solid var(--border-color);
              font-size:.82rem;font-weight:500;color:var(--text);
              transition:all .2s;user-select:none;" class="gender-opt">
              <input type="radio" name="fp-genero" value="${g}" ${g === 'Todos' ? 'checked' : ''}
                style="accent-color:var(--blue-primary);" />
              ${g}
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Turma específica -->
      <div class="filter-section">
        <div class="filter-section-title">Turma Específica</div>
        <select class="filter-select" id="fp-turma" style="width:100%;">
          <option value="">Todas as turmas</option>
          ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
        </select>
      </div>

      <!-- Faixa de notas -->
      <div class="filter-section">
        <div class="filter-section-title">Faixa de Notas (Média)</div>
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="flex:1;">
            <div class="filter-label" style="margin-bottom:4px;">Mínima</div>
            <input type="number" class="filter-input" id="fp-nota-min"
              min="0" max="10" step="0.1" value="0" style="width:100%;" />
          </div>
          <div style="color:var(--text-muted);margin-top:20px;">—</div>
          <div style="flex:1;">
            <div class="filter-label" style="margin-bottom:4px;">Máxima</div>
            <input type="number" class="filter-input" id="fp-nota-max"
              min="0" max="10" step="0.1" value="10" style="width:100%;" />
          </div>
        </div>
      </div>

      <!-- Situação de Risco -->
      <div class="filter-section">
        <div class="filter-section-title">Nível de Risco</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${[
            { val: '', label: 'Todos os níveis', color: 'var(--text-muted)' },
            { val: 'alto',  label: '&bull; Risco Alto',  color: 'var(--red)' },
            { val: 'medio', label: '&bull; Risco Médio', color: 'var(--yellow)' },
            { val: 'baixo', label: '&bull; Risco Baixo', color: 'var(--green)' },
          ].map(r => `
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 12px;
              border-radius:8px;border:1.5px solid var(--border-color);
              font-size:.84rem;color:${r.color};font-weight:600;
              transition:all .2s;user-select:none;">
              <input type="radio" name="fp-risco" value="${r.val}" ${!r.val ? 'checked' : ''}
                style="accent-color:var(--blue-primary);" />
              ${r.label}
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Calendário interativo -->
      <div class="filter-section">
        <div class="filter-section-title">Intervalo de Datas</div>
        <div style="display:flex;gap:10px;margin-bottom:12px;">
          <div style="flex:1;">
            <div class="filter-label" style="margin-bottom:4px;">Data Início</div>
            <input type="date" class="filter-input" id="fp-data-inicio" style="width:100%;"
              value="${now.getFullYear()}-03-01" />
          </div>
          <div style="flex:1;">
            <div class="filter-label" style="margin-bottom:4px;">Data Fim</div>
            <input type="date" class="filter-input" id="fp-data-fim" style="width:100%;"
              value="${now.toISOString().split('T')[0]}" />
          </div>
        </div>

        <!-- Mini calendário -->
        <div style="background:var(--bg-page);border-radius:8px;padding:12px;border:1px solid var(--border-color);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <button class="btn btn-outline btn-sm" id="cal-prev">‹</button>
            <span id="cal-month-label" style="font-size:.84rem;font-weight:700;color:var(--text);"></span>
            <button class="btn btn-outline btn-sm" id="cal-next">›</button>
          </div>
          <div class="calendar-grid" id="cal-grid"></div>
        </div>
      </div>

    </div>

    <div class="filter-panel-footer">
      <button class="btn btn-outline" id="fp-reset" style="flex:1;">Limpar</button>
      <button class="btn btn-primary" id="fp-apply" style="flex:2;">Aplicar Filtros</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    panel.classList.add('open');
  });

  // ─── Mini Calendário ───────────────────────────────────────
  let calYear  = now.getFullYear();
  let calMonth = now.getMonth();

  function renderCalendar() {
    const grid  = document.getElementById('cal-grid');
    const label = document.getElementById('cal-month-label');
    if (!grid || !label) return;

    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    label.textContent = `${months[calMonth]} ${calYear}`;

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days = ['D','S','T','Q','Q','S','S'];

    let html = days.map(d => `<div class="cal-day header">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day other-month"></div>`;

    const todayStr = now.toISOString().split('T')[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = dateStr === todayStr;
      html += `<div class="cal-day ${isToday ? 'today' : ''}" data-date="${dateStr}">${d}</div>`;
    }

    grid.innerHTML = html;

    // Clique no dia seleciona data início
    grid.querySelectorAll('.cal-day[data-date]').forEach(day => {
      day.addEventListener('click', () => {
        grid.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
        day.classList.add('selected');
        const di = document.getElementById('fp-data-inicio');
        if (di) di.value = day.dataset.date;
      });
    });
  }

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  renderCalendar();

  // ─── Close ─────────────────────────────────────────────────
  function closePanel() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    setTimeout(() => {
      overlay.remove();
      panel.remove();
    }, 380);
  }

  document.getElementById('fp-close')?.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  // ─── Reset ────────────────────────────────────────────────
  document.getElementById('fp-reset')?.addEventListener('click', () => {
    panel.querySelector('input[name="fp-genero"][value="Todos"]').checked = true;
    panel.querySelector('#fp-turma').value = '';
    panel.querySelector('#fp-nota-min').value = 0;
    panel.querySelector('#fp-nota-max').value = 10;
    panel.querySelector('input[name="fp-risco"][value=""]').checked = true;
    panel.querySelector('#fp-data-inicio').value = `${now.getFullYear()}-03-01`;
    panel.querySelector('#fp-data-fim').value = now.toISOString().split('T')[0];
    state.resetFilters();
  });

  // ─── Apply ────────────────────────────────────────────────
  document.getElementById('fp-apply')?.addEventListener('click', () => {
    const generoVal  = panel.querySelector('input[name="fp-genero"]:checked')?.value;
    const turmaVal   = panel.querySelector('#fp-turma')?.value;
    const notaMin    = parseFloat(panel.querySelector('#fp-nota-min')?.value) || 0;
    const notaMax    = parseFloat(panel.querySelector('#fp-nota-max')?.value) || 10;
    const riscoVal   = panel.querySelector('input[name="fp-risco"]:checked')?.value;
    const dataInicio = panel.querySelector('#fp-data-inicio')?.value;
    const dataFim    = panel.querySelector('#fp-data-fim')?.value;

    const filters = {
      genero:     generoVal !== 'Todos' ? generoVal?.[0] : null,  // 'F' ou 'M'
      turmaId:    turmaVal || null,
      notaMin,
      notaMax,
      risco:      riscoVal || null,
      dataInicio,
      dataFim,
    };

    state.setFilter('genero',     filters.genero);
    state.setFilter('turmaId',    filters.turmaId);
    state.setFilter('dataInicio', filters.dataInicio);
    state.setFilter('dataFim',    filters.dataFim);

    onApply?.(filters);
    closePanel();
  });
}

