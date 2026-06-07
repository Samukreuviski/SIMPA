/**
 * FloatingActions.js — Predicta
 * Bolinhas flutuantes fixas no canto superior direito:
 * Notificações, Perfil/Config, FAQ.
 */

import { state }     from '../state.js';
import { MOCK_DATA } from '../mockData.js';
import { openProfileModal } from './ProfileSelector.js';
import { openFaqModal }     from './Modal.js';

export function initFloatingActions() {
  const btnNotif   = document.getElementById('btn-notif');
  const btnProfile = document.getElementById('btn-profile');
  const btnFaq     = document.getElementById('btn-faq');
  const dropdown   = document.getElementById('notif-dropdown');
  const badge      = document.getElementById('notif-badge');
  const avatarText = document.getElementById('float-avatar-text');

  // ─── Atualiza avatar ───────────────────────────────────────
  function updateAvatar() {
    const perfil = state.getPerfil();
    if (avatarText) avatarText.textContent = perfil.avatar;
  }
  updateAvatar();
  state.on('change', e => {
    if (e.detail.key === 'currentRole') updateAvatar();
  });

  // ─── Badge de notificações não lidas ───────────────────────
  const unread = MOCK_DATA.notificacoes.filter(n => !n.lida).length;
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }

  // ─── Dropdown de notificações ──────────────────────────────
  function renderDropdown() {
    dropdown.innerHTML = `
      <div class="notif-header">🔔 Notificações (${unread} novas)</div>
      ${MOCK_DATA.notificacoes.map(n => `
        <div class="notif-item ${n.lida ? '' : 'unread'}">
          <div class="notif-dot ${n.tipo}"></div>
          <div>
            <div class="notif-title">${n.titulo}</div>
            <div class="notif-desc">${n.descricao}</div>
            <div class="notif-time">${n.tempo}</div>
          </div>
        </div>
      `).join('')}
    `;
  }

  let dropdownOpen = false;
  btnNotif.addEventListener('click', e => {
    e.stopPropagation();
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen) {
      renderDropdown();
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', () => {
    if (dropdownOpen) {
      dropdown.style.display = 'none';
      dropdownOpen = false;
    }
  });

  // ─── Perfil / Configurações ────────────────────────────────
  btnProfile.addEventListener('click', () => openProfileModal());

  // ─── FAQ ──────────────────────────────────────────────────
  btnFaq.addEventListener('click', () => openFaqModal());
}

