/**
 * App.js v2 — Predicta
 * Entry point principal. Rotas atualizadas para estrutura correta do Figma.
 */

import { state }               from './state.js';
import { Router }              from './router.js';
import { initSidebar }         from './components/Sidebar.js';
import { initFloatingActions } from './components/FloatingActions.js';

import { renderDashboard }     from './pages/Dashboard.js';
import { renderCursos }        from './pages/Cursos.js';
import { renderEstatPredicao } from './pages/EstatPredicao.js';  /* ← combinado */
import { renderNotas }         from './pages/Notas.js';
import { renderNotificacoes }  from './pages/Notificacoes.js';   /* ← novo */

/* Páginas de compatibilidade: predição e estatísticas separadas redirecionam */
const redirectTo = (hash) => async (container) => {
  location.hash = hash;
};

// ──────────────────────────────────────────────────────────────
(async function init() {

  // 1. Carrega tema salvo
  state.loadSavedTheme();

  // 2. Router com mapeamento correto
  const router = new Router({
    dashboard:     renderDashboard,
    cursos:        renderCursos,
    estatpredicao: renderEstatPredicao,  /* aba combinada */
    notas:         renderNotas,
    notificacoes:  renderNotificacoes,
    /* aliases de compatibilidade */
    predicao:      renderEstatPredicao,
    estatisticas:  renderEstatPredicao,
  });

  // 3. Sidebar
  initSidebar(router);

  // 4. Exibe shell após splash (1.8s)
  const splash    = document.getElementById('splash');
  const appShell  = document.getElementById('app-shell');
  const floatActs = document.getElementById('floating-actions');

  setTimeout(() => {
    if (splash) {
      splash.classList.add('hidden');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }
    if (appShell)  appShell.style.display  = 'flex';
    if (floatActs) floatActs.style.display = 'flex';

    initFloatingActions();
    router.init();

  }, 1800);

  // 5. Reage a mudança de role → re-renderiza página atual
  state.on('change', async e => {
    if (e.detail.key === 'currentRole') {
      const page = location.hash.replace('#', '') || 'dashboard';
      const container = document.getElementById('page-content');
      if (!container) return;

      const routeMap = {
        dashboard:     renderDashboard,
        cursos:        renderCursos,
        estatpredicao: renderEstatPredicao,
        notas:         renderNotas,
        notificacoes:  renderNotificacoes,
        predicao:      renderEstatPredicao,
        estatisticas:  renderEstatPredicao,
      };
      const fn = routeMap[page];
      if (fn) { container.innerHTML = ''; await fn(container); }
    }
  });

  // 6. Inject @keyframes spin para botão Lyceum
  const style = document.createElement('style');
  style.textContent = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`;
  document.head.appendChild(style);

})();
