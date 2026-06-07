/**
 * EstatPredicao.js — Predicta
 * Página combinada: Estatísticas e Predição em abas.
 * Aba 1: Predição (gráficos + filtros)
 * Aba 2: Estatísticas avançadas (análise completa)
 */

import { state }           from '../state.js';
import { MOCK_DATA }       from '../mockData.js';
import { openFilterPanel } from '../components/FilterPanel.js';
import { getNotaBadge }    from '../utils.js';

let _charts = {};

const TOOLTIPS = {
  regressao:     { titulo: 'Regressão Linear',     texto: 'Imagine traçar a linha perfeita que passa pelo meio de todos os pontos do gráfico. Ela mostra a direção geral das notas ao longo do tempo — subindo, descendo ou estável.' },
  variancia:     { titulo: 'Variância',             texto: 'Mede o quanto as notas são diferentes entre si. Alta variância = alunos com notas muito díspares. Baixa = turma uniforme.' },
  mediaMediana:  { titulo: 'Média e Mediana',       texto: 'Média é a soma dividida pelo total. Mediana é a nota do aluno do meio. Quando divergem muito, há alunos "puxando" a média para um lado.' },
  homogeneidade: { titulo: 'Homogeneidade',         texto: 'Mostra se os alunos têm desempenho parecido (alta) ou muito variado (baixa). 100% = todos com a mesma nota.' },
  desvioPadrao:  { titulo: 'Desvio Padrão (σ)',     texto: 'A "distância típica" de cada aluno em relação à média da turma. σ=1 significa que a maioria está apenas 1 ponto acima ou abaixo da média.' },
  distribuicao:  { titulo: 'Distribuição de Notas', texto: 'Quantos alunos estão em cada faixa de nota. Mostra o formato da curva de desempenho da turma.' },
  registros:     { titulo: 'Registros Analisados',  texto: 'Quantos alunos/registros são considerados nos cálculos. Filtre por curso ou turma para ver estatísticas específicas.' },
};

export async function renderEstatPredicao(container) {
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

  container.innerHTML = `
    <div class="page-fade-in" id="ep-content"></div>
  `;

  const content = container.querySelector('#ep-content');
  renderPredicaoContent(content);

  // cleanup
  return () => {
    Object.values(_charts).forEach(c => c?.destroy?.());
    _charts = {};
  };
}

/* ─── ABA: PREDIÇÃO ──────────────────────────────────────────── */
function renderPredicaoContent(wrapper) {
  const data = MOCK_DATA.estatisticas;

  wrapper.innerHTML = `


    <!-- Barra de filtros -->
    <div class="filters-bar-styled" style="margin-bottom:20px;">
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
        <label class="filter-label">Data Início</label>
        <input type="date" class="filter-select" id="pred-data-ini" value="2026-03-26"/>
      </div>
      <div class="filter-group" style="max-width:160px;">
        <label class="filter-label">Data Fim</label>
        <input type="date" class="filter-select" id="pred-data-fim" value="2026-05-26"/>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary" id="btn-pred-apply">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Aplicar
        </button>
        <div style="position:relative;">
          <button class="btn btn-outline" id="btn-detalhamento">⚙️ Detalhamento</button>
        </div>
      </div>
    </div>

    <!-- Gráficos linha 1 -->
    <div class="charts-grid">
      ${makeChartCard('chart-regressao', 'Regressão Linear / Matricial', 'Correlação frequência × desempenho', 'regressao')}
      ${makeChartCard('chart-variancia', 'Variância por Disciplina',     'Dispersão das notas',                'variancia')}
    </div>

    <!-- Gráficos linha 2 -->
    <div class="charts-grid">
      ${makeChartCard('chart-media',     'Média e Mediana por Turma',    'Tendência central comparada',        'mediaMediana')}
      ${makeChartCard('chart-homog',     'Homogeneidade dos Dados',      'Uniformidade de desempenho (%)',     'homogeneidade')}
    </div>

    <!-- Gráficos linha 3 -->
    <div class="charts-grid">
      ${makeChartCard('chart-dp',        'Desvio Padrão por Curso',      'Variabilidade (σ) das notas',        'desvioPadrao')}
      ${makeRegistrosCard(data.registros)}
    </div>
    <!-- Tabela resumo -->
    <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:24px;">
      <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:700; color:var(--text-main);">Resumo Estatístico por Curso</div>
      </div>
      <div class="table-wrap" style="width:100%; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; min-width:800px; font-family:'Poppins', sans-serif;">
          <thead>
            <tr>
              <th style="padding:16px; text-align:left; font-weight:600; font-size:1.05rem;">Curso</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Média Geral</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Mediana</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Variância</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Desvio Padrão (σ)</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Homog. (%)</th>
              <th style="padding:16px; text-align:center; font-weight:600; font-size:1.05rem;">Status de Risco</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_DATA.cursos.map((c, i) => {
              const d = MOCK_DATA.estatisticas;
              const media   = d.mediaMediana.medias[i]   ?? '–';
              const mediana = d.mediaMediana.medianas[i] ?? '–';
              const vari    = d.variancia.valores[i]     ?? '–';
              const dp      = d.desvioPadrao.valores[i]  ?? '–';
              const homog   = d.homogeneidade.valores[i] ?? '–';
              return `
                <tr style="background:${i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)'};">
                  <td style="font-weight:700;color:var(--text-strong); text-align:left; padding:16px;">${c.nome}</td>
                  <td style="text-align:center; padding:16px; color:var(--text-strong);">${getNotaBadge(media)}</td>
                  <td style="text-align:center; padding:16px; color:var(--text-strong);">${mediana}</td>
                  <td style="text-align:center; padding:16px; color:var(--text-strong);">${vari}</td>
                  <td style="text-align:center; padding:16px; color:var(--text-strong);">${dp}</td>
                  <td style="padding:16px; color:var(--text-strong);">
                    <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
                      <div style="width:48px;height:6px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                        <div style="width:${homog}%;height:100%;background:${homog > 75 ? 'var(--green)' : homog > 55 ? 'var(--yellow)' : 'var(--red)'};border-radius:99px;"></div>
                      </div>
                      ${homog}%
                    </div>
                  </td>
                  <td style="text-align:center; padding:16px;">
                    <span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:'Poppins', sans-serif;"><span style="color:${c.risco === 'alto' ? 'var(--red)' : c.risco === 'medio' ? 'var(--yellow)' : 'var(--green)'}; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>${c.risco === 'alto' ? 'Alto' : c.risco === 'medio' ? 'Médio' : 'Baixo'}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Tooltips
  bindTooltips(wrapper);

  // Filtros
  wrapper.querySelector('#btn-pred-apply')?.addEventListener('click', () => {
    const cursoId = wrapper.querySelector('#pred-curso')?.value;
    state.setFilter('cursoId', cursoId || null);
    // atualiza contagem
    let total = MOCK_DATA.estatisticas.registros.total;
    if (cursoId) {
      total = MOCK_DATA.turmas.filter(t => t.cursoId === cursoId)
                              .reduce((s, t) => s + t.alunos, 0);
    }
    const el = wrapper.querySelector('#stat-count-num');
    if (el) el.textContent = total.toLocaleString('pt-BR');
  });

  wrapper.querySelector('#btn-detalhamento')?.addEventListener('click', () => {
    openFilterPanel(() => {});
  });

  // Charts
  renderCharts(data, 'chart-');
}

/* ─── Helpers ────────────────────────────────────────────────── */
function makeChartCard(id, title, subtitle, key) {
  const tt = TOOLTIPS[key] || { titulo: title, texto: '' };
  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="chart-title">${title}</div>
          <div class="chart-subtitle">${subtitle}</div>
        </div>
        <div style="position:relative;flex-shrink:0;">
          <button class="tooltip-btn chart-tt-btn" aria-label="Saiba mais">?</button>
          <div class="tooltip-popup" style="display:none;">
            <strong>${tt.titulo}</strong><br/><br/>${tt.texto}
          </div>
        </div>
      </div>
      <div class="chart-canvas-wrap"><canvas id="${id}"></canvas></div>
    </div>
  `;
}

function makeRegistrosCard(reg) {
  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="chart-title">Registros Analisados</div>
          <div class="chart-subtitle">Dinâmico conforme filtro ativo</div>
        </div>
        <div style="position:relative;flex-shrink:0;">
          <button class="tooltip-btn chart-tt-btn" aria-label="Saiba mais">?</button>
          <div class="tooltip-popup" style="display:none;">
            <strong>${TOOLTIPS.registros.titulo}</strong><br/><br/>${TOOLTIPS.registros.texto}
          </div>
        </div>
      </div>
      <div class="stat-count-card" style="margin:12px 0 16px;">
        <div class="stat-count-num" id="stat-count-num">${reg.total.toLocaleString('pt-BR')}</div>
        <div class="stat-count-label">Total de Registros Ativos</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        <div style="background:var(--bg-page);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border-color);">
          <div style="font-family: 'Poppins', sans-serif;font-size:1.3rem;font-weight:800;color:var(--blue-primary);">${reg.filtrado.toLocaleString('pt-BR')}</div>
          <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px;">Filtro Atual</div>
        </div>
        <div style="background:var(--bg-page);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border-color);">
          <div style="font-family: 'Poppins', sans-serif;font-size:1.3rem;font-weight:800;color:var(--green);">${reg.periodos.length}</div>
          <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px;">Períodos</div>
        </div>
      </div>
      ${reg.periodos.map((p, i) => {
        const pct = Math.round((reg.porPeriodo[i] / reg.total) * 100);
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
            <span style="font-size:.7rem;color:var(--text-muted);min-width:48px;">${p}</span>
            <div style="flex:1;height:5px;background:var(--border-color);border-radius:99px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:var(--blue-primary);border-radius:99px;"></div>
            </div>
            <span style="font-size:.7rem;color:var(--text-muted);min-width:32px;">${reg.porPeriodo[i].toLocaleString('pt-BR')}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function bindTooltips(scope) {
  scope.querySelectorAll('.chart-tt-btn').forEach(btn => {
    const popup = btn.nextElementSibling;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const show = popup.style.display === 'none';
      scope.querySelectorAll('.tooltip-popup').forEach(p => p.style.display = 'none');
      popup.style.display = show ? 'block' : 'none';
    });
  });
  document.addEventListener('click', () => {
    scope.querySelectorAll?.('.tooltip-popup')?.forEach(p => p.style.display = 'none');
  });
}

/* ─── Chart.js rendering ────────────────────────────────────── */
function renderCharts(data, prefix) {
  if (typeof Chart === 'undefined') return;

  const B = '#3AADE5', G = '#22C55E', R = '#EF4444',
        Y = '#EAB308', O = '#F97316', P = '#8B5CF6';

  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { font: { family:'Inter', size:11 }, color:'#64748B' } } },
  };

  // 1. Regressão (scatter + trendline)
  const c1 = document.getElementById(`${prefix}regressao`);
  if (c1) {
    _charts[`${prefix}r`]?.destroy();
    _charts[`${prefix}r`] = new Chart(c1, {
      type: 'scatter',
      data: { datasets: [
        { label:'Alunos', data:data.regressao.pontos, backgroundColor:`${B}88`, borderColor:B, pointRadius:5 },
        { label:'Tendência', data:data.regressao.linha, type:'line', borderColor:R, borderWidth:2, borderDash:[5,4], pointRadius:0, fill:false },
      ]},
      options: { ...base, scales: { x:{title:{display:true,text:'Semana',color:'#64748B'}}, y:{min:0,max:10,title:{display:true,text:'Nota',color:'#64748B'}} } },
    });
  }

  // 2. Variância (barras)
  const c2 = document.getElementById(`${prefix}variancia`);
  if (c2) {
    _charts[`${prefix}v`]?.destroy();
    _charts[`${prefix}v`] = new Chart(c2, {
      type: 'bar',
      data: { labels:data.variancia.labels, datasets:[
        { label:'Variância', data:data.variancia.valores, backgroundColor:[B,G,Y,O,P].map(c=>`${c}99`), borderColor:[B,G,Y,O,P], borderWidth:2, borderRadius:5 },
        { label:`Média (${data.variancia.media})`, data:Array(data.variancia.labels.length).fill(data.variancia.media), type:'line', borderColor:R, borderWidth:2, borderDash:[5,3], pointRadius:0, fill:false },
      ]},
      options: { ...base, scales: { y:{beginAtZero:true} } },
    });
  }

  // 3. Média e Mediana (barras agrupadas)
  const c3 = document.getElementById(`${prefix}media`);
  if (c3) {
    _charts[`${prefix}m`]?.destroy();
    _charts[`${prefix}m`] = new Chart(c3, {
      type: 'bar',
      data: { labels:data.mediaMediana.labels, datasets:[
        { label:'Média',   data:data.mediaMediana.medias,   backgroundColor:`${B}BB`, borderColor:B, borderWidth:2, borderRadius:5 },
        { label:'Mediana', data:data.mediaMediana.medianas, backgroundColor:`${G}BB`, borderColor:G, borderWidth:2, borderRadius:5 },
      ]},
      options: { ...base, scales: { y:{min:0,max:10} } },
    });
  }

  // 4. Homogeneidade (radar)
  const c4 = document.getElementById(`${prefix}homog`);
  if (c4) {
    _charts[`${prefix}h`]?.destroy();
    _charts[`${prefix}h`] = new Chart(c4, {
      type: 'radar',
      data: { labels:data.homogeneidade.labels, datasets:[
        { label:'Homogeneidade (%)', data:data.homogeneidade.valores, backgroundColor:`${B}33`, borderColor:B, borderWidth:2, pointBackgroundColor:B, pointRadius:4 },
      ]},
      options: { ...base, scales: { r:{ min:0, max:100, ticks:{color:'#64748B',font:{size:9}}, grid:{color:'#E2E8F0'}, pointLabels:{font:{size:9,family:'Inter'},color:'#1E293B'} } } },
    });
  }

  // 5. Desvio Padrão (horizontal)
  const c5 = document.getElementById(`${prefix}dp`);
  if (c5) {
    _charts[`${prefix}dp`]?.destroy();
    _charts[`${prefix}dp`] = new Chart(c5, {
      type: 'bar',
      data: { labels:data.desvioPadrao.labels, datasets:[
        { label:'Desvio Padrão (σ)', data:data.desvioPadrao.valores,
          backgroundColor:data.desvioPadrao.valores.map(v=>v>2?`${R}99`:v>1.5?`${Y}99`:`${G}99`),
          borderColor:data.desvioPadrao.valores.map(v=>v>2?R:v>1.5?Y:G),
          borderWidth:2, borderRadius:5 },
      ]},
      options: { ...base, indexAxis:'y', scales: { x:{beginAtZero:true} } },
    });
  }

  // 6. Distribuição (apenas na aba Estatísticas)
  const c6 = document.getElementById(`${prefix}dist`);
  if (c6) {
    _charts[`${prefix}di`]?.destroy();
    _charts[`${prefix}di`] = new Chart(c6, {
      type: 'bar',
      data: { labels:['0–4 (Crítico)','5–6 (Atenção)','7–8 (Bom)','9–10 (Excelente)'], datasets:[
        { label:'Alunos', data:[312,487,1594,454],
          backgroundColor:[`${R}99`,`${Y}99`,`${B}99`,`${G}99`],
          borderColor:[R,Y,B,G], borderWidth:2, borderRadius:6 },
      ]},
      options: { ...base, scales: { y:{beginAtZero:true,title:{display:true,text:'Alunos',color:'#64748B'}} } },
    });
  }
}

