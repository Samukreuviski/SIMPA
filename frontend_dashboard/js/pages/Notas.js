/** Notas.js — Tabela de notas com dados reais de /alunos/todos + /registros/{id} */
const { useState: useStateN, useEffect: useEffectN, useRef: useRefN, useMemo: useMemoN } = React;

// Modal de boletim individual
function ModalBoletim({ aluno, boletim, onClose }) {
  const histRef  = useRefN(null);
  const histInst = useRefN(null);

  useEffectN(() => {
    if (!histRef.current || boletim.length === 0) return;
    if (histInst.current) histInst.current.destroy();
    const medias = boletim.map(r => parseFloat(Utils.calcMedia(r).toFixed(1)));
    const labels = boletim.map(r => r.cod_disciplina || 'Disc.');
    histInst.current = new Chart(histRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Média', data: medias, backgroundColor: medias.map(m => Utils.notaColor(m)), borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: '#E2E8F0' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
    return () => { if (histInst.current) histInst.current.destroy(); };
  }, [boletim]);

  const mediaGeral = boletim.length > 0
    ? boletim.reduce((s, r) => s + Utils.calcMedia(r), 0) / boletim.length
    : 0;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:12, padding:28, width:'min(680px,95vw)', maxHeight:'82vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--blue-dark)' }}>{aluno}</h2>
            <p style={{ fontSize:'.82rem', color:'var(--gray-text)' }}>Histórico completo de registros acadêmicos</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'var(--gray-text)' }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:20, background:'var(--gray-bg)', borderRadius:8, padding:'12px 16px', marginBottom:18 }}>
          <div><div style={{ fontSize:'1.4rem', fontWeight:700, fontFamily:'Roboto Mono,monospace', color: Utils.notaColor(mediaGeral) }}>{mediaGeral.toFixed(1)}</div><div style={{ fontSize:'.72rem', color:'var(--gray-text)' }}>Média Geral</div></div>
          <div><div style={{ fontSize:'1.4rem', fontWeight:700, fontFamily:'Roboto Mono,monospace', color:'var(--blue-dark)' }}>{boletim.length}</div><div style={{ fontSize:'.72rem', color:'var(--gray-text)' }}>Disciplinas</div></div>
        </div>

        {boletim.length > 0 && (
          <div style={{ height:180, marginBottom:18 }}><canvas ref={histRef} id={`hist-modal-${aluno}`} /></div>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Disciplina</th><th>Turma</th><th>VA1</th><th>VA2</th><th>VA3</th><th>Média</th><th>Período</th><th>Situação</th></tr></thead>
            <tbody>
              {boletim.map((r, i) => {
                const m = Utils.calcMedia(r);
                const b = Utils.situacaoBadge(r.situacao);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{r.cod_disciplina}</td>
                    <td>{r.turma}</td>
                    <td className={Utils.notaClass(r.va1)}>{r.va1 != null ? r.va1.toFixed(1) : '—'}</td>
                    <td className={Utils.notaClass(r.va2)}>{r.va2 != null ? r.va2.toFixed(1) : '—'}</td>
                    <td className={Utils.notaClass(r.va3)}>{r.va3 != null ? r.va3.toFixed(1) : '—'}</td>
                    <td className={Utils.notaClass(m)} style={{ fontFamily:'Roboto Mono,monospace', fontWeight:700 }}>{m.toFixed(1)}</td>
                    <td style={{ fontSize:'.8rem', color:'var(--gray-text)' }}>{Utils.periodo(r.ano, r.semestre)}</td>
                    <td><span className={`badge ${b.cls}`}>{b.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Notas() {
  const [linhas,  setLinhas]  = useStateN([]);
  const [loading, setLoading] = useStateN(true);
  const [erro,    setErro]    = useStateN(false);
  const [busca,   setBusca]   = useStateN('');
  const [buscaDB, setBuscaDB] = useStateN('');
  const [filtSit, setFiltSit] = useStateN('todos');
  const [filtCurso, setFiltCurso] = useStateN('todos');
  const [pagina,  setPagina]  = useStateN(1);
  const [modal,   setModal]   = useStateN(null);
  const debRef = useRefN(null);
  const POR_PAGINA = 10;

  useEffectN(() => {
    // Carrega todos os boletins e alunos
    Promise.all([API.getAlunos(), API.getAllBoletins()]).then(([alunos, boletins]) => {
      if (!boletins || boletins.length === 0) { setErro(true); setLoading(false); return; }

      // Mapa aluno_id → curso
      const cursoMap = {};
      if (alunos) alunos.forEach(a => { cursoMap[String(a.ID_ALUNO)] = a.NOME_CURSO || '—'; });

      // Achata todos os registros em linhas individuais
      const todas = [];
      boletins.forEach(b => {
        b.boletim.forEach(reg => {
          todas.push({
            aluno_id: String(b.id_aluno),
            curso: cursoMap[String(b.id_aluno)] || '—',
            cod_disciplina: reg.cod_disciplina || '—',
            turma: reg.turma || '—',
            va1: reg.va1 ?? 0,
            va2: reg.va2 ?? 0,
            va3: reg.va3 ?? 0,
            media: Utils.calcMedia(reg),
            periodo: Utils.periodo(reg.ano, reg.semestre),
            situacao: reg.situacao || 'Cursando',
          });
        });
      });

      setLinhas(todas);
      setLoading(false);
    }).catch(() => { setErro(true); setLoading(false); });
  }, []);

  const handleBusca = v => {
    setBusca(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setBuscaDB(v); setPagina(1); }, 300);
  };

  const cursos = useMemoN(() => {
    return ['todos', ...new Set(linhas.map(l => l.curso))].filter(Boolean);
  }, [linhas]);

  const filtradas = useMemoN(() => {
    return linhas.filter(l => {
      const q = buscaDB.toLowerCase();
      const matchBusca = !q || l.aluno_id.includes(q) || l.cod_disciplina.toLowerCase().includes(q) || l.curso.toLowerCase().includes(q);
      const matchSit   = filtSit === 'todos' || l.situacao === filtSit;
      const matchCurso = filtCurso === 'todos' || l.curso === filtCurso;
      return matchBusca && matchSit && matchCurso;
    });
  }, [linhas, buscaDB, filtSit, filtCurso]);

  const totalPags = Math.ceil(filtradas.length / POR_PAGINA);
  const items = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const abrirModal = async (aluno_id) => {
    const b = await API.getBoletimAluno(aluno_id);
    if (b && b.boletim) setModal({ aluno: Utils.nomeAluno(aluno_id), boletim: b.boletim });
  };

  if (loading) return <LoadingState type="page" />;
  if (erro) return <EmptyState title="Erro ao carregar notas" desc="Verifique se o servidor está rodando." onRetry={() => location.reload()} />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notas</h1>
        <p className="page-subtitle">{linhas.length} registros reais do banco acadêmico. Clique em uma linha para ver o boletim completo.</p>
      </div>

      <div className="section-card">
        <div className="filters-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="notas-busca-input" type="text" placeholder="Buscar por ID, disciplina ou curso..." className="filter-input" value={busca} onChange={e => handleBusca(e.target.value)} />
          </div>
          <select id="notas-curso-select" className="filter-select" value={filtCurso} onChange={e => { setFiltCurso(e.target.value); setPagina(1); }}>
            {cursos.map(c => <option key={c} value={c}>{c === 'todos' ? 'Todos os cursos' : c}</option>)}
          </select>
          <select id="notas-situacao-select" className="filter-select" value={filtSit} onChange={e => { setFiltSit(e.target.value); setPagina(1); }}>
            <option value="todos">Todas as situações</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Reprovado">Reprovado</option>
            <option value="Reprovado por Falta">Rep. por Falta</option>
            <option value="Cursando">Cursando</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Aluno</th><th>Curso</th><th>Disciplina</th><th>Turma</th><th>VA1</th><th>VA2</th><th>VA3</th><th>Média</th><th>Período</th><th>Situação</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={10}><EmptyState title="Nenhum registro encontrado" desc="Tente ajustar os filtros." /></td></tr>}
              {items.map((l, i) => {
                const b = Utils.situacaoBadge(l.situacao);
                return (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => abrirModal(l.aluno_id)} title="Clique para ver boletim completo">
                    <td style={{ fontWeight:600, color:'var(--blue-dark)' }}>{Utils.nomeAluno(l.aluno_id)}</td>
                    <td style={{ fontSize:'.78rem', color:'var(--gray-text)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.curso}</td>
                    <td style={{ fontWeight:500 }}>{l.cod_disciplina}</td>
                    <td>{l.turma}</td>
                    <td className={Utils.notaClass(l.va1)}>{l.va1.toFixed(1)}</td>
                    <td className={Utils.notaClass(l.va2)}>{l.va2.toFixed(1)}</td>
                    <td className={Utils.notaClass(l.va3)}>{l.va3.toFixed(1)}</td>
                    <td className={Utils.notaClass(l.media)} style={{ fontFamily:'Roboto Mono,monospace', fontWeight:700 }}>{l.media.toFixed(1)}</td>
                    <td style={{ fontSize:'.78rem', color:'var(--gray-text)' }}>{l.periodo}</td>
                    <td><span className={`badge ${b.cls}`}>{b.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPags > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPagina(p => p-1)} disabled={pagina===1}>‹</button>
            {Array.from({ length: Math.min(totalPags, 7) }, (_, i) => {
              const p = i + 1;
              return <button key={p} className={`page-btn${pagina===p?' active':''}`} onClick={() => setPagina(p)}>{p}</button>;
            })}
            {totalPags > 7 && <span style={{ padding:'0 4px', lineHeight:'34px', color:'var(--gray-text)' }}>… {totalPags}</span>}
            <button className="page-btn" onClick={() => setPagina(p => p+1)} disabled={pagina===totalPags}>›</button>
          </div>
        )}

        <InsightCard text={`Exibindo ${items.length} de ${filtradas.length} registros filtrados (total: ${linhas.length}). Notas em vermelho < limiar · amarelo intermediário · verde ≥ aprovação. Clique em qualquer linha para abrir o boletim completo do aluno.`} />
      </div>

      {modal && <ModalBoletim aluno={modal.aluno} boletim={modal.boletim} onClose={() => setModal(null)} />}
    </div>
  );
}

window.Notas = Notas;
