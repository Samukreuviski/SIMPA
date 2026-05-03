/**
 * api.js — Camada de serviço com cache em memória
 * Mapeia os endpoints reais do backend FastAPI (main.py)
 *
 * Endpoints disponíveis:
 *   GET /alunos/todos          → lista de alunos únicos
 *   GET /registros/{id}        → boletim de um aluno (VA1, VA2, VA3 em escala 0-100)
 *   GET /estatisticas/gerais   → total de registros + contagem por situação
 *   GET /estatisticas/avancadas → quartis, DP, homogeneidade, KPIs
 *   GET /predicao/{id}         → predição individual (IRC, score, tendência)
 */

const API = {
  _cache: new Map(),

  /** Executa fetch com cache em memória para evitar requisições duplicadas */
  async _cached(key, fetcher) {
    if (this._cache.has(key)) return this._cache.get(key);
    const promise = fetcher();
    this._cache.set(key, promise); // salva a promise (não o resultado) para evitar race conditions
    return promise;
  },

  async _fetch(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[API] Falha em ${url}:`, e.message);
      return null;
    }
  },

  // ── Estatísticas ─────────────────────────────────────────────────────────

  async getEstatisticasAvancadas() {
    return this._cached('stats_avancadas', async () => {
      const d = await this._fetch('/estatisticas/avancadas');
      return d; // retorna null se falhar — componentes tratam
    });
  },

  async getEstatisticasGerais() {
    return this._cached('stats_gerais', async () => {
      return await this._fetch('/estatisticas/gerais');
    });
  },

  // ── Alunos ────────────────────────────────────────────────────────────────

  async getAlunos() {
    return this._cached('alunos', async () => {
      return await this._fetch('/alunos/todos');
    });
  },

  // ── Boletins ─────────────────────────────────────────────────────────────

  async getBoletimAluno(id) {
    return this._cached(`boletim_${id}`, async () => {
      return await this._fetch(`/registros/${id}`);
    });
  },

  /**
   * Carrega boletins de TODOS os alunos em paralelo.
   * Retorna array de { id_aluno, boletim: [RegistroAcademico] }
   */
  async getAllBoletins() {
    return this._cached('all_boletins', async () => {
      const alunos = await this.getAlunos();
      if (!alunos) return [];
      const ids = [...new Set(alunos.map(a => String(a.ID_ALUNO)))];
      const results = await Promise.all(ids.map(id => this.getBoletimAluno(id)));
      return results.filter(r => r && r.boletim && r.boletim.length > 0);
    });
  },

  // ── Predição ──────────────────────────────────────────────────────────────

  async getPredicaoAluno(id) {
    return this._cached(`predicao_${id}`, async () => {
      return await this._fetch(`/predicao/${id}`);
    });
  },

  /**
   * Carrega predições de todos os alunos em paralelo.
   * Retorna array de resultados do endpoint /predicao/{id}
   */
  async getAllPredictions() {
    return this._cached('all_predictions', async () => {
      const alunos = await this.getAlunos();
      if (!alunos) return [];
      const ids = [...new Set(alunos.map(a => String(a.ID_ALUNO)))];
      const results = await Promise.all(ids.map(id => this.getPredicaoAluno(id)));
      return results.filter(Boolean);
    });
  },

  /** Limpa o cache (útil para botão de refresh) */
  clearCache() {
    this._cache.clear();
  }
};

window.API = API;
