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
    <!-- Banner de Perfil -->
    <div style="background:#0B4F7C; border-radius:12px; padding:20px 24px; display:flex; align-items:center; gap:20px; margin-bottom:24px; position:relative;">
      <!-- Avatar -->
      <div style="position:relative; width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.6rem; font-weight:700;">
        <span id="banner-avatar">${perfil.avatar}</span>
        <button id="btn-change-photo" style="position:absolute; bottom:-4px; right:-4px; width:24px; height:24px; border-radius:50%; background:#3FA9F5; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff;" title="Alterar foto">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        </button>
      </div>
      <!-- Info banner -->
      <div style="color:#fff; flex:1;">
        <div style="font-size:1.1rem; font-weight:700; margin-bottom:2px;" id="banner-nome">${perfil.nome}</div>
        <div style="font-size:0.85rem; color:rgba(255,255,255,0.7);" id="banner-email">${perfil.email}</div>
      </div>
    </div>

    <!-- Informações Pessoais -->
    <div style="margin-bottom:24px;">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:12px;">
        📋 Informações Pessoais
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
        <div class="filter-group" style="margin-bottom:0;">
          <label class="filter-label">Nome completo</label>
          <input type="text" class="filter-select" id="edit-nome" value="${perfil.nome}">
        </div>
        <div class="filter-group" style="margin-bottom:0;">
          <label class="filter-label">E-mail institucional</label>
          <input type="email" class="filter-select" id="edit-email" value="${perfil.email}">
        </div>
        <div class="filter-group" style="margin-bottom:0;">
          <label class="filter-label">Cargo / Função</label>
          <input type="text" class="filter-select" id="edit-cargo" value="${perfil.cargo}">
        </div>
        <div class="filter-group" style="margin-bottom:0;">
          <label class="filter-label">Departamento</label>
          <input type="text" class="filter-select" id="edit-dep" value="${perfil.departamento || 'Acesso Institucional'}" placeholder="Ex: Engenharia de Software">
        </div>
        <div class="filter-group" style="margin-bottom:0;">
          <label class="filter-label">Telefone</label>
          <input type="text" class="filter-select" id="edit-tel" value="${perfil.telefone || '(62) 99999-9999'}" placeholder="(62) 99999-9999">
        </div>
      </div>
      <button class="btn btn-primary" id="btn-save-edit" style="font-size:0.85rem; padding:8px 16px;">
        💾 Salvar alterações
      </button>
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
    localStorage.removeItem('predicta_logged_in');
    showToast('👋 Sessão encerrada. Até logo!', 'info', 2500);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  el.querySelector('#btn-close-profile')?.addEventListener('click', close);

  // ─── Foto fictícia ────────────────────────────────────────
  el.querySelector('#btn-change-photo')?.addEventListener('click', () => {
    showToast('📸 O upload de fotos estará habilitado assim que conectarmos ao Banco de Dados!', 'info', 3000);
  });

  // ─── Lógica de Edição de Perfil ───────────────────────────
  const btnSave = el.querySelector('#btn-save-edit');

  btnSave?.addEventListener('click', () => {
    const newNome = el.querySelector('#edit-nome').value.trim();
    const newCargo = el.querySelector('#edit-cargo').value.trim();
    const newEmail = el.querySelector('#edit-email').value.trim();
    const newDep = el.querySelector('#edit-dep').value.trim();
    const newTel = el.querySelector('#edit-tel').value.trim();

    if (!newNome) return showToast('O nome não pode ficar vazio!', 'error');

    // Update global object
    perfil.nome = newNome;
    perfil.cargo = newCargo;
    perfil.email = newEmail;
    perfil.departamento = newDep;
    perfil.telefone = newTel;
    
    // update avatar logic (first letter of first and second name)
    const parts = newNome.split(' ').filter(p => p.length > 0);
    perfil.avatar = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();

    // Re-render UI in modal banner
    el.querySelector('#banner-nome').textContent = perfil.nome;
    el.querySelector('#banner-email').textContent = perfil.email;
    el.querySelector('#banner-avatar').textContent = perfil.avatar;

    showToast('💾 Informações atualizadas com sucesso!', 'success');

    // Trigger global re-render to update Sidebar and Greeting
    state.set('currentRole', state.get('currentRole'));
  });
}

