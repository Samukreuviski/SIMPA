/** App.js — Componente raiz: roteamento entre páginas e montagem do shell */
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [page, setPage] = useStateApp('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useStateApp(false);

  // Remove splash screen após o app montar
  useEffectApp(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      setTimeout(() => splash.classList.add('hidden'), 1800);
    }
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':   return <Dashboard />;
      case 'cursos':      return <Cursos />;
      case 'predicao':    return <Predicao />;
      case 'notas':       return <Notas />;
      case 'estatisticas':return <Estatisticas />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={setPage} collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <div className={`main-content${sidebarCollapsed ? ' collapsed' : ''}`}>
        <Header />
        <main className="page-content" id="main-page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// Monta o app no root
const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
