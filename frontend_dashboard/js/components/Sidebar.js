/**
 * Sidebar.js v2 — Predicta
 * Sidebar revisada: estrutura correta (Figma), logo grande,
 * toggle no topo, config + perfil clicável na base.
 */

import { state }          from '../state.js';
import { getGreeting, getGreetingSub } from '../utils.js';
import { openProfileModal } from './ProfileSelector.js';

/* ── Itens de navegação — ordem correta do Figma ─────────────── */
const NAV_ITEMS = [
  {
    page: 'dashboard',
    label: 'Visão Geral',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,
  },
  {
    page: 'cursos',
    label: 'Cursos',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,
  },
  {
    /* Estatísticas e Predição juntos — uma única aba */
    page: 'estatpredicao',
    label: 'Estatísticas e Predição',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <polyline points="2 17 6 13 10 17 14 11 18 15 22 9"/>
    </svg>`,
  },
  {
    page: 'notas',
    label: 'Notas',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>`,
  },
  {
    page: 'notificacoes',
    label: 'Envio de Notificações',
    roles: ['admin', 'gestao', 'academico'],
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>`,
  },
];

export function initSidebar(router) {
  const sidebar       = document.getElementById('sidebar');
  const toggleBtn     = document.getElementById('sidebar-toggle');
  const navEl         = document.getElementById('sidebar-nav');
  const perfilEl      = document.getElementById('sidebar-perfil');
  const configBtn     = document.getElementById('sidebar-config-btn');

  /* ── Renderiza itens de nav ──────────────────────────── */
  function renderNav() {
    const role  = state.get('currentRole');
    const page  = location.hash.replace('#', '') || 'dashboard';
    const items = NAV_ITEMS.filter(n => n.roles.includes(role));

    navEl.innerHTML = items.map(item => `
      <button class="nav-item ${page === item.page ? 'active' : ''}"
              data-page="${item.page}"
              data-label="${item.label}"
              aria-label="${item.label}"
              title="${item.label}">
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

  /* ── Renderiza perfil ─────────────────────────────────── */
  function renderPerfil() {
    const perfil = state.getPerfil();
    perfilEl.innerHTML = `
      <div class="sidebar-avatar">${perfil.avatar}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${perfil.nome}</div>
        <div class="sidebar-user-role">${perfil.cargo}</div>
      </div>
    `;
  }

  /* ── Atualiza saudação ────────────────────────────────── */
  function updateGreeting() {
    const perfil    = state.getPerfil();
    const role      = state.get('currentRole');
    const firstName = perfil.nome.split(' ')[0];
    const titulo    = role === 'academico'
      ? (perfil.cargo.toLowerCase().includes('coord') ? `Coordenador ${firstName}` : `Prof. ${firstName}`)
      : firstName;

    const greetTitle = document.getElementById('greeting-title');
    const greetSub   = document.getElementById('greeting-sub');
    if (greetTitle) greetTitle.textContent = getGreeting(titulo);
    if (greetSub)   greetSub.textContent   = getGreetingSub(role);
  }

  /* ── Toggle ──────────────────────────────────────────── */
  function applyCollapsed(collapsed) {
    sidebar.classList.toggle('collapsed', collapsed);
    document.getElementById('main-content')?.classList.toggle('collapsed', collapsed);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 380);
  }

  toggleBtn.addEventListener('click', () => {
    const next = !state.get('sidebarCollapsed');
    state.set('sidebarCollapsed', next);
    applyCollapsed(next);
    localStorage.setItem('predicta-sidebar', next ? '1' : '0');
  });

  /* ── Config button → abre ProfileSelector ───────────── */
  configBtn?.addEventListener('click', () => openProfileModal());

  /* ── Perfil clicável → abre ProfileSelector ─────────── */
  perfilEl.addEventListener('click', () => openProfileModal());
  perfilEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') openProfileModal();
  });

  /* ── Reage a mudança de role ─────────────────────────── */
  state.on('change', e => {
    if (e.detail.key === 'currentRole') {
      renderNav();
      renderPerfil();
      updateGreeting();
    }
  });

  /* ── Inicialização ───────────────────────────────────── */
  const savedCollapsed = localStorage.getItem('predicta-sidebar') === '1';
  state.set('sidebarCollapsed', savedCollapsed);
  applyCollapsed(savedCollapsed);

  renderNav();
  renderPerfil();
  updateGreeting();

  // Atualiza saudação a cada minuto
  setInterval(updateGreeting, 60_000);
}
