/**
 * InterventionModal.js — Predicta
 * Modal de intervenção WhatsApp com 3 templates dinâmicos.
 */

import { MOCK_DATA } from '../mockData.js';
import { openModal, showToast } from './Modal.js';

/**
 * Abre o modal de intervenção para um aluno.
 * @param {Object} aluno — objeto do aluno
 * @param {string} turmaId — id da turma do aluno
 */
export function openInterventionModal(aluno, turmaId = null) {
  const turma  = MOCK_DATA.turmas.find(t => t.id === (turmaId || aluno.turmaId));
  const curso  = MOCK_DATA.cursos.find(c => c.id === turma?.cursoId);
  const discs  = MOCK_DATA.disciplinas.filter(d => d.turmaId === aluno.turmaId);
  const disciplina = discs[0]?.nome || turma?.nome || 'Componente Curricular';

  const nomeAluno   = aluno.nome;
  const nomeCurso   = curso?.nome  || 'Curso';
  const nomeDisc    = disciplina;

  const templates = {
    faltas: MOCK_DATA.templates.faltas(nomeAluno, nomeCurso, nomeDisc),
    notas:  MOCK_DATA.templates.notas(nomeAluno, nomeCurso, nomeDisc),
    geral:  MOCK_DATA.templates.geral(nomeAluno, nomeCurso, nomeDisc),
  };

  // Detecta o motivo principal para pré-selecionar a aba
  const motivoInicial = aluno.motivoRisco || 'geral';

  const tabsConfig = [
    { key: 'faltas', label: 'Excesso de Faltas' },
    { key: 'notas',  label: 'Notas Baixas' },
    { key: 'geral',  label: 'Risco Geral' },
  ];

  const bodyHtml = `
    <div style="margin-bottom:12px;">
      <div style="display:flex;gap:10px;align-items:center;background:var(--bg-page);padding:12px;border-radius:8px;margin-bottom:16px;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--blue-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.8rem;flex-shrink:0;">
          ${aluno.nome.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div>
          <div style="font-weight:700;font-size:.9rem;color:var(--text);">${aluno.nome}</div>
          <div style="font-size:.75rem;color:var(--text-muted);">${turma?.nome || '–'} · ${nomeCurso}</div>
        </div>
        <div style="margin-left:auto;">${getRiscoBadgeInline(aluno.risco)}</div>
      </div>

      <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:12px;">
        Selecione o template de mensagem mais adequado à situação do aluno:
      </p>

      <div class="msg-tabs" id="msg-tabs">
        ${tabsConfig.map(t => `
          <button class="msg-tab ${t.key === motivoInicial ? 'active' : ''}"
                  data-tab="${t.key}">${t.label}</button>
        `).join('')}
      </div>

      <textarea class="msg-textarea" id="msg-content" rows="10">${templates[motivoInicial]}</textarea>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:.75rem;color:var(--text-muted);">
          Edite a mensagem antes de enviar se necessário
        </span>
        <span id="char-count" style="font-size:.72rem;color:var(--text-muted);">
          ${templates[motivoInicial].length} caracteres
        </span>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" id="btn-copy-msg" style="flex:1;">
      Copiar Mensagem
    </button>
    <button class="whatsapp-btn" id="btn-whatsapp" style="flex:1;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.523 5.854L.057 23.882a.5.5 0 0 0 .61.61l6.118-1.588C8.347 23.489 10.165 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.795 0-3.5-.483-4.998-1.384l-.358-.212-3.713.964.99-3.617-.232-.372C2.49 15.668 2 13.889 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Enviar via WhatsApp
    </button>
  `;

  const { el } = openModal({
    title: `Gerar Intervenção — ${aluno.nome.split(' ')[0]}`,
    body: bodyHtml,
    footer: footerHtml,
    size: 'modal-lg',
  });

  let currentTab = motivoInicial;

  // ─── Tabs ──────────────────────────────────────────────────
  el.querySelectorAll('.msg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      el.querySelectorAll('.msg-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const textarea = el.querySelector('#msg-content');
      textarea.value = templates[currentTab];
      el.querySelector('#char-count').textContent = `${templates[currentTab].length} caracteres`;
    });
  });

  // ─── Contador de caracteres ────────────────────────────────
  const textarea = el.querySelector('#msg-content');
  textarea?.addEventListener('input', () => {
    el.querySelector('#char-count').textContent = `${textarea.value.length} caracteres`;
  });

  // ─── Copiar ────────────────────────────────────────────────
  setTimeout(() => {
    el.querySelector('#btn-copy-msg')?.addEventListener('click', async () => {
      const text = el.querySelector('#msg-content')?.value || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('Mensagem copiada para a área de transferência!', 'success');
      } catch {
        showToast('Não foi possível copiar — selecione e copie manualmente.', 'error');
      }
    });

    // ─── WhatsApp ─────────────────────────────────────────────
    el.querySelector('#btn-whatsapp')?.addEventListener('click', () => {
      const text = encodeURIComponent(el.querySelector('#msg-content')?.value || '');
      window.open(`https://wa.me/?text=${text}`, '_blank');
    });
  }, 100);
}

function getRiscoBadgeInline(risco) {
  const map = {
    alto:  ['badge-red',    '&bull; Alto'],
    medio: ['badge-yellow', '&bull; Médio'],
    baixo: ['badge-green',  '&bull; Baixo'],
  };
  const [cls, label] = map[risco] || ['badge-gray', '–'];
  return `<span class="badge ${cls}">${label}</span>`;
}

