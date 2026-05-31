/**
 * ProfileSelector.js — Predicta
 * Modal de perfil: role switcher, temas, info do usuário, logout.
 */

import { state }     from '../state.js';
import { openModal, showToast } from './Modal.js';

const ROLES = [
  {
    key: 'admin',
    label: 'Administrador',
    desc: 'Acesso total ao sistema',
    icon: '⚙️',
  },
  {
    key: 'gestao',
    label: 'Gestão Geral',
    desc: 'Reitor / Pró-Reitor / Secretaria',
    icon: '🏛️',
  },
  {
    key: 'academico',
    label: 'Corpo Acadêmico',
    desc: 'Professor / Coordenador',
    icon: '👨‍🏫',
  },
];

export function openProfileModal() {
  const perfil   = state.getPerfil();
  const curRole  = state.get('currentRole');
  const curTheme = state.get('currentTheme');

  const body = `
    <!-- Info do usuário -->
    <div style="display:flex;gap:14px;align-items:center;background:var(--blue-dark);border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;border:2px solid rgba(58,173,229,.6);">
        ${perfil.avatar}
      </div>
      <div>
        <div style="color:#fff;font-weight:700;font-size:.95rem;">${perfil.nome}</div>
        <div style="color:rgba(255,255,255,.6);font-size:.78rem;">${perfil.cargo}</div>
        <div style="color:rgba(255,255,255,.45);font-size:.72rem;margin-top:2px;">${perfil.email}</div>
      </div>
    </div>

    <!-- Seletor de perfil (role-based) -->
    <div style="margin-bottom:20px;">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:10px;">
        🔄 Alternar Perfil (Modo Apresentação)
      </div>
      <div class="role-selector" id="role-selector">
        ${ROLES.map(r => `
          <div class="role-card ${r.key === curRole ? 'active' : ''}"
               data-role="${r.key}" tabindex="0" role="button" aria-pressed="${r.key === curRole}">
            <div class="role-card-icon">${r.icon}</div>
            <div class="role-card-label">${r.label}</div>
            <div class="role-card-desc">${r.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Acessibilidade / Temas -->
    <div style="margin-bottom:20px;">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:10px;">
        🎨 Aparência e Acessibilidade
      </div>
      <div class="theme-toggles">
        <div class="theme-toggle-row">
          <div>
            <div class="theme-toggle-label">🌙 Modo Noturno</div>
            <div class="theme-toggle-desc">Fundo escuro para ambientes com pouca luz</div>
          </div>
          <button class="toggle-switch ${curTheme === 'dark' ? 'on' : ''}"
                  id="toggle-dark" aria-label="Modo noturno"></button>
        </div>
        <div class="theme-toggle-row">
          <div>
            <div class="theme-toggle-label">♿ Alto Contraste</div>
            <div class="theme-toggle-desc">Otimizado para daltonismo (protanopia/deuteranopia)</div>
          </div>
          <button class="toggle-switch ${curTheme === 'high-contrast' ? 'on' : ''}"
                  id="toggle-contrast" aria-label="Alto contraste"></button>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-danger" id="btn-logout" style="margin-right:auto;">
      🚪 Sair do Sistema
    </button>
    <button class="btn btn-outline" id="btn-close-profile">Fechar</button>
  `;

  const { close, el } = openModal({
    title: '👤 Perfil e Configurações',
    body,
    footer,
    size: 'modal-lg',
  });

  // ─── Role switcher ─────────────────────────────────────────
  el.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      const newRole = card.dataset.role;
      state.set('currentRole', newRole);
      el.querySelectorAll('.role-card').forEach(c => {
        c.classList.toggle('active', c.dataset.role === newRole);
        c.setAttribute('aria-pressed', c.dataset.role === newRole);
      });
      showToast(`✅ Perfil alterado: ${ROLES.find(r => r.key === newRole)?.label}`, 'success');
    });
  });

  // ─── Temas ────────────────────────────────────────────────
  el.querySelector('#toggle-dark')?.addEventListener('click', btn => {
    const curr = state.get('currentTheme');
    const next = curr === 'dark' ? 'light' : 'dark';
    state.setTheme(next);
    el.querySelector('#toggle-dark').classList.toggle('on', next === 'dark');
    el.querySelector('#toggle-contrast').classList.remove('on');
  });

  el.querySelector('#toggle-contrast')?.addEventListener('click', () => {
    const curr = state.get('currentTheme');
    const next = curr === 'high-contrast' ? 'light' : 'high-contrast';
    state.setTheme(next);
    el.querySelector('#toggle-contrast').classList.toggle('on', next === 'high-contrast');
    el.querySelector('#toggle-dark').classList.remove('on');
  });

  // ─── Logout fictício ──────────────────────────────────────
  el.querySelector('#btn-logout')?.addEventListener('click', () => {
    close();
    showToast('👋 Sessão encerrada. Até logo!', 'info', 2500);
    setTimeout(() => {
      state.setTheme('light');
      state.set('currentRole', 'admin');
    }, 1000);
  });

  el.querySelector('#btn-close-profile')?.addEventListener('click', close);
}
