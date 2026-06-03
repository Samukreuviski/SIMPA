/**
 * Estatisticas.js — Predicta
 * Módulo de estatísticas avançadas com todos os 6 indicadores,
 * tooltips didáticos e gráficos expandidos.
 * (Visível apenas para admin e gestao)
 */

import { MOCK_DATA } from '../mockData.js';

export async function renderEstatisticas(container) {
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) periodoEl.innerHTML = '';

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Header -->
      <div class="section-header" style="margin-bottom:24px;">
        <div>
          <div class="section-title" style="font-size:1.1rem;">
            📊 Painel Estatístico Avançado
          </div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;">
            Análise completa dos indicadores acadêmicos — UniEVANGÉLICA 2026
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge badge-blue">Dados: 2026.1</span>
          <span class="badge badge-green">2.847 registros</span>
        </div>
      </div>

      <!-- Linha 1 -->
      <div class="charts-grid">
        ${makeStatCard('est-regressao', 'Regressão Linear / Matricial', 'Correlação notas × tempo acadêmico', 'regressao')}
        ${makeStatCard('est-variancia', 'Variância por Disciplina', 'Dispersão das notas por componente curricular', 'variancia')}
      </div>

      <!-- Linha 2 -->
      <div class="charts-grid">
        ${makeStatCard('est-media', 'Média e Mediana por Turma', 'Comparativo de tendência central por turma', 'mediaMediana')}
        ${makeStatCard('est-homog', 'Homogeneidade dos Dados', 'Índice de uniformidade de desempenho por curso (%)', 'homogeneidade')}
      </div>

      <!-- Linha 3 -->
      <div class="charts-grid">
        ${makeStatCard('est-dp', 'Desvio Padrão por Curso', 'Variabilidade das notas — σ (sigma)', 'desvioPadrao')}
        ${makeStatCard('est-dist', 'Distribuição de Notas', 'Frequência de notas por faixa de desempenho', 'distribuicao')}
      </div>

      <!-- Tabela resumo -->
      <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:24px;">
        <div style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-family:'Poppins', sans-serif; font-size:1.15rem; font-weight:700; color:var(--text-main);">Resumo Estatístico por Curso</div>
        </div>
        <div class="table-wrap" style="width:100%; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; min-width:800px; font-family:'Poppins', sans-serif;">
            <thead>
              <tr style="background:var(--blue-primary); color:var(--bg-page);">
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
    const media = MOCK_DATA.estatisticas.mediaMediana.medias[i] ?? '–';
    const mediana = MOCK_DATA.estatisticas.mediaMediana.medianas[i] ?? '–';
    const vari = MOCK_DATA.estatisticas.variancia.valores[i] ?? '–';
    const dp = MOCK_DATA.estatisticas.desvioPadrao.valores[i] ?? '–';
    const homog = MOCK_DATA.estatisticas.homogeneidade.valores[i] ?? '–';
    return `
                  <tr style="background:${i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)'};">
                    <td style="font-weight:700;color:var(--text-strong); text-align:left; padding:16px;">${c.nome}</td>
                    <td style="text-align:center; padding:16px; color:var(--text-strong);"><span class="${parseFloat(media) >= 7 ? 'nota-alta' : parseFloat(media) >= 5 ? 'nota-media' : 'nota-baixa'}">${media}</span></td>
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

    </div>
  `;

  // Renderiza os gráficos
  renderEstCharts();

  // Tooltips
  container.querySelectorAll('.chart-tooltip-btn').forEach(btn => {
    const popup = btn.nextElementSibling;
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

  return () => {
    Object.values(_estCharts).forEach(c => c?.destroy?.());
  };
}

const TOOLTIPS = {
  regressao: { titulo: 'Regressão Linear', texto: 'Mostra a tendência geral das notas ao longo do tempo — como uma linha que representa o "rumo" que os alunos estão tomando.' },
  variancia: { titulo: 'Variância', texto: 'Mede o quanto as notas dos alunos são diferentes entre si. Variância alta = alunos com desempenhos muito diferentes. Baixa = turma mais homogênea.' },
  mediaMediana: { titulo: 'Média e Mediana', texto: 'Média é a soma das notas dividida pelo total. Mediana é a nota do aluno do meio. Quando são iguais, a distribuição é equilibrada.' },
  homogeneidade: { titulo: 'Homogeneidade', texto: 'Indica se os alunos de uma turma têm desempenho parecido (alta) ou muito diferente (baixa). Útil para ajustar a didática do professor.' },
  desvioPadrao: { titulo: 'Desvio Padrão (σ)', texto: 'É a "distância típica" de cada aluno em relação à média. σ = 1 significa que a maioria está 1 ponto acima ou abaixo da média.' },
  distribuicao: { titulo: 'Distribuição de Notas', texto: 'Mostra quantos alunos estão em cada faixa de nota (ex: quantos tiraram entre 0-4, entre 5-6, entre 7-10). Ajuda a ver a curva da turma.' },
};

function makeStatCard(id, title, subtitle, key) {
  const tt = TOOLTIPS[key] || { titulo: title, texto: '' };
  return `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <div class="chart-title">${title}</div>
          <div class="chart-subtitle">${subtitle}</div>
        </div>
        <div style="position:relative;flex-shrink:0;">
          <button class="tooltip-btn chart-tooltip-btn" aria-label="Saiba mais">?</button>
          <div class="tooltip-popup" style="display:none;">
            <strong>${tt.titulo}</strong><br/><br/>${tt.texto}
          </div>
        </div>
      </div>
      <div class="chart-canvas-wrap" style="height:200px;">
        <canvas id="${id}"></canvas>
      </div>
    </div>
  `;
}

let _estCharts = {};
function renderEstCharts() {
  if (typeof Chart === 'undefined') return;
  const d = MOCK_DATA.estatisticas;
  const BLUE = '#3AADE5', GREEN = '#22C55E', RED = '#EF4444',
    YELL = '#EAB308', ORG = '#F97316', PUR = '#8B5CF6';

  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { font: { family: 'Inter', size: 10 }, color: '#64748B' } } },
  };

  // 1. Regressão
  const c1 = document.getElementById('est-regressao');
  if (c1) {
    _estCharts.r?.destroy();
    _estCharts.r = new Chart(c1, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Alunos', data: d.regressao.pontos, backgroundColor: `${BLUE}88`, borderColor: BLUE, pointRadius: 5 },
          { label: 'Tendência', data: d.regressao.linha, type: 'line', borderColor: RED, borderWidth: 2, borderDash: [5, 4], pointRadius: 0, fill: false },
        ]
      },
      options: { ...opts, scales: { x: { title: { display: true, text: 'Semana', color: '#64748B' } }, y: { min: 0, max: 10, title: { display: true, text: 'Nota', color: '#64748B' } } } },
    });
  }

  // 2. Variância
  const c2 = document.getElementById('est-variancia');
  if (c2) {
    _estCharts.v?.destroy();
    _estCharts.v = new Chart(c2, {
      type: 'bar',
      data: {
        labels: d.variancia.labels, datasets: [
          { label: 'Variância', data: d.variancia.valores, backgroundColor: [BLUE, GREEN, YELL, ORG, PUR].map(c => `${c}99`), borderColor: [BLUE, GREEN, YELL, ORG, PUR], borderWidth: 2, borderRadius: 5 },
        ]
      },
      options: { ...opts, scales: { y: { beginAtZero: true } } },
    });
  }

  // 3. Média e Mediana
  const c3 = document.getElementById('est-media');
  if (c3) {
    _estCharts.m?.destroy();
    _estCharts.m = new Chart(c3, {
      type: 'bar',
      data: {
        labels: d.mediaMediana.labels, datasets: [
          { label: 'Média', data: d.mediaMediana.medias, backgroundColor: `${BLUE}BB`, borderColor: BLUE, borderWidth: 2, borderRadius: 5 },
          { label: 'Mediana', data: d.mediaMediana.medianas, backgroundColor: `${GREEN}BB`, borderColor: GREEN, borderWidth: 2, borderRadius: 5 },
        ]
      },
      options: { ...opts, scales: { y: { min: 0, max: 10 } } },
    });
  }

  // 4. Homogeneidade (Radar)
  const c4 = document.getElementById('est-homog');
  if (c4) {
    _estCharts.h?.destroy();
    _estCharts.h = new Chart(c4, {
      type: 'radar',
      data: {
        labels: d.homogeneidade.labels, datasets: [
          { label: 'Homogeneidade (%)', data: d.homogeneidade.valores, backgroundColor: `${BLUE}33`, borderColor: BLUE, borderWidth: 2, pointBackgroundColor: BLUE, pointRadius: 4 },
        ]
      },
      options: { ...opts, scales: { r: { min: 0, max: 100, ticks: { color: '#64748B', font: { size: 9 } }, grid: { color: '#E2E8F0' }, pointLabels: { font: { size: 9, family: 'Inter' }, color: '#1E293B' } } } },
    });
  }

  // 5. Desvio Padrão
  const c5 = document.getElementById('est-dp');
  if (c5) {
    _estCharts.dp?.destroy();
    _estCharts.dp = new Chart(c5, {
      type: 'bar',
      data: {
        labels: d.desvioPadrao.labels, datasets: [
          {
            label: 'Desvio Padrão (σ)', data: d.desvioPadrao.valores,
            backgroundColor: d.desvioPadrao.valores.map(v => v > 2 ? `${RED}99` : v > 1.5 ? `${YELL}99` : `${GREEN}99`),
            borderColor: d.desvioPadrao.valores.map(v => v > 2 ? RED : v > 1.5 ? YELL : GREEN),
            borderWidth: 2, borderRadius: 5
          },
        ]
      },
      options: { ...opts, indexAxis: 'y', scales: { x: { beginAtZero: true } } },
    });
  }

  // 6. Distribuição de notas (agrupado)
  const c6 = document.getElementById('est-dist');
  if (c6) {
    _estCharts.di?.destroy();
    _estCharts.di = new Chart(c6, {
      type: 'bar',
      data: {
        labels: ['0–4 (Crítico)', '5–6 (Atenção)', '7–8 (Bom)', '9–10 (Excelente)'],
        datasets: [{
          label: 'Nº de Alunos', data: [312, 487, 1594, 454],
          backgroundColor: [`${RED}99`, `${YELL}99`, `${BLUE}99`, `${GREEN}99`],
          borderColor: [RED, YELL, BLUE, GREEN], borderWidth: 2, borderRadius: 6
        }],
      },
      options: { ...opts, scales: { y: { beginAtZero: true, title: { display: true, text: 'Alunos', color: '#64748B' } } } },
    });
  }
}

