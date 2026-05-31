/**
 * App.js — Predicta
 * Entry point principal (ES6 module).
 * Orquestra: splash, sidebar, floating actions, router, tema.
 */

import { state }             from './state.js';
import { Router }            from './router.js';
import { initSidebar }       from './components/Sidebar.js';
import { initFloatingActions } from './components/FloatingActions.js';

import { renderDashboard }   from './pages/Dashboard.js';
import { renderCursos }      from './pages/Cursos.js';
import { renderPredicao }    from './pages/Predicao.js';
import { renderNotas }       from './pages/Notas.js';
import { renderEstatisticas }from './pages/Estatisticas.js';

// ──────────────────────────────────────────────────────────────
//  Bootstrap
// ──────────────────────────────────────────────────────────────
(async function init() {

  // 1. Carrega tema salvo antes de qualquer render
  state.loadSavedTheme();

  // 2. Configura o router SPA (hash-based)
  const router = new Router({
    dashboard:    renderDashboard,
    cursos:       renderCursos,
    predicao:     renderPredicao,
    notas:        renderNotas,
    estatisticas: renderEstatisticas,
  });

  // 3. Inicia sidebar (passa router para navegação)
  initSidebar(router);

  // 4. Mostra shell + floating actions após splash
  const splash    = document.getElementById('splash');
  const appShell  = document.getElementById('app-shell');
  const floatActs = document.getElementById('floating-actions');

  // Aguarda splash de 1.8s (mesmo tempo da animação)
  setTimeout(() => {
    if (splash) {
      splash.classList.add('hidden');
      // Remove do DOM após transição
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }

    if (appShell)  appShell.style.display  = 'flex';
    if (floatActs) floatActs.style.display = 'flex';

    // 5. Inicia floating actions (notif, perfil, FAQ)
    initFloatingActions();

    // 6. Inicia router (resolve rota atual)
    router.init();

  }, 1800);

  // ─── Reage a mudança de role: re-renderiza página atual ────
  state.on('change', async e => {
    if (e.detail.key === 'currentRole') {
      const page = location.hash.replace('#', '') || 'dashboard';
      const container = document.getElementById('page-content');
      if (!container) return;

      // Re-renderiza a página atual com o novo perfil
      const routeMap = {
        dashboard:    renderDashboard,
        cursos:       renderCursos,
        predicao:     renderPredicao,
        notas:        renderNotas,
        estatisticas: renderEstatisticas,
      };
      const fn = routeMap[page];
      if (fn) {
        container.innerHTML = '';
        await fn(container);
      }
    }
  });

  // ─── Adiciona estilo spin para o botão Lyceum ──────────────
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

})();
