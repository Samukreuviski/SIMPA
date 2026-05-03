/** Predicao.js — Predição com dados reais de /predicao/{id} + /registros/{id} */
const { useState: useStateP, useEffect: useEffectP, useRef: useRefP, useMemo: useMemoP } = React;

function Predicao() {
  const [riscos,  setRiscos]  = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [erro,    setErro]    = useStateP(false);
  const [filtro,  setFiltro]  = useStateP('todos');
  const [filtroTurma, setFiltroTurma] = useStateP('todas');
  const [turmasDisponiveis, setTurmasDisponiveis] = useStateP([]);
  const [alunoSelecionado, setAlunoSelecionado] = useStateP(null);
  const [pagina,  setPagina]  = useStateP(1);
  const lineRef  = useRefP(null);
  const lineInst = useRefP(null);
  const scatterRef  = useRefP(null);
  const scatterInst = useRefP(null);
  const POR_PAGINA = 8;

  useEffectP(() => {
    // Carrega alunos, boletins e predições em paralelo
    Promise.all([API.getAlunos(), API.getAllBoletins(), API.getAllPredictions()])
      .then(([alunos, boletins, predicoes]) => {
        if (!predicoes || predicoes.length === 0) { setErro(true); setLoading(false); return; }

        // Mapa de boletim e turma por aluno_id
        const boletimMap = {};
        const turmaMap = {};
        const turmasSet = new Set();

        boletins.forEach(b => {
          if (b && b.id_aluno && b.boletim) {
            const medias = b.boletim.map(r => Utils.calcMedia(r));
            boletimMap[String(b.id_aluno)] = medias.length > 0
              ? medias.reduce((a, c) => a + c, 0) / medias.length
              : 0;
            
            // Pega a turma
            b.boletim.forEach(reg => {
              if (reg.turma) {
                turmaMap[String(b.id_aluno)] = reg.turma;
                turmasSet.add(reg.turma);
              }
            });
          }
        });

        setTurmasDisponiveis(Array.from(turmasSet).sort());

        // Mapa de curso por aluno_id
        const cursoMap = {};
        if (alunos) alunos.forEach(a => { cursoMap[String(a.ID_ALUNO)] = a.NOME_CURSO || '—'; });

        // Constrói array de riscos a partir das predições reais
        const riscoList = predicoes
          .filter(p => !p.erro)
          .map(p => {
            const id   = String(p.aluno_id);
            const ircRaw = Utils.parseIRC(p.score_e_risco?.indice_risco_combinado_irc);
            // Clamp IRC to 0-100 since backend sometimes sends negative numbers
            const irc  = Math.max(0, Math.min(100, ircRaw));
            const nivel= Utils.ircToNivel(irc);
            const nota = boletimMap[id] ?? (p.historico_analisado?.slice(-1)[0] || 0);
            
            // Frequência simulada (mesma fórmula do backend)
            let freq = Math.round(nota * 10 + 20);
            // Clamp frequencia to 0-100 to fix backend overflow bugs
            freq = Math.max(0, Math.min(100, freq));
            
            // Clamp prob to 0-100
            let probRep = parseFloat(p.score_e_risco?.probabilidade_reprovacao) || 0;
            probRep = Math.max(0, Math.min(100, probRep));
            return {
              aluno_id: id,
              nome: Utils.nomeAluno(id),
              curso: cursoMap[id] || '—',
              turma: turmaMap[id] || 'S/T',
              nota_media: parseFloat(nota.toFixed(1)),
              frequencia: freq,
              pontuacao_risco: irc,
              nivel_risco: nivel,
              prob_reprovacao: probRep,
              historico: p.historico_analisado || [],
              previsao: p.motor_predicao?.previsao_proxima_nota,
              tendencia: p.motor_predicao?.curva_tendencia_percentual,
              score_desempenho: p.score_e_risco?.score_desempenho,
            };
          })
          .sort((a, b) => b.pontuacao_risco - a.pontuacao_risco);

        setRiscos(riscoList);
        setLoading(false);
      })
      .catch(() => { setErro(true); setLoading(false); });
  }, []);

  // Gráfico de projeção (usa médias reais do aluno selecionado)
  useEffectP(() => {
    if (loading || !lineRef.current || riscos.length === 0) return;
    if (lineInst.current) lineInst.current.destroy();

    // Pega o aluno selecionado (ou o de maior risco filtrado)
    let filtrados = riscos;
    if (filtro !== 'todos') filtrados = filtrados.filter(r => r.nivel_risco === filtro);
    if (filtroTurma !== 'todas') filtrados = filtrados.filter(r => r.turma === filtroTurma);
    
    if (filtrados.length === 0) return; // Nada a mostrar

    const top = filtrados.find(r => r.aluno_id === alunoSelecionado) || filtrados[0];
    const hist = top.historico || [];
    const previsao = top.previsao;
    const labels = hist.map((_, i) => `Período ${i + 1}`);
    if (previsao != null) labels.push('Projeção');
    const historicoData = hist.map((v, i) => ({ x: i, y: v }));
    const projecaoData  = previsao != null ? [{ x: hist.length - 1, y: hist[hist.length-1] }, { x: hist.length, y: previsao }] : [];

    lineInst.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Histórico (${top.nome})`,
            data: hist,
            borderColor: '#0B4F7C', backgroundColor: 'rgba(11,79,124,.08)',
            borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: '#0B4F7C',
            fill: true, tension: 0.3,
          },
          {
            label: 'Projeção',
            data: [...hist.map(() => null), previsao],
            borderColor: '#3AADE5', borderWidth: 2.5, borderDash: [6, 4],
            pointRadius: 6, pointBackgroundColor: '#3AADE5',
            fill: false, tension: 0.3,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { size: 12 }, usePointStyle: true } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { grid: { color: '#E2E8F0' }, title: { display: true, text: 'Nota Média', font: { size: 11 } } },
          x: { grid: { display: false }, title: { display: true, text: 'Período', font: { size: 11 } } }
        },
        animation: { duration: 500 }
      }
    });
    return () => { if (lineInst.current) lineInst.current.destroy(); };
  }, [loading, riscos, alunoSelecionado, filtro, filtroTurma]);

  // Scatter plot (frequência × nota)
  useEffectP(() => {
    if (loading || !scatterRef.current || riscos.length === 0) return;
    if (scatterInst.current) scatterInst.current.destroy();
    const colorMap = { baixo: '#22C55E', medio: '#EAB308', alto: '#F97316', critico: '#EF4444' };

    scatterInst.current = new Chart(scatterRef.current, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Alunos',
          data: riscos.map(a => ({ x: a.frequencia, y: a.nota_media, nome: a.nome, risco: a.nivel_risco, irc: a.pontuacao_risco })),
          backgroundColor: riscos.map(a => colorMap[a.nivel_risco] + 'CC'),
          pointRadius: riscos.map(a => 5 + a.pontuacao_risco / 14),
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.raw.nome} | Nota: ${ctx.raw.y} | Freq: ${ctx.raw.x}% | IRC: ${ctx.raw.irc}` } }
        },
        scales: {
          x: { min: 45, max: 100, title: { display: true, text: 'Frequência (%)' }, grid: { color: '#E2E8F0' } },
          y: { title: { display: true, text: 'Nota Média' }, grid: { color: '#E2E8F0' } }
        }
      }
    });
    return () => { if (scatterInst.current) scatterInst.current.destroy(); };
  }, [loading, riscos]);

  const filtrados = useMemoP(() => {
    let result = riscos;
    if (filtro !== 'todos') result = result.filter(r => r.nivel_risco === filtro);
    if (filtroTurma !== 'todas') result = result.filter(r => r.turma === filtroTurma);
    return result;
  }, [riscos, filtro, filtroTurma]);

  const totalPags = Math.ceil(filtrados.length / POR_PAGINA);
  const items = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const criticos = riscos.filter(r => r.nivel_risco === 'critico').length;
  const altos    = riscos.filter(r => r.nivel_risco === 'alto').length;
  const medios   = riscos.filter(r => r.nivel_risco === 'medio').length;
  const baixos   = riscos.filter(r => r.nivel_risco === 'baixo').length;

  if (loading) return <LoadingState type="page" />;
  if (erro) return <EmptyState title="Erro ao carregar predições" desc="Verifique se o servidor está rodando." onRetry={() => location.reload()} />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Predição Acadêmica</h1>
        <p className="page-subtitle">Projeções e riscos calculados com dados reais do banco acadêmico.</p>
      </div>

      {/* Banner */}
      <div className="risk-summary-banner">
        <div className="rsb-icon">🎯</div>
        <div>
          <div className="rsb-title">Resumo Executivo de Predição</div>
          <div className="rsb-desc">{riscos.length} alunos analisados. {criticos + altos} apresentam risco elevado de reprovação. {criticos} em situação crítica requerem atenção imediata.</div>
          <div className="risk-levels">
            <div className="risk-pill critical">🔴 {criticos} Críticos</div>
            <div className="risk-pill high">🟠 {altos} Altos</div>
            <div className="risk-pill medium">🟡 {medios} Médios</div>
            <div className="risk-pill low">🟢 {baixos} Baixos</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Projeção de Notas</div>
          <div className="chart-subtitle">Histórico real + projeção (Clique na tabela para ver um aluno específico)</div>
          <div className="chart-canvas-wrap"><canvas ref={lineRef} id="projecao-chart" /></div>
          <InsightCard text="A linha tracejada representa a projeção calculada pelo motor de regressão linear do backend com base no histórico real de notas do aluno selecionado." />
        </div>
        <div className="chart-card">
          <div className="chart-title">Radar de Risco</div>
          <div className="chart-subtitle">Frequência × Nota — IRC (Índice de Risco Combinado)</div>
          <div className="chart-canvas-wrap"><canvas ref={scatterRef} id="scatter-chart" /></div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:10 }}>
            {[['#22C55E','Baixo'],['#EAB308','Médio'],['#F97316','Alto'],['#EF4444','Crítico']].map(([c,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', color:'var(--gray-text)' }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de risco */}
      <div className="section-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div className="section-title" style={{ margin:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Alunos Analisados ({filtrados.length})
          </div>
          <div style={{ display:'flex', gap: 10 }}>
            <select className="filter-select" value={filtroTurma} onChange={e => { setFiltroTurma(e.target.value); setPagina(1); setAlunoSelecionado(null); }}>
              <option value="todas">Todas as Turmas</option>
              {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select id="filtro-risco-select" className="filter-select" value={filtro} onChange={e => { setFiltro(e.target.value); setPagina(1); setAlunoSelecionado(null); }}>
              <option value="todos">Todos os níveis de Risco</option>
              <option value="critico">Crítico</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
              <option value="baixo">Baixo</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Aluno</th><th>Turma</th><th>Nota Média</th><th>Freq. Est.</th><th>Score Risco</th><th>Nível</th><th>Prob. Reprovação</th><th>Previsão</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={8}><EmptyState title="Nenhum aluno neste nível" /></td></tr>}
              {items.map(a => {
                const b = Utils.riscoBadge(a.nivel_risco);
                const isSelected = alunoSelecionado === a.aluno_id;
                return (
                  <tr 
                    key={a.aluno_id} 
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(58,173,229,.1)' : undefined }}
                    onClick={() => {
                      setAlunoSelecionado(a.aluno_id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <td style={{ fontWeight:600 }}>{a.nome}</td>
                    <td style={{ fontSize:'.8rem', color:'var(--gray-text)' }}>{a.turma}</td>
                    <td className={Utils.notaClass(a.nota_media)}>{a.nota_media.toFixed(1)}</td>
                    <td style={{ color: a.frequencia < 70 ? 'var(--red)' : 'inherit', fontWeight: a.frequencia < 70 ? 700 : 400 }}>{a.frequencia}%</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:60, height:6, background:'#E2E8F0', borderRadius:99 }}>
                          <div style={{ width:`${a.pontuacao_risco}%`, height:'100%', borderRadius:99, background: a.pontuacao_risco>=76?'#EF4444':a.pontuacao_risco>=51?'#F97316':a.pontuacao_risco>=26?'#EAB308':'#22C55E' }} />
                        </div>
                        <span style={{ fontSize:'.78rem', fontFamily:'Roboto Mono,monospace', fontWeight:600 }}>{a.pontuacao_risco}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${b.cls}`}>{b.label}</span></td>
                    <td style={{ fontFamily:'Roboto Mono,monospace', fontSize:'.82rem', color: a.prob_reprovacao > 50 ? 'var(--red)' : 'inherit' }}>{a.prob_reprovacao}%</td>
                    <td style={{ fontFamily:'Roboto Mono,monospace', fontSize:'.82rem', color:'var(--blue-light)', fontWeight:600 }}>{a.previsao != null ? a.previsao.toFixed(1) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPags > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPags }, (_, i) => (
              <button key={i+1} className={`page-btn${pagina===i+1?' active':''}`} onClick={() => setPagina(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPags}>›</button>
          </div>
        )}

        <InsightCard icon="🎯" text={`IRC (Índice de Risco Combinado) calculado pelo backend com base na nota média e frequência estimada. Scores acima de 75 indicam risco crítico. Probabilidade de reprovação calculada por regressão logística.`} />
      </div>
    </div>
  );
}

window.Predicao = Predicao;
