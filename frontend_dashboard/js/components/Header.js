/** Header.js — Cabeçalho com logo central e sino de notificação */
const { useState: useStateH } = React;

function Header() {
  const [bell, setBell] = useStateH(true);

  return (
    <header className="header">
      <div style={{ flex: 1 }}></div>
      <img
        src="/assets/Logo - (SEM FUNDO) (1).png"
        alt="Predicta"
        className="header-logo"
        onError={e => {
          e.target.style.display = 'none';
          const span = document.createElement('span');
          span.style.cssText = 'font-family:Montserrat,sans-serif;font-weight:800;font-size:1.4rem;color:#0B4F7C;letter-spacing:-.02em';
          span.textContent = 'Predicta';
          e.target.parentNode.appendChild(span);
        }}
      />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          id="header-bell-btn"
          className="header-bell"
          onClick={() => setBell(false)}
          title="Notificações"
          aria-label="Ver notificações"
          style={{ position: 'relative', right: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {bell && <span className="bell-dot" />}
        </button>
      </div>
    </header>
  );
}

window.Header = Header;
