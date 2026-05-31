/**
 * state.js — Predicta
 * Estado global da aplicação via EventTarget (sem Redux/Zustand).
 * Componentes se inscrevem com state.on('change', callback).
 */

import { MOCK_DATA } from './mockData.js';

class AppState extends EventTarget {
  constructor() {
    super();
    this._state = {
      currentRole:       'admin',           // 'admin' | 'gestao' | 'academico'
      currentTheme:      'light',           // 'light' | 'dark' | 'high-contrast'
      sidebarCollapsed:  false,
      currentPage:       'dashboard',
      // Cascata de navegação (Cursos)
      selectedCursoId:   null,
      selectedTurmaId:   null,
      // Filtros ativos (Predição)
      activeFilters: {
        cursoId:    null,
        materiaId:  null,
        dataInicio: null,
        dataFim:    null,
        genero:     null,
        turmaId:    null,
      },
      // Notificações
      notificacoesLidas: [],
    };
  }

  // ─── Getter genérico ───────────────────────────────────────────────────────
  get(key) { return this._state[key]; }

  // ─── Setter com event dispatch ─────────────────────────────────────────────
  set(key, value) {
    const old = this._state[key];
    this._state[key] = value;
    this.dispatch('change', { key, old, value });
  }

  // ─── Helpers por domínio ───────────────────────────────────────────────────
  getPerfil()     { return MOCK_DATA.perfis[this._state.currentRole]; }
  getKpis()       { return MOCK_DATA.kpis[this._state.currentRole]; }
  getCursos() {
    const role = this._state.currentRole;
    const acesso = MOCK_DATA.perfis[role].cursos_acesso;
    if (acesso === 'all') return MOCK_DATA.cursos;
    return MOCK_DATA.cursos.filter(c => acesso.includes(c.id));
  }
  getTurmas(cursoId = null) {
    const turmas = MOCK_DATA.turmas;
    const role   = this._state.currentRole;
    const acesso = MOCK_DATA.perfis[role].cursos_acesso;
    let filtradas = turmas;
    if (acesso !== 'all') {
      filtradas = filtradas.filter(t => acesso.includes(t.cursoId));
    }
    if (cursoId) filtradas = filtradas.filter(t => t.cursoId === cursoId);
    return filtradas;
  }
  getAlunos(turmaId = null) {
    const alunos = MOCK_DATA.alunos;
    if (turmaId) return alunos.filter(a => a.turmaId === turmaId);
    // Para perfil acadêmico, limitar às turmas acessíveis
    const role   = this._state.currentRole;
    const acesso = MOCK_DATA.perfis[role].cursos_acesso;
    if (acesso === 'all') return alunos;
    const turmasAceitas = MOCK_DATA.turmas
      .filter(t => acesso.includes(t.cursoId))
      .map(t => t.id);
    return alunos.filter(a => turmasAceitas.includes(a.turmaId));
  }

  // ─── Filtros ───────────────────────────────────────────────────────────────
  setFilter(key, value) {
    this._state.activeFilters = { ...this._state.activeFilters, [key]: value };
    this.dispatch('filtersChange', { filters: this._state.activeFilters });
  }
  resetFilters() {
    this._state.activeFilters = { cursoId: null, materiaId: null, dataInicio: null, dataFim: null, genero: null, turmaId: null };
    this.dispatch('filtersChange', { filters: this._state.activeFilters });
  }

  // ─── Tema ──────────────────────────────────────────────────────────────────
  setTheme(theme) {
    this._state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('predicta-theme', theme);
    this.dispatch('themeChange', { theme });
  }
  loadSavedTheme() {
    const saved = localStorage.getItem('predicta-theme') || 'light';
    this.setTheme(saved);
  }

  // ─── Dispatch helper ───────────────────────────────────────────────────────
  dispatch(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  // ─── Listener shorthand ────────────────────────────────────────────────────
  on(eventName, callback) {
    this.addEventListener(eventName, callback);
    return () => this.removeEventListener(eventName, callback);
  }
}

export const state = new AppState();
