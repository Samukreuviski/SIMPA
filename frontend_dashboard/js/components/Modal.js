/**
 * Modal.js — Predicta
 * Modal genérico reutilizável + modais de FAQ e utilitários.
 */

import { MOCK_DATA } from '../mockData.js';

const root = () => document.getElementById('modal-root');

/** Cria e abre um modal genérico */
export function openModal({ title, body, footer = '', size = '' }) {
  const id = `modal-${Date.now()}`;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = id;
  backdrop.innerHTML = `
    <div class="modal-box ${size}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <div class="modal-header">
        <div class="modal-title" id="${id}-title">${title}</div>
        <button class="modal-close" aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  root().appendChild(backdrop);

  // Close handlers
  const close = () => {
    backdrop.style.opacity = '0';
    setTimeout(() => backdrop.remove(), 200);
  };

  backdrop.querySelector('.modal-close').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  return { close, el: backdrop };
}

/** Abre modal do FAQ */
export function openFaqModal() {
  const faqHtml = MOCK_DATA.faq.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
      <div class="faq-question" data-faq="${i}">
        <span>${item.pergunta}</span>
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">${item.resposta}</div></div>
    </div>
  `).join('');

  const { el } = openModal({
    title: '❓ Perguntas Frequentes — Predicta UniEVANGÉLICA',
    body: `
      <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:16px;">
        Tire suas dúvidas sobre o sistema de monitoramento acadêmico.
      </p>
      <div>${faqHtml}</div>
    `,
    size: 'modal-lg',
  });

  // Accordion
  el.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      el.querySelectorAll('.faq-item').forEach(fi => fi.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/** Abre modal de confirmação simples */
export function openConfirm({ title, message, onConfirm }) {
  const { close } = openModal({
    title,
    body: `<p style="color:var(--text-muted);font-size:.9rem;">${message}</p>`,
    footer: `
      <button class="btn btn-outline" id="confirm-cancel">Cancelar</button>
      <button class="btn btn-primary" id="confirm-ok">Confirmar</button>
    `,
  });

  setTimeout(() => {
    document.getElementById('confirm-cancel')?.addEventListener('click', close);
    document.getElementById('confirm-ok')?.addEventListener('click', () => { close(); onConfirm?.(); });
  }, 50);
}

/** Toast notification temporária */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#0B4F7C'};
    color:#fff;padding:12px 20px;border-radius:8px;
    font-size:.85rem;font-weight:600;z-index:9999;
    box-shadow:0 8px 24px rgba(0,0,0,.25);
    animation:fadeIn .25s ease;max-width:320px;line-height:1.4;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

