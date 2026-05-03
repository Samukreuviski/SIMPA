/** Dashboard.js — Visão Geral com dados reais da API */
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

function Dashboard() {
  const [stats,   setStats]   = useStateD(null);
  const [gerais,  setGerais]  = useStateD(null);
  const [turmas,  setTurmas]  = useStateD({});  // { turma: { medias, risco } }
  const [loading, setLoading] = useStateD(true);
  const [erro,    setErro]    = useStateD(false);
  const donutRef  = useRefD(null);
  const donutInst = useRefD(null);

  useEffectD(() => {
    Promise.all([
      API.getEstatisticasAvancadas(),
      API.getEstatisticasGerais(),
      API.getAllBoletins(),
    ]).then(([adv, ger, boletins]) => {
      if (!adv && !ger) { setErro(true); setLoading(false); return; }
      setStats(adv);
      setGerais(ger);

      // Agrupar boletins por turma para o card de qualidade
      const map = {};
      boletins.forEach(b => {
        b.boletim.forEach(reg => {
          const turma = reg.turma || 'S/T';
          if (!map[turma]) map[turma] = { medias: [], reprovados: 0, total: 0 };
          const media = Utils.calcMedia(reg);
          map[turma].medias.push(media);
          map[turma].total++;
          if (reg.situacao !== 'Aprovado') map[turma].reprovados++;
        });
      });
      setTurmas(map);
      setLoading(false);
    }).catch(() => { setErro(true); setLoading(false); });
  }, []);

  // Donut chart das situações
  useEffectD(() => {
    if (!gerais || !donutRef.current) return;
    if (donutInst.current) donutInst.current.destroy();
    const sit = gerais.indicadores_de_situacao || {};
    const labels = Object.keys(sit);
    const values = Object.values(sit);
    const colors = labels.map(l => {
      if (l === 'Aprovado')            return '#22C55E';
      if (l === 'Reprovado')           return '#EF4444';
      if (l === 'Reprovado por Falta') return '#F97316';
      if (l === 'Cursando')            return '#3AADE5';
      return '#94A3B8';
    });
    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }] },
      options: {
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 }, usePointStyle: true } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} alunos` } }
        },
        animation: { animateScale: true, duration: 600 }
      }
    });
    return () => { if (donutInst.current) donutInst.current.destroy(); };
  }, [gerais]);

  if (loading) return <LoadingState type="page" />;
  if (erro) return <EmptyState title="Erro ao carregar dados" desc="Verifique se o servidor está rodando." onRetry={() => location.reload()} />;

  const q   = stats?.estatisticas_descritivas?.notas_quartis || {};
  const dp  = stats?.estatisticas_descritivas?.desvio_padrao || 0;
  const totalReg  = gerais?.total_registros_analisados || 0;
  const retencao  = stats?.kpis_desempenho?.indice_retencao_alunos_pct ?? 0;
  const reprovacao= stats?.kpis_desempenho?.taxa_reprovacao_geral_pct ?? 0;
  const q1 = q.Q1 || 0, q2 = q.Q2 || 0, q3 = q.Q3 || 0, iqr = q.IQR || 0;

  const segs = [
    { label: 'Zona Crítica',  color: '#EF4444', start: 0,   end: q1  },
    { label: 'Zona Baixa',    color: '#F97316', start: q1,  end: q2  },
    { label: 'Zona Média',    color: '#3AADE5', start: q2,  end: q3  },
    { label: 'Zona Boa',      color: '#22C55E', start: q3,  end: 100 },
  ];

  // Top 6 turmas por quantidade de alunos
  const turmaKeys = Object.keys(turmas).sort((a, b) => turmas[b].total - turmas[a].total).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{Utils.saudacao()}, Predicta 👋</h1>
        <p className="page-subtitle">Acompanhe os indicadores institucionais em tempo real.</p>
      </div>

      {/* KPIs reais */}
      <div className="kpi-grid">
        <KpiCard label="Total de Registros" value={totalReg} desc="Registros acadêmicos analisados"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <KpiCard label="Índice de Retenção" value={`${retencao}%`} desc="Alunos retidos no período" variant="green"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
        />
        <KpiCard label="Taxa de Reprovação" value={`${reprovacao}%`} desc="Reprovados e reprovados por falta" variant="red"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
        />
        <KpiCard label="Desvio Padrão" value={Utils.fmt2(dp)} desc="Dispersão das notas (σ)" variant="yellow"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Distribuição de Quartis</div>
          <div className="chart-subtitle">Q1 · Mediana · Q3 das notas reais</div>
          <div className="quartile-bar-wrap">
            <div className="quartile-bar">
              {segs.map(s => (
                <div key={s.label} className="quartile-segment"
                  style={{ width: `${Math.max(s.end - s.start, 0)}%`, background: s.color }}
                  title={`${s.label}: ${s.start.toFixed(1)}–${s.end.toFixed(1)}`}
                />
              ))}
            </div>
            <div className="quartile-labels">
              {[{val:q1,name:'Q1'},{val:q2,name:'Q2 (Mediana)',cls:'blue'},{val:q3,name:'Q3',cls:'green'},{val:iqr,name:'IQR'}].map(x => (
                <div key={x.name} className="ql-item">
                  <div className="ql-val" style={x.cls==='blue'?{color:'var(--blue-light)'}:x.cls==='green'?{color:'var(--green)'}:{}}>{Utils.fmt2(x.val)}</div>
                  <div className="ql-name">{x.name}</div>
                </div>
              ))}
            </div>
            <div className="quartile-legend">
              {segs.map(s => (
                <div key={s.label} className="ql-legend-item">
                  <span className="ql-dot" style={{ background: s.color }} />{s.label}
                </div>
              ))}
            </div>
          </div>
          <InsightCard text={`A mediana de ${Utils.fmt2(q2)} indica que metade dos alunos possui nota igual ou superior a este valor. IQR de ${Utils.fmt2(iqr)} representa a dispersão central da distribuição.`} />
        </div>

        <div className="chart-card">
          <div className="chart-title">Distribuição de Situações</div>
          <div className="chart-subtitle">Dados reais do banco acadêmico</div>
          <div className="chart-canvas-wrap"><canvas ref={donutRef} id="donut-chart" /></div>
        </div>
      </div>

      {/* Qualidade das Turmas — dados reais dos boletins */}
      <div className="section-card">
        <div className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Indicadores de Qualidade das Turmas
        </div>
        {turmaKeys.length === 0 ? (
          <EmptyState title="Dados de turmas não disponíveis" desc="Nenhum boletim encontrado." />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {turmaKeys.map(t => {
              const td = turmas[t];
              const mediaT = td.medias.length > 0 ? td.medias.reduce((a,b)=>a+b,0)/td.medias.length : 0;
              return (
                <div key={t} style={{ background:'var(--gray-bg)', borderRadius:8, padding:'14px 16px', border:'1px solid var(--gray-border)' }}>
                  <div style={{ fontWeight:600, fontSize:'.88rem', marginBottom:6 }}>Turma {t}</div>
                  <div style={{ fontSize:'1.2rem', fontWeight:700, fontFamily:'Roboto Mono,monospace', color: Utils.notaColor(mediaT) }}>{mediaT.toFixed(1)}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--gray-text)', marginBottom:8 }}>Média — {td.total} registros</div>
                  <span className={`badge ${td.reprovados===0?'green':td.reprovados<=2?'yellow':'red'}`}>{td.reprovados} reprovados</span>
                </div>
              );
            })}
          </div>
        )}
        <InsightCard icon="📊" text={`Q1 = ${Utils.fmt2(q1)} e Q3 = ${Utils.fmt2(q3)}: 50% dos alunos concentram-se nesta faixa. Desvio padrão de ${Utils.fmt2(dp)} indica ${dp<10?'baixa':'moderada a alta'} variabilidade entre alunos.`} />
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
