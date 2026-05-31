/**
 * Notificacoes.js — Predicta
 * Envio de notificações aos alunos via WhatsApp ou e-mail.
 * Selecione turma → filtre por risco → escolha template → dispare.
 */

import { state }                 from '../state.js';
import { MOCK_DATA }             from '../mockData.js';
import { getRiscoBadge, fmtNum } from '../utils.js';
import { showToast }             from '../components/Modal.js';

export async function renderNotificacoes(container) {
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) periodoEl.innerHTML = '';

  const turmas = state.getTurmas();
  const cursos = state.getCursos();

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Header -->
      <div class="section-header" style="margin-bottom:20px;">
        <div>
          <div class="section-title" style="font-size:1.05rem;">
            📢 Central de Notificações
          </div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;">
            Dispare mensagens para grupos de alunos em situação de risco via WhatsApp ou E-mail.
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:20px;">

        <!-- Coluna 1: Seleção de destinatários -->
        <div>
          <div class="section-card" style="margin-bottom:0;">
            <div class="section-title" style="margin-bottom:16px;">1. Selecione os Destinatários</div>

            <!-- Turma -->
            <div style="margin-bottom:14px;">
              <label class="filter-label" style="display:block;margin-bottom:5px;">Turma / Curso</label>
              <select class="filter-select" id="notif-turma" style="width:100%;">
                <option value="todos">Todas as turmas em risco</option>
                ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
              </select>
            </div>

            <!-- Filtro de risco -->
            <div style="margin-bottom:14px;">
              <label class="filter-label" style="display:block;margin-bottom:8px;">Nível de Risco</label>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${[
                  { val:'todos', label:'Todos em Risco',color:'var(--text)' },
                  { val:'alto',  label:'🔴 Apenas Risco Alto', color:'var(--red)' },
                  { val:'medio', label:'🟡 Apenas Risco Médio', color:'var(--yellow)' },
                ].map(r => `
                  <label style="display:flex;align-items:center;gap:8px;cursor:pointer;
                    padding:8px 12px;border-radius:8px;border:1.5px solid var(--border-color);
                    font-size:.84rem;font-weight:600;color:${r.color};
                    transition:border-color .2s;user-select:none;">
                    <input type="radio" name="notif-risco" value="${r.val}" ${r.val==='todos'?'checked':''} style="accent-color:var(--blue-primary);" />
                    ${r.label}
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Preview de destinatários -->
            <div style="background:var(--bg-page);border-radius:8px;padding:14px;border:1px solid var(--border-color);">
              <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);font-weight:700;margin-bottom:10px;">
                Destinatários Selecionados
              </div>
              <div id="notif-recipients"></div>
            </div>
          </div>
        </div>

        <!-- Coluna 2: Template + Disparo -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- Templates -->
          <div class="section-card" style="margin-bottom:0;">
            <div class="section-title" style="margin-bottom:14px;">2. Escolha o Template de Mensagem</div>

            <div id="notif-templates">
              ${[
                {
                  key:   'faltas',
                  emoji: '⚠️',
                  title: 'Excesso de Faltas',
                  desc:  'Alerta sobre a alta taxa de ausência e impacto na reprovação.',
                },
                {
                  key:   'notas',
                  emoji: '📊',
                  title: 'Baixo Desempenho nas Notas',
                  desc:  'Informa sobre notas abaixo da média e convida para recuperação.',
                },
                {
                  key:   'geral',
                  emoji: '🎯',
                  title: 'Risco Geral de Reprovação',
                  desc:  'Mensagem completa abordando todos os fatores de risco.',
                },
              ].map(t => `
                <div class="notif-template-card ${t.key==='geral'?'selected':''}" data-template="${t.key}"
                     style="margin-bottom:10px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="font-size:1.5rem;">${t.emoji}</div>
                    <div>
                      <div style="font-size:.88rem;font-weight:700;color:var(--text);">${t.title}</div>
                      <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px;">${t.desc}</div>
                    </div>
                    <div class="template-check" style="margin-left:auto;font-size:1rem;
                         color:var(--blue-primary);display:${t.key==='geral'?'block':'none'};">✅</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Mensagem editável -->
          <div class="section-card" style="margin-bottom:0;">
            <div class="section-title" style="margin-bottom:10px;">3. Revise e Envie</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px;">
              Personalize a mensagem antes de disparar para todos os destinatários:
            </div>
            <textarea class="msg-textarea" id="notif-msg" rows="10">Carregando...</textarea>
            <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
              <button class="btn btn-outline" id="btn-notif-copy" style="flex:1;">
                📋 Copiar Mensagem
              </button>
              <button class="btn" id="btn-notif-whatsapp"
                      style="flex:2;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-weight:700;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.523 5.854L.057 23.882a.5.5 0 0 0 .61.61l6.118-1.588C8.347 23.489 10.165 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.795 0-3.5-.483-4.998-1.384l-.358-.212-3.713.964.99-3.617-.232-.372C2.49 15.668 2 13.889 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Disparar via WhatsApp
              </button>
              <button class="btn btn-dark" id="btn-notif-email" style="flex:1.5;">
                ✉️ Notificar por E-mail
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Histórico de disparos -->
      <div class="section-card" style="margin-top:20px;">
        <div class="section-title" style="margin-bottom:14px;">📋 Histórico de Notificações Enviadas</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th><th>Tipo</th><th>Destinatários</th>
                <th>Template</th><th>Canal</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { data:'26/05/2026 09:14', tipo:'Risco Alto', dest:12, tpl:'Excesso de Faltas',       canal:'WhatsApp', status:'Enviado' },
                { data:'20/05/2026 14:30', tipo:'Risco Médio',dest:27, tpl:'Baixo Desempenho',        canal:'E-mail',   status:'Enviado' },
                { data:'12/05/2026 11:00', tipo:'Todos',      dest:45, tpl:'Risco Geral de Reprovação',canal:'WhatsApp', status:'Enviado' },
              ].map(h => `
                <tr>
                  <td style="font-size:.8rem;color:var(--text-muted);">${h.data}</td>
                  <td>${getRiscoBadge(h.tipo.toLowerCase().includes('alto')?'alto':h.tipo.toLowerCase().includes('médio')?'medio':'baixo')}</td>
                  <td><strong>${h.dest}</strong> alunos</td>
                  <td style="font-size:.82rem;">${h.tpl}</td>
                  <td><span class="badge badge-blue">${h.canal}</span></td>
                  <td><span class="badge badge-green">✅ ${h.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // ─── Estado local ─────────────────────────────────────────
  let selectedTemplate = 'geral';

  // ─── Atualiza destinatários e mensagem ───────────────────
  function updateRecipients() {
    const turmaId = container.querySelector('#notif-turma')?.value;
    const riscoVal= container.querySelector('input[name="notif-risco"]:checked')?.value;
    const allAlunos = state.getAlunos(turmaId === 'todos' ? null : turmaId)
                          .filter(a => riscoVal === 'todos' ? a.risco !== 'baixo' : a.risco === riscoVal);

    const recEl = container.querySelector('#notif-recipients');
    if (!allAlunos.length) {
      recEl.innerHTML = `<div style="color:var(--text-muted);font-size:.82rem;text-align:center;padding:10px;">Nenhum aluno encontrado com esse filtro.</div>`;
    } else {
      recEl.innerHTML = `
        <div style="font-size:1.2rem;font-weight:800;color:var(--blue-primary);text-align:center;margin-bottom:6px;">${allAlunos.length}</div>
        <div style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-bottom:10px;">alunos serão notificados</div>
        <div style="max-height:140px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;">
          ${allAlunos.slice(0,8).map(a => `
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:.75rem;">
              <span style="color:var(--text);">${a.nome.split(' ').slice(0,2).join(' ')}</span>
              ${getRiscoBadge(a.risco)}
            </div>
          `).join('')}
          ${allAlunos.length > 8 ? `<div style="font-size:.72rem;color:var(--text-muted);text-align:center;">e mais ${allAlunos.length - 8} alunos...</div>` : ''}
        </div>
      `;
    }

    // Atualiza mensagem (usando primeiro aluno como exemplo)
    if (allAlunos.length > 0) {
      updateMessage(allAlunos[0], selectedTemplate);
    }
  }

  function updateMessage(aluno, tplKey) {
    const turmaId = aluno?.turmaId;
    const turma   = state.getTurmas().find(t => t.id === turmaId);
    const curso   = state.getCursos().find(c => c.id === turma?.cursoId);
    const nome    = aluno?.nome || '[Nome do Aluno]';
    const nmCurso = curso?.nome || '[Curso]';
    const nmDisc  = turma?.nome || '[Disciplina]';

    const tmpl = MOCK_DATA.templates?.[tplKey];
    const msgEl = container.querySelector('#notif-msg');
    if (msgEl && tmpl) {
      msgEl.value = tmpl(nome, nmCurso, nmDisc);
    }
  }

  // ─── Seleção de template ─────────────────────────────────
  container.querySelectorAll('.notif-template-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedTemplate = card.dataset.template;
      container.querySelectorAll('.notif-template-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.template-check').style.display = 'none';
      });
      card.classList.add('selected');
      card.querySelector('.template-check').style.display = 'block';
      updateRecipients();
    });
  });

  // ─── Filtros ─────────────────────────────────────────────
  container.querySelector('#notif-turma')?.addEventListener('change', updateRecipients);
  container.querySelectorAll('input[name="notif-risco"]').forEach(r => {
    r.addEventListener('change', updateRecipients);
  });

  // ─── Copiar ──────────────────────────────────────────────
  container.querySelector('#btn-notif-copy')?.addEventListener('click', async () => {
    const text = container.querySelector('#notif-msg')?.value || '';
    try {
      await navigator.clipboard.writeText(text);
      showToast('Mensagem copiada!', 'success');
    } catch {
      showToast('Copie manualmente o texto da caixa.', 'error');
    }
  });

  // ─── WhatsApp ────────────────────────────────────────────
  container.querySelector('#btn-notif-whatsapp')?.addEventListener('click', () => {
    const text = encodeURIComponent(container.querySelector('#notif-msg')?.value || '');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  });

  // ─── E-mail (fictício) ────────────────────────────────────
  container.querySelector('#btn-notif-email')?.addEventListener('click', () => {
    showToast('Notificação por e-mail disparada! (simulação)', 'success', 3000);
  });

  // Inicializa
  updateRecipients();
}
