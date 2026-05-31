/**
 * Predicao.js — Predicta
 * Filtros superiores + 6 gráficos Chart.js com tooltips didáticos "?".
 * Botão "Detalhamento" abre FilterPanel lateral.
 */

import { state }           from '../state.js';
import { MOCK_DATA }       from '../mockData.js';
import { openFilterPanel } from '../components/FilterPanel.js';

// Descrições didáticas dos indicadores
const TOOLTIPS = {
  regressao: {
    titulo: 'Regressão Linear / Matricial',
    texto: `Imagine que você quer saber se um aluno que estuda mais horas tira notas melhores.
A regressão linear é como traçar a "linha de tendência" perfeita no meio dos pontos do gráfico.
Ela mostra a direção geral: se as notas estão subindo ou descendo conforme o tempo passa.`,
  },
  variancia: {
    titulo: 'Variância',
    texto: `Imagine que 5 amigos medem sua altura e os resultados são: 1,60m, 1,75m, 1,62m, 1,80m, 1,58m.
A variância mede o quanto essas medidas são "espalhadas" em relação à média.
Se todos tivessem a mesma altura, a variância seria zero. Quanto maior a variância, mais "bagunçadas" são as notas.`,
  },
  mediaMediana: {
    titulo: 'Média e Mediana',
    texto: `A média é a soma de todas as notas dividida pelo número de alunos — é o "valor médio".
A mediana é a nota do aluno que fica bem no meio: metade tirou mais, metade tirou menos.
Quando a mediana é muito diferente da média, significa que há alunos com notas muito diferentes dos demais.`,
  },
  homogeneidade: {
    titulo: 'Homogeneidade dos Dados',
    texto: `Imagine uma turma onde todos tiram entre 6 e 7. Essa turma é homogênea — todo mundo está no mesmo nível.
Agora imagine uma turma onde alguns tiram 10 e outros tiram 2. Essa é heterogênea.
A homogeneidade mede o quanto os alunos de uma turma são parecidos no desempenho.`,
  },
  desvioPadrao: {
    titulo: 'Desvio Padrão',
    texto: `O desvio padrão é como a "distância média" que cada aluno está da média da turma.
Se a média é 7 e o desvio é 1, a maioria tira entre 6 e 8.
Se o desvio é 3, há alunos tirando 4 e outros tirando 10! Quanto menor o desvio, mais uniforme é a turma.`,
  },
  registros: {
    titulo: 'Quantidade de Registros Analisados',
    texto: `Este número mostra quantos alunos (registros) estão sendo considerados nos cálculos atuais.
Quando você aplica filtros (por curso, turma ou data), esse número diminui para mostrar apenas
os alunos selecionados. Assim você garante que as estatísticas são sobre o grupo que você escolheu analisar.`,
  },
};

let _charts = {};

export async function renderPredicao(container) {
  const data = MOCK_DATA.estatisticas;

  // Reset period label
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) {
    periodoEl.innerHTML = `
      <span>Período: <strong>26/03/2026 a 26/05/2026</strong></span>
      <span class="period-badge">Semana 8/12</span>
    `;
  }

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Barra de filtros superior -->
      <div class="filters-bar-styled" id="pred-filters-bar">
        <div class="filter-group">
          <label class="filter-label" for="pred-curso">Curso</label>
          <select class="filter-select" id="pred-curso">
            <option value="">Todos os Cursos</option>
            ${state.getCursos().map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label" for="pred-materia">Componente Curricular</label>
          <select class="filter-select" id="pred-materia">
            <option value="">Todas as Matérias</option>
            ${MOCK_DATA.disciplinas.map(d => `<option value="${d.id}">${d.nome}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group" style="max-width:160px;">
          <label class="filter-label" for="pred-data-ini">Data Início</label>
          <input type="date" class="filter-select" id="pred-data-ini" value="2026-03-26"/>
        </div>
        <div class="filter-group" style="max-width:160px;">
          <label class="filter-label" for="pred-data-fim">Data Fim</label>
          <input type="date" class="filter-select" id="pred-data-fim" value="2026-05-26"/>
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" id="btn-apply-filters">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Aplicar
          </button>
          <div style="position:relative;">
            <button class="btn btn-outline" id="btn-detalhamento" title="Filtros avançados">
              ⚙️ Detalhamento
            </button>
            <button class="tooltip-btn" id="btn-det-help" style="position:absolute;top:-8px;right:-8px;"
                    aria-label="O que é o Detalhamento?">?</button>
            <div class="tooltip-popup" id="det-tooltip" style="display:none;width:220px;">
              <strong>Filtros Avançados</strong><br/>
              Refine os resultados por gênero, turma específica, faixa de notas, nível de risco
              e intervalo de datas com calendário interativo — como ao buscar uma passagem aérea!
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        ${makeChartCard('chart-regressao',    'Regressão Linear / Matricial', 'Correlação entre frequência e desempenho', 'regressao')}
        ${makeChartCard('chart-variancia',    'Variância por Disciplina',     'Dispersão das notas por componente',        'variancia')}
      </div>
      <div class="charts-grid">
        ${makeChartCard('chart-media',        'Média e Mediana por Turma',    'Comparativo de tendência central',          'mediaMediana')}
        ${makeChartCard('chart-homog',        'Homogeneidade dos Dados',      'Índice de uniformidade por curso',          'homogeneidade')}
      </div>
      <div class="charts-grid">
        ${makeChartCard('chart-dp',           'Desvio Padrão por Curso',      'Variabilidade das notas por curso',         'desvioPadrao')}
        ${makeStatCountCard(data.registros)}
      </div>

    </div>
  `;

  // ─── Renderiza gráficos ────────────────────────────────────
  await renderCharts(data);

  // ─── Tooltip do Detalhamento ──────────────────────────────
  const detHelp    = container.querySelector('#btn-det-help');
  const detTooltip = container.querySelector('#det-tooltip');
  detHelp?.addEventListener('click', e => {
    e.stopPropagation();
    const show = detTooltip.style.display === 'none';
    detTooltip.style.display = show ? 'block' : 'none';
  });
  document.addEventListener('click', () => {
    if (detTooltip) detTooltip.style.display = 'none';
  });

  // ─── Tooltips dos gráficos ────────────────────────────────
  container.querySelectorAll('.chart-tooltip-btn').forEach(btn => {
    const key     = btn.dataset.chart;
    const popup   = btn.nextElementSibling;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const show = popup.style.display === 'none';
      container.querySelectorAll('.tooltip-popup').forEach(p => p.style.display = 'none');
      popup.style.display = show ? 'block' : 'none';
    });
  });
  document.addEventListener('click', () => {
    container.querySelectorAll('.tooltip-popup').forEach(p => p.style.display = 'none');
  });

  // ─── Filtro simples ───────────────────────────────────────
  container.querySelector('#btn-apply-filters')?.addEventListener('click', () => {
    const cursoId   = container.querySelector('#pred-curso')?.value;
    const materiaId = container.querySelector('#pred-materia')?.value;
    state.setFilter('cursoId',   cursoId   || null);
    state.setFilter('materiaId', materiaId || null);

    // Atualiza registro count
    let total = MOCK_DATA.estatisticas.registros.total;
    if (cursoId) {
      const turmasDoCurso = MOCK_DATA.turmas.filter(t => t.cursoId === cursoId);
      total = turmasDoCurso.reduce((s, t) => s + t.alunos, 0);
    }
    const countEl = container.querySelector('#stat-count-num');
    if (countEl) countEl.textContent = total.toLocaleString('pt-BR');
  });

  // ─── Detalhamento (FilterPanel) ───────────────────────────
  container.querySelector('#btn-detalhamento')?.addEventListener('click', () => {
    openFilterPanel(filters => {
      // Aqui atualizaria os gráficos com os filtros aplicados
      console.log('Filtros avançados aplicados:', filters);
    });
  });

  // ─── Resize dos charts com sidebar ────────────────────────
  return () => {
    Object.values(_charts).forEach(c => c?.destroy?.());
    _charts = {};
  };
}

// ─── Helper: HTML de um chart card ────────────────────────────
function makeChartCard(id, title, subtitle, tooltipKey) {
  const tt = TOOLTIPS[tooltipKey];
  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="chart-title">${title}</div>
          <div class="chart-subtitle">${subtitle}</div>
        </div>
        <div style="position:relative;flex-shrink:0;">
          <button class="tooltip-btn chart-tooltip-btn" data-chart="${tooltipKey}"
                  aria-label="Saiba mais sobre ${title}">?</button>
          <div class="tooltip-popup" style="display:none;">
            <strong>${tt.titulo}</strong><br/><br/>
            ${tt.texto.replace(/\n/g, '<br/>')}
          </div>
        </div>
      </div>
      <div class="chart-canvas-wrap">
        <canvas id="${id}"></canvas>
      </div>
    </div>
  `;
}

// ─── Helper: Stat count card ──────────────────────────────────
function makeStatCountCard(registros) {
  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="chart-title">Registros Analisados</div>
          <div class="chart-subtitle">Dinâmico conforme filtro ativo</div>
        </div>
        <div style="position:relative;flex-shrink:0;">
          <button class="tooltip-btn chart-tooltip-btn" data-chart="registros"
                  aria-label="Saiba mais">?</button>
          <div class="tooltip-popup" style="display:none;">
            <strong>${TOOLTIPS.registros.titulo}</strong><br/><br/>
            ${TOOLTIPS.registros.texto.replace(/\n/g, '<br/>')}
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;margin-top:12px;">
        <div class="stat-count-card">
          <div class="stat-count-num" id="stat-count-num">${registros.total.toLocaleString('pt-BR')}</div>
          <div class="stat-count-label">Total de Registros Ativos</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div style="background:var(--bg-page);border-radius:8px;padding:12px;text-align:center;border:1px solid var(--border-color);">
            <div style="font-family:'Montserrat',sans-serif;font-size:1.4rem;font-weight:800;color:var(--blue-primary);">${registros.filtrado.toLocaleString('pt-BR')}</div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px;">Filtro Atual</div>
          </div>
          <div style="background:var(--bg-page);border-radius:8px;padding:12px;text-align:center;border:1px solid var(--border-color);">
            <div style="font-family:'Montserrat',sans-serif;font-size:1.4rem;font-weight:800;color:var(--green);">${registros.periodos.length}</div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px;">Períodos</div>
          </div>
        </div>
        <div>
          <div style="font-size:.75rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Distribuição por Período</div>
          ${registros.periodos.map((p, i) => {
            const pct = Math.round((registros.porPeriodo[i] / registros.total) * 100);
            return `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                <span style="font-size:.72rem;color:var(--text-muted);min-width:50px;">${p}</span>
                <div style="flex:1;height:6px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                  <div style="width:${pct}%;height:100%;background:var(--blue-primary);border-radius:99px;"></div>
                </div>
                <span style="font-size:.72rem;color:var(--text-muted);min-width:35px;">${registros.porPeriodo[i].toLocaleString('pt-BR')}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ─── Renderização dos Chart.js ─────────────────────────────────
async function renderCharts(data) {
  // Espera Chart.js estar disponível
  if (typeof Chart === 'undefined') return;

  const BLUE    = '#3AADE5';
  const DARK    = '#0B4F7C';
  const GREEN   = '#22C55E';
  const YELLOW  = '#EAB308';
  const ORANGE  = '#F97316';
  const RED     = '#EF4444';
  const PURPLE  = '#8B5CF6';

  const defaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { font: { family: 'Inter', size: 11 }, color: '#64748B' } } },
  };

  // 1. Regressão — Scatter
  const ctxReg = document.getElementById('chart-regressao');
  if (ctxReg) {
    _charts.regressao?.destroy();
    _charts.regressao = new Chart(ctxReg, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Alunos',
            data: data.regressao.pontos,
            backgroundColor: `${BLUE}88`,
            borderColor: BLUE,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: 'Linha de Tendência',
            data: data.regressao.linha,
            type: 'line',
            borderColor: RED,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        ...defaults,
        scales: {
          x: { title: { display: true, text: 'Semana', color: '#64748B', font: { size: 11 } } },
          y: { title: { display: true, text: 'Nota', color: '#64748B', font: { size: 11 } }, min: 0, max: 10 },
        },
        plugins: {
          ...defaults.plugins,
          annotation: {},
        },
      },
    });
  }

  // 2. Variância — Barras + linha de referência
  const ctxVar = document.getElementById('chart-variancia');
  if (ctxVar) {
    _charts.variancia?.destroy();
    _charts.variancia = new Chart(ctxVar, {
      type: 'bar',
      data: {
        labels: data.variancia.labels,
        datasets: [
          {
            label: 'Variância',
            data: data.variancia.valores,
            backgroundColor: [BLUE, GREEN, YELLOW, ORANGE, PURPLE].map(c => `${c}99`),
            borderColor:     [BLUE, GREEN, YELLOW, ORANGE, PURPLE],
            borderWidth: 2, borderRadius: 6,
          },
          {
            label: `Média (${data.variancia.media})`,
            data: Array(data.variancia.labels.length).fill(data.variancia.media),
            type: 'line', borderColor: RED, borderWidth: 2,
            borderDash: [5, 3], pointRadius: 0, fill: false,
          },
        ],
      },
      options: {
        ...defaults,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Variância', color: '#64748B', font: { size: 11 } } },
        },
      },
    });
  }

  // 3. Média e Mediana — Barras agrupadas
  const ctxMed = document.getElementById('chart-media');
  if (ctxMed) {
    _charts.mediaMediana?.destroy();
    _charts.mediaMediana = new Chart(ctxMed, {
      type: 'bar',
      data: {
        labels: data.mediaMediana.labels,
        datasets: [
          {
            label: 'Média',
            data: data.mediaMediana.medias,
            backgroundColor: `${BLUE}BB`, borderColor: BLUE,
            borderWidth: 2, borderRadius: 6,
          },
          {
            label: 'Mediana',
            data: data.mediaMediana.medianas,
            backgroundColor: `${GREEN}BB`, borderColor: GREEN,
            borderWidth: 2, borderRadius: 6,
          },
        ],
      },
      options: {
        ...defaults,
        scales: {
          y: { min: 0, max: 10,
            title: { display: true, text: 'Nota', color: '#64748B', font: { size: 11 } } },
        },
      },
    });
  }

  // 4. Homogeneidade — Radar
  const ctxHom = document.getElementById('chart-homog');
  if (ctxHom) {
    _charts.homogeneidade?.destroy();
    _charts.homogeneidade = new Chart(ctxHom, {
      type: 'radar',
      data: {
        labels: data.homogeneidade.labels,
        datasets: [{
          label: 'Índice de Homogeneidade (%)',
          data: data.homogeneidade.valores,
          backgroundColor: `${BLUE}33`,
          borderColor: BLUE, borderWidth: 2,
          pointBackgroundColor: BLUE, pointRadius: 4,
        }],
      },
      options: {
        ...defaults,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { color: '#64748B', font: { size: 10 } },
            grid: { color: '#E2E8F0' },
            pointLabels: { color: '#1E293B', font: { size: 10, family: 'Inter' } },
          },
        },
      },
    });
  }

  // 5. Desvio Padrão — Barras horizontais
  const ctxDp = document.getElementById('chart-dp');
  if (ctxDp) {
    _charts.desvioPadrao?.destroy();
    _charts.desvioPadrao = new Chart(ctxDp, {
      type: 'bar',
      data: {
        labels: data.desvioPadrao.labels,
        datasets: [{
          label: 'Desvio Padrão',
          data: data.desvioPadrao.valores,
          backgroundColor: data.desvioPadrao.valores.map(v =>
            v > 2 ? `${RED}99` : v > 1.5 ? `${YELLOW}99` : `${GREEN}99`
          ),
          borderColor: data.desvioPadrao.valores.map(v =>
            v > 2 ? RED : v > 1.5 ? YELLOW : GREEN
          ),
          borderWidth: 2, borderRadius: 6,
        }],
      },
      options: {
        ...defaults,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true,
            title: { display: true, text: 'Desvio Padrão (σ)', color: '#64748B', font: { size: 11 } } },
        },
      },
    });
  }
}
