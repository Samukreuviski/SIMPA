/**
 * router.js — Predicta
 * Hash-based SPA router. Renderiza páginas no #page-content
 * com transição de fade suave.
 */

export class Router {
  constructor(routes) {
    this._routes  = routes;  // { hash: renderFn }
    this._current = null;
    this._cleanup = null;    // função de cleanup da página atual

    window.addEventListener('hashchange', () => this._resolve());
  }

  /** Inicia o router e resolve a rota atual */
  init() {
    if (!location.hash) location.hash = '#dashboard';
    this._resolve();
  }

  /** Navega para um hash */
  navigate(hash) {
    location.hash = hash;
  }

  /** Resolve a rota atual e renderiza */
  async _resolve() {
    const hash = location.hash || '#dashboard';
    const key  = hash.replace('#', '');

    if (this._current === key) return;
    this._current = key;

    // Cleanup da página anterior
    if (typeof this._cleanup === 'function') {
      this._cleanup();
      this._cleanup = null;
    }

    const container = document.getElementById('page-content');
    if (!container) return;

    // Fade out
    container.style.opacity = '0';
    container.style.transform = 'translateY(6px)';
    container.style.transition = 'opacity .18s ease, transform .18s ease';

    await new Promise(r => setTimeout(r, 180));

    // Limpa container
    container.innerHTML = '';

    // Renderiza nova página
    const routeFn = this._routes[key] || this._routes['dashboard'];
    if (routeFn) {
      this._cleanup = await routeFn(container);
    }

    // Fade in
    container.style.opacity = '1';
    container.style.transform = 'none';

    // Atualiza nav ativo na sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === key);
    });

    // Scroll to top
    container.parentElement?.scrollTo(0, 0);
  }
}

