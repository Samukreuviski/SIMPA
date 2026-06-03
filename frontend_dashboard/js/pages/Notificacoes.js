/**
 * Notificacoes.js — Predicta
 * Central de Notificações: tabela de alunos em risco selecionáveis,
 * templates de mensagem, disparo via WhatsApp/E-mail e histórico clicável.
 *
 * TODO API (futuro banco de dados):
 *   GET  /alunos/em-risco            → lista de alunos (Parte 1)
 *   GET  /notificacoes/historico     → lista de envios (Parte 4)
 *   GET  /notificacoes/historico/:id → destinatários de um envio (Parte 4 detalhe)
 *   POST /notificacoes/enviar        → registrar disparo
 */

import { state }      from '../state.js';
import { MOCK_DATA }  from '../mockData.js';
import { getRiscoBadge } from '../utils.js';
import { showToast }  from '../components/Modal.js';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const riscoColor = { alto: 'var(--red)', medio: 'var(--yellow)', baixo: 'var(--green)', todos: 'var(--green)' };
const canalIcon  = { WhatsApp: '💬', 'E-mail': '✉️' };

function riscoChip(risco) {
  const dotColors = { alto: 'var(--red)', medio: 'var(--yellow)', baixo: 'var(--green)' };
  const color = dotColors[risco] || 'var(--text-muted)';
  const label = { alto: 'Risco Alto', medio: 'Risco Médio', baixo: 'Baixo' }[risco] || risco;
  return `<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:'Poppins', sans-serif;"><span style="color:${color}; font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>${label}</span>`;
}

function entregaChip(status) {
  return `<span style="color:var(--text-strong); font-weight:700; font-size:.85rem; font-family:'Poppins', sans-serif;"><span style="color:var(--green); font-size:1.2rem; vertical-align:middle; line-height:0; margin-right:4px;">●</span>${status}</span>`;
}

/* ─── render principal ────────────────────────────────────────────────────── */
export async function renderNotificacoes(container) {
  const periodoEl = document.getElementById('greeting-period');
  if (periodoEl) periodoEl.innerHTML = '';

  const turmas = state.getTurmas();
  const cursos = state.getCursos();

  // TODO API: GET /alunos/em-risco → substituir MOCK_DATA.alunos
  const todosAlunos = (MOCK_DATA.alunos || []).map(a => {
    const turma = turmas.find(t => t.id === a.turmaId) || {};
    const curso = cursos.find(c => c.id === turma.cursoId) || {};
    return { ...a, turmaNome: turma.nome || '—', turmaSerieLabel: turma.serie || '—', cursoNome: curso.nome || '—' };
  });

  // TODO API: GET /notificacoes/historico → substituir MOCK_DATA.historicoEnvios
  const historico = MOCK_DATA.historicoEnvios || [];

  container.innerHTML = `
    <div class="page-fade-in">

      <!-- Header -->
      <div class="section-header" style="margin-bottom:20px;">
        <div>
          <div class="section-title" style="font-size:1.05rem;">Central de Notificações</div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;">
            Dispare mensagens para grupos de alunos em situação de risco via WhatsApp ou E-mail.
          </div>
        </div>
      </div>

      <!-- ══════════════ PARTE 1: Seleção de Destinatários ══════════════ -->
      <div class="section-card" style="margin-bottom:20px;">
        <div class="section-title" style="margin-bottom:16px;">1. Selecione os Destinatários</div>

        <!-- Filtros superiores -->
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:flex-end;margin-bottom:14px;">

          <!-- Busca por nome -->
          <div>
            <label class="filter-label" for="notif-search">Buscar por nome</label>
            <div style="position:relative;">
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="filter-input" id="notif-search"
                     placeholder="Ex: Ana Beatriz..."
                     style="padding-left:34px;width:100%;" />
            </div>
          </div>

          <!-- Turma / Curso -->
          <div>
            <label class="filter-label" for="notif-turma">Turma / Curso</label>
            <select class="filter-select notif-control" id="notif-turma" style="width:100%;">
              <option value="todos">Todas as turmas em risco</option>
              ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
            </select>
          </div>

          <!-- Nível de Risco (compacto) -->
          <div>
            <label class="filter-label">Nível de Risco</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${[
                { val: 'todos', label: 'Todos', color: 'var(--blue-primary)' },
                { val: 'alto',  label: '🔴 Alto',  color: 'var(--red)' },
                { val: 'medio', label: '🟡 Médio', color: 'var(--yellow)' },
              ].map(r => `
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;
                              font-size:.8rem;font-weight:600;padding:6px 12px;border-radius:99px;
                              border:1.5px solid var(--border-color);background:var(--bg-page);
                              color:var(--text);transition:all .2s;user-select:none;"
                       class="risco-pill-label" data-risco="${r.val}">
                  <input type="radio" name="notif-risco" value="${r.val}" ${r.val === 'todos' ? 'checked' : ''}
                         style="display:none;" />
                  ${r.label}
                </label>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Contagem -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:.82rem;color:var(--text-muted);" id="notif-count-label">
            Carregando alunos...
          </div>
        </div>

        <!-- Tabela de alunos -->
        <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:14px;">
          <div class="table-wrap" id="notif-table-wrap">
            <table style="width:100%;border-collapse:collapse;min-width:720px;font-family:'Poppins', sans-serif;">
              <thead>
                <tr>
                  <th style="width:36px;padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">
                    <!-- Radio não tem select all -->
                  </th>
                  <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Nome</th>
                  <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Curso</th>
                  <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Turma / Período</th>
                  <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Problema Identificado</th>
                  <th style="padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">Risco</th>
                </tr>
              </thead>
              <tbody id="notif-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Resumo de selecionados -->
        <div id="notif-sel-bar" style="display:none;margin-top:12px;padding:10px 16px;
             background:var(--blue-light-bg);border:1.5px solid var(--blue-primary);
             border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:.85rem;font-weight:600;color:var(--blue-primary);" id="notif-sel-label">
            1 aluno selecionado
          </span>
          <button class="btn btn-xs btn-outline" id="btn-notif-deselect">Limpar seleção</button>
        </div>

      </div>

      <!-- ══════════════ PARTES 2 e 3: Template + Envio ══════════════ -->
      <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:20px;margin-bottom:20px;">

        <!-- 2. Templates -->
        <div class="section-card" style="margin-bottom:0;">
          <div class="section-title" style="margin-bottom:14px;">2. Escolha o Template de Mensagem</div>
          <div id="notif-templates">
            ${[
              { key: 'faltas', emoji: '⚠️', title: 'Excesso de Faltas',          desc: 'Alerta sobre a alta taxa de ausência e impacto na reprovação.' },
              { key: 'notas',  emoji: '📊', title: 'Baixo Desempenho nas Notas', desc: 'Informa sobre notas abaixo da média e convida para recuperação.' },
              { key: 'geral',  emoji: '🎯', title: 'Risco Geral de Reprovação',   desc: 'Mensagem completa abordando todos os fatores de risco.' },
            ].map(t => `
              <div class="notif-template-card ${t.key === 'geral' ? 'selected' : ''}" data-template="${t.key}"
                   style="margin-bottom:10px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="font-size:1.5rem;">${t.emoji}</div>
                  <div style="flex:1;">
                    <div style="font-size:.88rem;font-weight:700;color:var(--text);">${t.title}</div>
                    <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px;">${t.desc}</div>
                  </div>
                  <div class="template-check" style="font-size:1rem;color:var(--blue-primary);display:${t.key === 'geral' ? 'block' : 'none'};">✅</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Revisar e Enviar -->
        <div class="section-card" style="margin-bottom:0;">
          <div class="section-title" style="margin-bottom:10px;">3. Revise e Envie</div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px;">
            Personalize a mensagem antes de disparar para todos os destinatários selecionados:
          </div>
          <textarea class="msg-textarea" id="notif-msg" rows="10">Carregando...</textarea>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
            <button class="btn btn-outline" id="btn-notif-copy" style="flex:1;">Copiar Mensagem</button>
            <button class="btn" id="btn-notif-whatsapp"
                    style="flex:2;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-weight:700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.523 5.854L.057 23.882a.5.5 0 0 0 .61.61l6.118-1.588C8.347 23.489 10.165 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.795 0-3.5-.483-4.998-1.384l-.358-.212-3.713.964.99-3.617-.232-.372C2.49 15.668 2 13.889 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Disparar via WhatsApp
            </button>
            <button class="btn btn-dark" id="btn-notif-email" style="flex:1;">✉️ Notificar por E-mail</button>
          </div>
        </div>

      </div>

      <!-- ══════════════ PARTE 4: Histórico ══════════════ -->
      <div id="notif-historico-wrap">
        ${renderHistoricoTable(historico)}
      </div>

    </div>
  `;

  // ─── Estado local ─────────────────────────────────────────────────────────
  let selectedTemplate  = 'geral';
  let selectedId        = null;
  let filteredAlunos    = [];

  // Helper para formatar o motivo
  const formatMotivo = (motivo) => {
    if (motivo === 'faltas') return 'Excesso de Faltas';
    if (motivo === 'notas') return 'Notas Baixas';
    if (motivo === 'geral') return 'Múltiplos Fatores';
    return 'Sem problemas detectados';
  };

  // ─── Estilo das pills de risco ────────────────────────────────────────────
  function updateRiscoPills() {
    const checked = container.querySelector('input[name="notif-risco"]:checked')?.value;
    container.querySelectorAll('.risco-pill-label').forEach(lbl => {
      const active = lbl.dataset.risco === checked;
      lbl.style.background     = active ? 'var(--blue-primary)' : 'var(--bg-page)';
      lbl.style.color          = active ? '#fff' : 'var(--text)';
      lbl.style.borderColor    = active ? 'var(--blue-primary)' : 'var(--border-color)';
    });
  }
  container.querySelectorAll('.risco-pill-label').forEach(lbl => {
    lbl.addEventListener('click', () => {
      const radio = lbl.querySelector('input[type="radio"]');
      if (radio) { radio.checked = true; updateRiscoPills(); renderTable(); }
    });
  });
  updateRiscoPills();

  // ─── Renderiza a tabela de alunos ─────────────────────────────────────────
  function renderTable() {
    const turmaId  = container.querySelector('#notif-turma')?.value;
    const riscoVal = container.querySelector('input[name="notif-risco"]:checked')?.value;
    const search   = (container.querySelector('#notif-search')?.value || '').toLowerCase().trim();

    // TODO API: GET /alunos/em-risco?turma=X&risco=Y&search=Z
    filteredAlunos = todosAlunos.filter(a => {
      const matchTurma  = turmaId === 'todos' || a.turmaId === turmaId;
      const matchRisco  = riscoVal === 'todos' ? a.risco !== 'baixo' : a.risco === riscoVal;
      const matchSearch = !search || a.nome.toLowerCase().includes(search);
      return matchTurma && matchRisco && matchSearch;
    });

    const tbody = container.querySelector('#notif-tbody');
    const label = container.querySelector('#notif-count-label');
    if (!tbody) return;

    label.textContent = `${filteredAlunos.length} aluno${filteredAlunos.length !== 1 ? 's' : ''} encontrado${filteredAlunos.length !== 1 ? 's' : ''} em risco`;

    if (!filteredAlunos.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);font-size:.85rem;">
        Nenhum aluno encontrado com esses filtros.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredAlunos.map((a, i) => {
      const isSelected = selectedId === a.id;
      const bg = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)';
      return `
        <tr class="notif-aluno-row${isSelected ? ' selected-row' : ''}"
            data-id="${a.id}"
            style="background:${isSelected ? 'rgba(63,169,245,.08)' : bg};cursor:pointer;transition:background .15s;">
          <td style="padding:12px 10px;text-align:center;">
            <input type="radio" name="notif-aluno-radio" class="notif-aluno-radio" data-id="${a.id}"
                   style="accent-color:var(--blue-primary);width:15px;height:15px;"
                   ${isSelected ? 'checked' : ''} />
          </td>
          <td style="padding:12px 14px;font-size:.85rem;font-weight:600;color:var(--text);">${a.nome}</td>
          <td style="padding:12px 14px;font-size:.82rem;color:var(--text-muted);">${a.cursoNome}</td>
          <td style="padding:12px 14px;font-size:.82rem;color:var(--text-muted);">${a.turmaSerieLabel}</td>
          <td style="padding:12px 14px;font-size:.85rem;font-weight:600;color:var(--text);">${formatMotivo(a.motivoRisco)}</td>
          <td style="padding:12px 14px;text-align:center;">${riscoChip(a.risco)}</td>
        </tr>
      `;
    }).join('');

    updateSelBar();
    bindRowRadios();
  }

  function bindRowRadios() {
    container.querySelectorAll('.notif-aluno-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.dataset.id;
        selectId(id);
      });
      const radio = row.querySelector('.notif-aluno-radio');
      radio?.addEventListener('change', () => selectId(radio.dataset.id));
    });
  }

  function selectId(id) {
    selectedId = id;
    renderTable();
    updateMessage();
  }

  function updateSelBar() {
    const bar   = container.querySelector('#notif-sel-bar');
    const label = container.querySelector('#notif-sel-label');
    if (!bar) return;
    if (selectedId) {
      bar.style.display = 'flex';
      label.textContent = `1 aluno selecionado`;
    } else {
      bar.style.display = 'none';
    }
  }

  container.querySelector('#btn-notif-deselect')?.addEventListener('click', () => {
    selectedId = null;
    renderTable();
    updateMessage();
  });

  // ─── Mensagem ─────────────────────────────────────────────────────────────
  function updateMessage() {
    const exemplar = filteredAlunos.find(a => a.id === selectedId) || filteredAlunos[0];
    if (!exemplar) return;
    const turma  = turmas.find(t => t.id === exemplar.turmaId) || {};
    const curso  = state.getCursos().find(c => c.id === turma.cursoId) || {};
    const tmpl   = MOCK_DATA.templates?.[selectedTemplate];
    const msgEl  = container.querySelector('#notif-msg');
    if (msgEl && tmpl) msgEl.value = tmpl(exemplar.nome, curso.nome || '[Curso]', turma.nome || '[Turma]');
  }

  // ─── Seleção de template ──────────────────────────────────────────────────
  container.querySelectorAll('.notif-template-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedTemplate = card.dataset.template;
      container.querySelectorAll('.notif-template-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.template-check').style.display = 'none';
      });
      card.classList.add('selected');
      card.querySelector('.template-check').style.display = 'block';
      updateMessage();
    });
  });

  // ─── Filtros ──────────────────────────────────────────────────────────────
  container.querySelector('#notif-turma')?.addEventListener('change', () => { renderTable(); updateMessage(); });
  container.querySelector('#notif-search')?.addEventListener('input', () => { renderTable(); updateMessage(); });

  // ─── Copiar ───────────────────────────────────────────────────────────────
  container.querySelector('#btn-notif-copy')?.addEventListener('click', async () => {
    const text = container.querySelector('#notif-msg')?.value || '';
    try {
      await navigator.clipboard.writeText(text);
      showToast('Mensagem copiada!', 'success');
    } catch {
      showToast('Copie manualmente o texto da caixa.', 'error');
    }
  });

  // ─── WhatsApp ─────────────────────────────────────────────────────────────
  container.querySelector('#btn-notif-whatsapp')?.addEventListener('click', () => {
    const text = encodeURIComponent(container.querySelector('#notif-msg')?.value || '');
    window.open(`https://wa.me/?text=${text}`, '_blank');
    // TODO API: POST /notificacoes/enviar { destinatarios: [...selectedIds], template, canal: 'whatsapp' }
  });

  // ─── E-mail ───────────────────────────────────────────────────────────────
  container.querySelector('#btn-notif-email')?.addEventListener('click', () => {
    showToast('Notificação por e-mail disparada! (simulação)', 'success', 3000);
    // TODO API: POST /notificacoes/enviar { destinatarios: [...selectedIds], template, canal: 'email' }
  });

  // ─── Histórico clicável ───────────────────────────────────────────────────
  bindHistoricoRows(container, historico);

  // ─── Init ─────────────────────────────────────────────────────────────────
  renderTable();
  updateMessage();
}

/* ─── Histórico: tabela de envios ─────────────────────────────────────────── */
function renderHistoricoTable(historico) {
  return `
    <div class="section-card" style="margin-bottom:0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div class="section-title">4. Histórico de Notificações Enviadas</div>
        <span style="font-size:.78rem;color:var(--text-muted);">${historico.length} envio${historico.length !== 1 ? 's' : ''} registrado${historico.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid var(--border-color); margin-top:14px;">
        <div class="table-wrap">
          <table style="width:100%;border-collapse:collapse;min-width:800px;font-family:'Poppins', sans-serif;">
            <thead>
              <tr>
                <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Data / Hora</th>
                <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Tipo</th>
                <th style="padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">Destinatários</th>
                <th style="padding:16px;text-align:left;font-weight:600;font-size:1.05rem;">Template</th>
                <th style="padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">Canal</th>
                <th style="padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">Status</th>
                <th style="padding:16px;text-align:center;font-weight:600;font-size:1.05rem;">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              ${historico.map((h, i) => {
                const bg = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)';
                const dotColor = h.tipo === 'alto' ? 'var(--red)' : h.tipo === 'medio' ? 'var(--yellow)' : 'var(--green)';
                return `
                  <tr class="historico-row" data-envio-id="${h.id}"
                      style="background:${bg};cursor:pointer;transition:filter .15s;">
                    <td style="padding:13px 14px;font-size:.85rem;color:var(--text-muted);">${h.data} ${h.hora}</td>
                    <td style="padding:13px 14px;">
                      <span style="font-size:.85rem;font-weight:700;color:var(--text);display:inline-flex;align-items:center;gap:5px;">
                        <span style="color:${dotColor};font-size:1.1em;">●</span>${h.tipoLabel}
                      </span>
                    </td>
                    <td style="padding:13px 14px;text-align:center;font-size:.85rem;">
                      <strong>${h.destinatarios.length}</strong> alunos
                    </td>
                    <td style="padding:13px 14px;font-size:.82rem;color:var(--text);">${h.template}</td>
                    <td style="padding:13px 14px;text-align:center;">
                      <span class="badge badge-blue">${canalIcon[h.canal] || ''} ${h.canal}</span>
                    </td>
                    <td style="padding:13px 14px;text-align:center;">
                      <span class="badge badge-green">✅ ${h.status}</span>
                    </td>
                    <td style="padding:13px 14px;text-align:center;">
                      <button class="btn btn-xs btn-outline btn-historico-detail" data-envio-id="${h.id}"
                              style="white-space:nowrap;">
                        Ver alunos →
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ─── Histórico: bind cliques ─────────────────────────────────────────────── */
function bindHistoricoRows(container, historico) {
  container.querySelectorAll('.btn-historico-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const envioId = btn.dataset.envioId;
      const envio   = historico.find(h => h.id === envioId);
      if (envio) showHistoricoDetalhe(container, envio, historico);
    });
  });

  // clique na linha inteira também abre
  container.querySelectorAll('.historico-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.btn-historico-detail')) return;
      const envioId = row.dataset.envioId;
      const envio   = historico.find(h => h.id === envioId);
      if (envio) showHistoricoDetalhe(container, envio, historico);
    });
    row.addEventListener('mouseenter', () => row.style.filter = 'brightness(.95)');
    row.addEventListener('mouseleave', () => row.style.filter = '');
  });
}

/* ─── Histórico: página de detalhe ───────────────────────────────────────── */
function showHistoricoDetalhe(container, envio, historico) {
  // TODO API: GET /notificacoes/historico/${envio.id}/destinatarios
  const wrap = container.querySelector('#notif-historico-wrap');
  if (!wrap) return;

  const dotColor = envio.tipo === 'alto' ? 'var(--red)' : envio.tipo === 'medio' ? 'var(--yellow)' : 'var(--green)';

  wrap.innerHTML = `
    <div class="section-card page-fade-in" style="margin-bottom:0;">

      <!-- Cabeçalho -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <button class="btn btn-outline btn-sm" id="btn-voltar-historico" style="margin-bottom:10px;">
            ← Voltar ao Histórico
          </button>
          <div class="section-title">Detalhe do Envio — ${envio.data} às ${envio.hora}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <span class="badge badge-blue">${canalIcon[envio.canal] || ''} ${envio.canal}</span>
          <span class="badge badge-green">✅ ${envio.status}</span>
        </div>
      </div>

      <!-- Resumo do envio -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
        ${[
          { label: 'Template', value: envio.template, icon: '📋' },
          { label: 'Tipo de Risco', value: `<span style="color:${dotColor};">● </span>${envio.tipoLabel}`, icon: '⚠️' },
          { label: 'Canal', value: `${canalIcon[envio.canal] || ''} ${envio.canal}`, icon: '' },
          { label: 'Total Notificados', value: `<strong>${envio.destinatarios.length}</strong> alunos`, icon: '👥' },
          { label: 'Remetente', value: envio.remetente, icon: '👤' },
        ].map(item => `
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px 16px;">
            <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:5px;">${item.label}</div>
            <div style="font-size:.9rem;font-weight:600;color:var(--text);">${item.icon ? item.icon + ' ' : ''}${item.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- Tabela de alunos notificados -->
      <div style="margin-bottom:10px;font-size:.82rem;font-weight:600;color:var(--text-muted);">
        ALUNOS NOTIFICADOS
      </div>
      <div class="table-wrap">
        <table style="width:100%;border-collapse:collapse;min-width:700px;">
          <thead>
            <tr>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:left;border-radius:7px 0 0 0;">Nome</th>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:left;">Curso</th>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:left;">Turma / Período</th>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:left;">Problema Identificado</th>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:center;">Risco</th>
              <th style="padding:12px 14px;background:var(--blue-primary);color:#fff;font-size:.8rem;font-weight:600;text-align:center;border-radius:0 7px 0 0;">Entrega</th>
            </tr>
          </thead>
          <tbody>
            ${envio.destinatarios.map((d, i) => {
              const bg = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)';
              
              const formatHistoricoMotivo = (motivo) => {
                if (motivo === 'faltas') return 'Excesso de Faltas';
                if (motivo === 'notas') return 'Notas Baixas';
                if (motivo === 'geral') return 'Múltiplos Fatores';
                return 'Sem problemas detectados';
              };
              
              return `
                <tr style="background:${bg};">
                  <td style="padding:12px 14px;font-size:.85rem;font-weight:600;color:var(--text);">${d.nome}</td>
                  <td style="padding:12px 14px;font-size:.82rem;color:var(--text-muted);">${d.curso}</td>
                  <td style="padding:12px 14px;font-size:.82rem;color:var(--text-muted);">${d.turma}</td>
                  <td style="padding:12px 14px;font-size:.85rem;font-weight:600;color:var(--text);">${formatHistoricoMotivo(d.motivoRisco || 'geral')}</td>
                  <td style="padding:12px 14px;text-align:center;">${riscoChip(d.risco)}</td>
                  <td style="padding:12px 14px;text-align:center;">${entregaChip(d.statusEntrega)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Botão voltar
  wrap.querySelector('#btn-voltar-historico')?.addEventListener('click', () => {
    wrap.innerHTML = renderHistoricoTable(historico);
    wrap.classList.add('page-fade-in');
    bindHistoricoRows(container, historico);
  });
}
