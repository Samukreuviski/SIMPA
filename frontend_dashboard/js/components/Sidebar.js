/** Sidebar.js — Estado de collapse gerenciado pelo componente pai (App) */

function Sidebar({ activePage, onNavigate, collapsed, onCollapse }) {
  const navItems = [
    { id: 'dashboard',    label: 'Visão Geral',  icon: '/assets/Visão Geral.png'  },
    { id: 'cursos',       label: 'Cursos',        icon: '/assets/Cursos.png'        },
    { id: 'predicao',     label: 'Predição',      icon: '/assets/Predição.png'      },
    { id: 'notas',        label: 'Notas',         icon: '/assets/Notas.png'         },
    { id: 'estatisticas', label: 'Estatísticas',  icon: '/assets/Visão Geral.png'  },
  ];

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Perfil */}
      <div className="sidebar-top">
        <div className="sidebar-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <span className="sidebar-username">Predicta</span>
        <span className="sidebar-label">Sistema Acadêmico</span>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            <span className="nav-item-icon">
              <img src={item.icon} alt={item.label} onError={e => { e.target.style.display='none'; }} />
            </span>
            <span className="nav-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="sidebar-footer">
        {!collapsed && (
          <img
            src="/assets/Simbolo Branco - (SEM FUNDO).png"
            alt="Predicta Symbol"
            className="sidebar-symbol"
            onError={e => { e.target.style.display='none'; }}
          />
        )}
      </div>
      <button
        id="sidebar-toggle-btn"
        className="sidebar-toggle"
        onClick={() => onCollapse(!collapsed)}
        title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {collapsed
            ? <polyline points="9 18 15 12 9 6"/>
            : <polyline points="15 18 9 12 15 6"/>
          }
        </svg>
      </button>
    </aside>
  );
}

window.Sidebar = Sidebar;
