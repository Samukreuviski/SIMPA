/**
 * Sidebar.js — Predicta
 * Sidebar retrátil com logo dinâmica e navegação role-based.
 */

import { state }       from '../state.js';
import { getGreeting, getGreetingSub } from '../utils.js';

const NAV_ITEMS = [
  {
    page: 'dashboard',
    label: 'Visão Geral',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>`,
  },
  {
    page: 'cursos',
    label: 'Cursos',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,
  },
  {
    page: 'predicao',
    label: 'Predição',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
  },
  {
    page: 'estatisticas',
    label: 'Estatísticas',
    roles: ['admin', 'gestao'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`,
  },
  {
    page: 'notas',
    label: 'Notas',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`,
  },
];

export function initSidebar(router) {
  const sidebar    = document.getElementById('sidebar');
  const toggleBtn  = document.getElementById('sidebar-toggle');
  const navEl      = document.getElementById('sidebar-nav');
  const perfilEl   = document.getElementById('sidebar-perfil');

  // ─── Render nav items ──────────────────────────────────────
  function renderNav() {
    const role  = state.get('currentRole');
    const page  = location.hash.replace('#', '') || 'dashboard';
    const items = NAV_ITEMS.filter(n => n.roles.includes(role));

    navEl.innerHTML = items.map(item => `
      <button class="nav-item ${page === item.page ? 'active' : ''}"
              data-page="${item.page}"
              data-label="${item.label}"
              aria-label="${item.label}">
        <span class="nav-item-icon">${item.icon}</span>
        <span class="nav-item-label">${item.label}</span>
      </button>
    `).join('');

    navEl.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigate(`#${btn.dataset.page}`);
        navEl.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // ─── Render perfil ─────────────────────────────────────────
  function renderPerfil() {
    const perfil = state.getPerfil();
    perfilEl.innerHTML = `
      <div class="sidebar-avatar">${perfil.avatar}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${perfil.nome.split(' ')[0]} ${perfil.nome.split(' ')[1] || ''}</div>
        <div class="sidebar-user-role">${perfil.cargo}</div>
      </div>
    `;
  }

  // ─── Greeting ─────────────────────────────────────────────
  function updateGreeting() {
    const perfil = state.getPerfil();
    const role   = state.get('currentRole');
    const firstName = perfil.nome.split(' ')[0];
    const titulo    = role === 'academico'
      ? (perfil.cargo.includes('Coord') ? `Coordenador ${firstName}` : `Prof. ${firstName}`)
      : firstName;

    const greetTitle = document.getElementById('greeting-title');
    const greetSub   = document.getElementById('greeting-sub');
    if (greetTitle) greetTitle.textContent = getGreeting(titulo);
    if (greetSub)   greetSub.textContent   = getGreetingSub(role);
  }

  // ─── Toggle ────────────────────────────────────────────────
  function applyCollapsed(collapsed) {
    sidebar.classList.toggle('collapsed', collapsed);
    document.getElementById('main-content')?.classList.toggle('collapsed', collapsed);
    // Notifica gráficos Chart.js para redimensionar
    setTimeout(() => window.dispatchEvent(new Event('resize')), 350);
  }

  toggleBtn.addEventListener('click', () => {
    const next = !state.get('sidebarCollapsed');
    state.set('sidebarCollapsed', next);
    applyCollapsed(next);
    localStorage.setItem('predicta-sidebar', next ? '1' : '0');
  });

  // ─── Reage a mudança de role ───────────────────────────────
  state.on('change', e => {
    if (e.detail.key === 'currentRole') {
      renderNav();
      renderPerfil();
      updateGreeting();
    }
  });

  // ─── Init ──────────────────────────────────────────────────
  const savedCollapsed = localStorage.getItem('predicta-sidebar') === '1';
  state.set('sidebarCollapsed', savedCollapsed);
  applyCollapsed(savedCollapsed);

  renderNav();
  renderPerfil();
  updateGreeting();

  // Atualiza saudação a cada minuto
  setInterval(updateGreeting, 60_000);
}
