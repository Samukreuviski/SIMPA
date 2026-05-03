/** Cursos.js — Cursos agrupados a partir dos dados reais de /alunos/todos */
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

function CourseCard({ nomeCurso, alunos }) {
  const [expanded, setExpanded] = useStateC(false);
  const barRef  = useRefC(null);
  const barInst = useRefC(null);

  // Agrupa alunos por situação
  const situacoes = alunos.reduce((acc, a) => {
    const s = a.SITUAÇÃO || 'Cursando';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const total      = alunos.length;
  const aprovados  = situacoes['Aprovado'] || 0;
  const reprovados = (situacoes['Reprovado'] || 0) + (situacoes['Reprovado por Falta'] || 0);
  const cursando   = situacoes['Cursando'] || 0;
  const taxaAprov  = total > 0 ? Math.round((aprovados / total) * 100) : 0;

  // Gráfico de barras das situações
  useEffectC(() => {
    if (!expanded || !barRef.current) return;
    if (barInst.current) barInst.current.destroy();
    const labels = Object.keys(situacoes);
    const values = Object.values(situacoes);
    const colors = labels.map(l => {
      if (l === 'Aprovado') return '#22C55E';
      if (l === 'Reprovado') return '#EF4444';
      if (l === 'Reprovado por Falta') return '#F97316';
      return '#3AADE5';
    });
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Alunos', data: values, backgroundColor: colors, borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#E2E8F0' }, ticks: { precision: 0 } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        },
        animation: { duration: 400 }
      }
    });
    return () => { if (barInst.current) barInst.current.destroy(); };
  }, [expanded]);

  return (
    <div className="course-card">
      <div className="course-card-header">
        <div className="course-name">{nomeCurso}</div>
        <div className="course-coord" style={{ marginTop: 4, opacity: .8, fontSize: '.78rem' }}>📚 {total} alunos cadastrados</div>
      </div>
      <div className="course-card-body">
        <div className="course-stats">
          <div className="course-stat">
            <div className="cs-val">{total}</div>
            <div className="cs-label">Total</div>
          </div>
          <div className="course-stat">
            <div className="cs-val" style={{ color: 'var(--green)' }}>{aprovados}</div>
            <div className="cs-label">Aprovados</div>
          </div>
          <div className="course-stat">
            <div className="cs-val" style={{ color: 'var(--red)' }}>{reprovados}</div>
            <div className="cs-label">Reprovados</div>
          </div>
          <div className="course-stat">
            <div className="cs-val" style={{ color: 'var(--blue-light)' }}>{taxaAprov}%</div>
            <div className="cs-label">Aprovação</div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          id={`expand-course-${nomeCurso.replace(/\s/g, '-')}`}
          style={{ width:'100%', padding:'8px', background:'var(--gray-bg)', border:'1px solid var(--gray-border)', borderRadius:6, cursor:'pointer', fontSize:'.82rem', color:'var(--blue-dark)', fontWeight:600, transition:'background .2s' }}
        >
          {expanded ? '▲ Ocultar gráfico' : '▼ Ver distribuição de situações'}
        </button>

        {expanded && (
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 180 }}>
              <canvas ref={barRef} id={`chart-${nomeCurso.replace(/\s/g, '-')}`} />
            </div>
            <div style={{ marginTop: 12, display:'flex', flexWrap:'wrap', gap:8 }}>
              {Object.entries(situacoes).map(([sit, cnt]) => {
                const b = Utils.situacaoBadge(sit);
                return (
                  <div key={sit} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', background:'var(--gray-bg)', borderRadius:6, border:'1px solid var(--gray-border)', flex:'1', minWidth:120 }}>
                    <span className={`badge ${b.cls}`}>{b.label}</span>
                    <span style={{ fontFamily:'Roboto Mono,monospace', fontWeight:700, fontSize:'.9rem' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Cursos() {
  const [cursos,  setCursos]  = useStateC({});
  const [loading, setLoading] = useStateC(true);
  const [erro,    setErro]    = useStateC(false);

  useEffectC(() => {
    API.getAlunos().then(alunos => {
      if (!alunos) { setErro(true); setLoading(false); return; }
      // Agrupa por NOME_CURSO
      const map = {};
      alunos.forEach(a => {
        const curso = a.NOME_CURSO || 'Curso não informado';
        if (!map[curso]) map[curso] = [];
        map[curso].push(a);
      });
      setCursos(map);
      setLoading(false);
    }).catch(() => { setErro(true); setLoading(false); });
  }, []);

  if (loading) return <LoadingState type="page" />;
  if (erro) return <EmptyState title="Erro ao carregar cursos" desc="Verifique se o servidor está rodando." onRetry={() => location.reload()} />;

  const cursoNomes = Object.keys(cursos).sort();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cursos</h1>
        <p className="page-subtitle">Visão consolidada por curso — dados reais do banco acadêmico.</p>
      </div>

      {cursoNomes.length === 0 ? (
        <EmptyState title="Nenhum curso encontrado" desc="Não há dados de cursos disponíveis na API." />
      ) : (
        <div className="courses-grid">
          {cursoNomes.map(nome => (
            <CourseCard key={nome} nomeCurso={nome} alunos={cursos[nome]} />
          ))}
        </div>
      )}

      <div className="section-card" style={{ marginTop: 20 }}>
        <InsightCard icon="📊" text={`${cursoNomes.length} curso(s) encontrado(s) no banco de dados. Expanda cada card para ver a distribuição de situações por curso.`} />
      </div>
    </div>
  );
}

window.Cursos = Cursos;
