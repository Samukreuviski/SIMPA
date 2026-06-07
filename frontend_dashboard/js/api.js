/**
 * api.js — Predicta
 * Placeholders de integração com o back-end FastAPI.
 * Atualmente retorna dados do mockData.js.
 *
 * TODO (futura integração): Substituir cada função pela chamada Fetch/Axios real.
 * Rotas FastAPI documentadas nos comentários.
 */

import { MOCK_DATA } from './mockData.js';
import { state }     from './state.js';

const BASE_URL = 'http://localhost:8000'; // FastAPI server

/** Helper de fetch com tratamento de erro */
async function apiFetch(path, opts = {}) {
  // TODO: remover comentário e ativar quando back-end estiver disponível
  // const res = await fetch(`${BASE_URL}${path}`, {
  //   headers: { 'Content-Type': 'application/json', ...opts.headers },
  //   ...opts,
  // });
  // if (!res.ok) throw new Error(`API Error: ${res.status}`);
  // return res.json();
  throw new Error('API não conectada — usando mockData');
}

/* ──────────────────────────────────────────────────────────────
   ALUNOS
   GET /alunos/todos          → lista completa de alunos
   GET /alunos/{id}           → aluno individual
   GET /alunos/turma/{id}     → alunos de uma turma
────────────────────────────────────────────────────────────── */
export async function getAlunos(turmaId = null) {
  try {
    return await apiFetch(turmaId ? `/alunos/turma/${turmaId}` : '/alunos/todos');
  } catch {
    return state.getAlunos(turmaId);
  }
}

/* ──────────────────────────────────────────────────────────────
   CURSOS
   GET /cursos/todos          → lista de cursos
   GET /cursos/{id}/turmas    → turmas de um curso
────────────────────────────────────────────────────────────── */
export async function getCursos() {
  try {
    return await apiFetch('/cursos/todos');
  } catch {
    return state.getCursos();
  }
}

export async function getTurmas(cursoId = null) {
  try {
    return await apiFetch(cursoId ? `/cursos/${cursoId}/turmas` : '/turmas/todas');
  } catch {
    return state.getTurmas(cursoId);
  }
}

/* ──────────────────────────────────────────────────────────────
   ESTATÍSTICAS E KPIs
   GET /estatisticas/gerais   → KPIs globais
   GET /estatisticas/avancadas → dados para gráficos
────────────────────────────────────────────────────────────── */
export async function getKpis() {
  try {
    return await apiFetch('/estatisticas/gerais');
  } catch {
    return state.getKpis();
  }
}

export async function getEstatisticas(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    return await apiFetch(`/estatisticas/avancadas?${params}`);
  } catch {
    return MOCK_DATA.estatisticas;
  }
}

/* ──────────────────────────────────────────────────────────────
   PREDIÇÃO
   GET /predicao/{alunoId}    → índice de risco de um aluno
   POST /predicao/batch       → predicão em batch
────────────────────────────────────────────────────────────── */
export async function getPredicao(alunoId) {
  try {
    return await apiFetch(`/predicao/${alunoId}`);
  } catch {
    const aluno = MOCK_DATA.alunos.find(a => a.id === alunoId);
    return { risco: aluno?.risco || 'baixo', irc: Math.random() * 100 };
  }
}

/* ──────────────────────────────────────────────────────────────
   AUTENTICAÇÃO (placeholder)
   POST /auth/login           → { token, perfil }
   POST /auth/logout          → {}
────────────────────────────────────────────────────────────── */
export async function login(cpf, senha) {
  // TODO: implementar autenticação real
  // return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ cpf, senha }) });
  console.warn('Login fictício — back-end desacoplado');
  return { ok: true, perfil: state.getPerfil() };
}

export async function logout() {
  // TODO: chamar POST /auth/logout e limpar token
  console.warn('Logout fictício');
}

/* ──────────────────────────────────────────────────────────────
   LYCEUM (sincronização)
   POST /lyceum/sync          → inicia sincronização de dados
   GET  /lyceum/status        → { lastSync, status }
────────────────────────────────────────────────────────────── */
export async function syncLyceum() {
  try {
    return await apiFetch('/lyceum/sync', { method: 'POST' });
  } catch {
    // Simula sincronização com delay
    return new Promise(resolve =>
      setTimeout(() => resolve({ ok: true, sincronizados: 2847, dataHora: new Date().toISOString() }), 2500)
    );
  }
}

