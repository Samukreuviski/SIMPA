/**
 * mockData.js — Predicta
 * Dados simulados para desenvolvimento e apresentação.
 * Desacoplado do back-end FastAPI.
 *
 * TODO (futura integração): Substituir cada seção pelos endpoints:
 *   GET /alunos/todos          → alunos[]
 *   GET /estatisticas/gerais   → kpis{}
 *   GET /estatisticas/avancadas → estatisticas{}
 *   GET /predicao/{id}         → predicao por aluno
 */

export const MOCK_DATA = {

  // ─── PERFIS DE USUÁRIO (role-based) ────────────────────────────────────────
  perfis: {
    admin: {
      id: 'admin',
      nome: 'Samuel Kreüviski',
      cargo: 'Administrador do Sistema',
      email: 'samuel.k@unievangelica.edu.br',
      avatar: 'SK',
      cursos_acesso: 'all',
    },
    gestao: {
      id: 'gestao',
      nome: 'Dra. Patrícia Andrade',
      cargo: 'Pró-Reitora Acadêmica',
      email: 'patricia.a@unievangelica.edu.br',
      avatar: 'PA',
      cursos_acesso: 'all',
    },
    academico: {
      id: 'academico',
      nome: 'Prof. Eduardo Martins',
      cargo: 'Professor / Coordenador',
      email: 'eduardo.m@unievangelica.edu.br',
      avatar: 'EM',
      cursos_acesso: ['ENGSOFT', 'ARQUITEC'],
    },
  },

  // ─── KPIs GLOBAIS ──────────────────────────────────────────────────────────
  kpis: {
    admin: {
      totalAlunos: 2847,
      emRisco: 312,
      taxaAprovacao: 78.4,
      cursosAtivos: 18,
      turmasAtivas: 94,
      taxaFrequencia: 82.1,
    },
    gestao: {
      totalAlunos: 2847,
      emRisco: 312,
      taxaAprovacao: 78.4,
      cursosAtivos: 18,
      turmasAtivas: 94,
      taxaFrequencia: 82.1,
    },
    academico: {
      totalAlunos: 127,
      emRisco: 23,
      taxaAprovacao: 74.8,
      cursosAtivos: 2,
      turmasAtivas: 5,
      taxaFrequencia: 79.3,
    },
  },

  // ─── CURSOS ────────────────────────────────────────────────────────────────
  cursos: [
    { id: 'ENGSOFT', nome: 'Engenharia de Software', codigo: 'ES', turmas: 12, alunos: 487, risco: 'medio', corRisco: '#EAB308', turmasIds: ['T001', 'T002', 'T003'] },
    { id: 'ARQUITEC', nome: 'Arquitetura e Urbanismo', codigo: 'AU', turmas: 8, alunos: 312, risco: 'baixo', corRisco: '#22C55E', turmasIds: ['T004', 'T005'] },
    { id: 'DIREITO', nome: 'Direito', codigo: 'DR', turmas: 16, alunos: 698, risco: 'alto', corRisco: '#EF4444', turmasIds: ['T006', 'T007', 'T008'] },
    { id: 'MEDICINA', nome: 'Medicina', codigo: 'MD', turmas: 10, alunos: 420, risco: 'baixo', corRisco: '#22C55E', turmasIds: ['T009', 'T010'] },
    { id: 'PSICO', nome: 'Psicologia', codigo: 'PS', turmas: 9, alunos: 367, risco: 'medio', corRisco: '#EAB308', turmasIds: ['T011', 'T012'] },
    { id: 'ADMIM', nome: 'Administração', codigo: 'AD', turmas: 14, alunos: 563, risco: 'medio', corRisco: '#EAB308', turmasIds: ['T013', 'T014'] },
  ],

  // ─── TURMAS ────────────────────────────────────────────────────────────────
  turmas: [
    { id: 'T001', cursoId: 'ENGSOFT', nome: 'Engenharia de Software — 2024.1', serie: '4º Período', alunos: 42, emRisco: 8, mediaGeral: 6.2, taxaFreq: 81, risco: 'medio', professor: 'Prof. Eduardo Martins' },
    { id: 'T002', cursoId: 'ENGSOFT', nome: 'Engenharia de Software — 2023.2', serie: '6º Período', alunos: 38, emRisco: 3, mediaGeral: 7.1, taxaFreq: 88, risco: 'baixo', professor: 'Prof. Eduardo Martins' },
    { id: 'T003', cursoId: 'ENGSOFT', nome: 'Engenharia de Software — 2023.1', serie: '8º Período', alunos: 35, emRisco: 12, mediaGeral: 5.8, taxaFreq: 74, risco: 'alto', professor: 'Prof. Carlos Lima' },
    { id: 'T004', cursoId: 'ARQUITEC', nome: 'Arquitetura e Urbanismo — 2024.1', serie: '2º Período', alunos: 40, emRisco: 4, mediaGeral: 7.5, taxaFreq: 90, risco: 'baixo', professor: 'Prof. Eduardo Martins' },
    { id: 'T005', cursoId: 'ARQUITEC', nome: 'Arquitetura e Urbanismo — 2023.2', serie: '4º Período', alunos: 37, emRisco: 6, mediaGeral: 6.9, taxaFreq: 85, risco: 'medio', professor: 'Profa. Ana Costa' },
    { id: 'T006', cursoId: 'DIREITO', nome: 'Direito — 2024.1', serie: '3º Período', alunos: 55, emRisco: 18, mediaGeral: 5.4, taxaFreq: 72, risco: 'alto', professor: 'Prof. Roberto Neves' },
    { id: 'T007', cursoId: 'DIREITO', nome: 'Direito — 2023.2', serie: '5º Período', alunos: 48, emRisco: 14, mediaGeral: 5.9, taxaFreq: 75, risco: 'alto', professor: 'Prof. Roberto Neves' },
    { id: 'T008', cursoId: 'DIREITO', nome: 'Direito — 2022.1', serie: '7º Período', alunos: 44, emRisco: 7, mediaGeral: 6.5, taxaFreq: 80, risco: 'medio', professor: 'Profa. Maria Santos' },
    { id: 'T009', cursoId: 'MEDICINA', nome: 'Medicina — 2024.1', serie: '2º Período', alunos: 45, emRisco: 2, mediaGeral: 8.1, taxaFreq: 95, risco: 'baixo', professor: 'Prof. Jorge Pinto' },
    { id: 'T010', cursoId: 'MEDICINA', nome: 'Medicina — 2023.1', serie: '4º Período', alunos: 43, emRisco: 3, mediaGeral: 7.8, taxaFreq: 93, risco: 'baixo', professor: 'Profa. Lúcia Ferreira' },
    { id: 'T011', cursoId: 'PSICO', nome: 'Psicologia — 2024.1', serie: '3º Período', alunos: 41, emRisco: 9, mediaGeral: 6.4, taxaFreq: 79, risco: 'medio', professor: 'Prof. André Gomes' },
    { id: 'T012', cursoId: 'PSICO', nome: 'Psicologia — 2023.2', serie: '5º Período', alunos: 38, emRisco: 5, mediaGeral: 6.8, taxaFreq: 83, risco: 'medio', professor: 'Profa. Fernanda Luz' },
    { id: 'T013', cursoId: 'ADMIM', nome: 'Administração — 2024.1', serie: '2º Período', alunos: 50, emRisco: 11, mediaGeral: 6.0, taxaFreq: 77, risco: 'medio', professor: 'Prof. Paulo Mendes' },
    { id: 'T014', cursoId: 'ADMIM', nome: 'Administração — 2023.2', serie: '4º Período', alunos: 47, emRisco: 6, mediaGeral: 6.7, taxaFreq: 84, risco: 'medio', professor: 'Profa. Sandra Reis' },
  ],

  // ─── DISCIPLINAS ───────────────────────────────────────────────────────────
  disciplinas: [
    { id: 'D001', turmaId: 'T001', nome: 'Estruturas de Dados', codigo: 'ES301' },
    { id: 'D002', turmaId: 'T001', nome: 'Engenharia de Requisitos', codigo: 'ES302' },
    { id: 'D003', turmaId: 'T001', nome: 'Banco de Dados II', codigo: 'ES303' },
    { id: 'D004', turmaId: 'T002', nome: 'Arquitetura de Software', codigo: 'ES601' },
    { id: 'D005', turmaId: 'T004', nome: 'Projeto Arquitetônico I', codigo: 'AU201' },
    { id: 'D006', turmaId: 'T004', nome: 'Teoria da Arquitetura', codigo: 'AU202' },
  ],

  // ─── ALUNOS ────────────────────────────────────────────────────────────────
  alunos: [
    // Turma T001 — Eng. Software 2024.1
    { id: 'A001', nome: 'Ana Beatriz Sousa', turmaId: 'T001', va1: 4.5, va2: 5.2, va3: 0, frequencia: 68, situacao: 'Cursando', risco: 'alto', genero: 'F', motivoRisco: 'faltas' },
    { id: 'A002', nome: 'Carlos Eduardo Lima', turmaId: 'T001', va1: 6.8, va2: 7.1, va3: 0, frequencia: 85, situacao: 'Cursando', risco: 'baixo', genero: 'M', motivoRisco: null },
    { id: 'A003', nome: 'Daniela Ferreira', turmaId: 'T001', va1: 3.2, va2: 4.0, va3: 0, frequencia: 80, situacao: 'Cursando', risco: 'alto', genero: 'F', motivoRisco: 'notas' },
    { id: 'A004', nome: 'Felipe Augusto Dias', turmaId: 'T001', va1: 7.5, va2: 8.0, va3: 0, frequencia: 92, situacao: 'Cursando', risco: 'baixo', genero: 'M', motivoRisco: null },
    { id: 'A005', nome: 'Gabriela Mota', turmaId: 'T001', va1: 5.0, va2: 5.5, va3: 0, frequencia: 72, situacao: 'Cursando', risco: 'medio', genero: 'F', motivoRisco: 'geral' },
    { id: 'A006', nome: 'Hugo Rezende Carvalho', turmaId: 'T001', va1: 8.5, va2: 9.0, va3: 0, frequencia: 97, situacao: 'Cursando', risco: 'baixo', genero: 'M', motivoRisco: null },
    { id: 'A007', nome: 'Isabela Nogueira', turmaId: 'T001', va1: 2.0, va2: 3.5, va3: 0, frequencia: 55, situacao: 'Cursando', risco: 'alto', genero: 'F', motivoRisco: 'faltas' },
    { id: 'A008', nome: 'João Paulo Almeida', turmaId: 'T001', va1: 6.0, va2: 6.3, va3: 0, frequencia: 78, situacao: 'Cursando', risco: 'medio', genero: 'M', motivoRisco: 'geral' },
    // Turma T002 — Eng. Software 2023.2
    { id: 'A009', nome: 'Karen Cristina Vieira', turmaId: 'T002', va1: 7.2, va2: 7.8, va3: 8.0, frequencia: 89, situacao: 'Cursando', risco: 'baixo', genero: 'F', motivoRisco: null },
    { id: 'A010', nome: 'Lucas Henrique Torres', turmaId: 'T002', va1: 5.5, va2: 6.0, va3: 5.8, frequencia: 82, situacao: 'Cursando', risco: 'medio', genero: 'M', motivoRisco: 'geral' },
    { id: 'A011', nome: 'Mariana Lopes Costa', turmaId: 'T002', va1: 8.0, va2: 8.5, va3: 9.0, frequencia: 95, situacao: 'Cursando', risco: 'baixo', genero: 'F', motivoRisco: null },
    // Turma T004 — Arquitetura 2024.1
    { id: 'A012', nome: 'Nathália Brandão', turmaId: 'T004', va1: 7.8, va2: 8.2, va3: 0, frequencia: 91, situacao: 'Cursando', risco: 'baixo', genero: 'F', motivoRisco: null },
    { id: 'A013', nome: 'Otávio Mendes Silva', turmaId: 'T004', va1: 4.0, va2: 4.5, va3: 0, frequencia: 70, situacao: 'Cursando', risco: 'alto', genero: 'M', motivoRisco: 'notas' },
    { id: 'A014', nome: 'Paula Ribeiro Fonseca', turmaId: 'T004', va1: 6.5, va2: 7.0, va3: 0, frequencia: 87, situacao: 'Cursando', risco: 'baixo', genero: 'F', motivoRisco: null },
    { id: 'A015', nome: 'Rafael Cunha Bastos', turmaId: 'T004', va1: 5.2, va2: 5.8, va3: 0, frequencia: 75, situacao: 'Cursando', risco: 'medio', genero: 'M', motivoRisco: 'geral' },
  ],

  // ─── NOTIFICAÇÕES DO SISTEMA (sininho) ────────────────────────────────────
  notificacoes: [
    { id: 'N001', tipo: 'alerta', titulo: '12 alunos em risco crítico', descricao: 'Direito — 2024.1 apresenta alta taxa de faltas', tempo: '2 min atrás', lida: false },
    { id: 'N002', tipo: 'info', titulo: 'Dados do Lyceum desatualizados', descricao: 'Última sincronização: 5 dias atrás', tempo: '1h atrás', lida: false },
    { id: 'N003', tipo: 'sucesso', titulo: 'Relatório gerado com sucesso', descricao: 'Estatísticas do 1º semestre exportadas', tempo: '3h atrás', lida: true },
  ],

  // ─── HISTÓRICO DE ENVIOS (Central de Notificações) ────────────────────────
  // TODO API: GET /notificacoes/historico → lista de envios com alunos
  historicoEnvios: [
    {
      id: 'E001',
      data: '26/05/2026',
      hora: '09:14',
      tipo: 'alto',
      tipoLabel: 'Risco Alto',
      template: 'Excesso de Faltas',
      canal: 'WhatsApp',
      status: 'Enviado',
      remetente: 'Samuel Kreüviski',
      // TODO API: GET /notificacoes/historico/{id}/destinatarios
      destinatarios: [
        { id: 'A001', nome: 'Ana Beatriz Sousa',    curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 68, va1: 4.5, va2: 5.2, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A003', nome: 'Daniela Ferreira',     curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 80, va1: 3.2, va2: 4.0, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A007', nome: 'Isabela Nogueira',     curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 55, va1: 2.0, va2: 3.5, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A013', nome: 'Otávio Mendes Silva',  curso: 'Arquitetura e Urbanismo', turma: '2024.1 — 2º Período', frequencia: 70, va1: 4.0, va2: 4.5, risco: 'alto', statusEntrega: 'Entregue' },
      ],
    },
    {
      id: 'E002',
      data: '20/05/2026',
      hora: '14:30',
      tipo: 'medio',
      tipoLabel: 'Risco Médio',
      template: 'Baixo Desempenho nas Notas',
      canal: 'E-mail',
      status: 'Enviado',
      remetente: 'Samuel Kreüviski',
      destinatarios: [
        { id: 'A005', nome: 'Gabriela Mota',        curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 72, va1: 5.0, va2: 5.5, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A008', nome: 'João Paulo Almeida',   curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 78, va1: 6.0, va2: 6.3, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A010', nome: 'Lucas Henrique Torres',curso: 'Engenharia de Software', turma: '2023.2 — 6º Período', frequencia: 82, va1: 5.5, va2: 6.0, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A015', nome: 'Rafael Cunha Bastos',  curso: 'Arquitetura e Urbanismo', turma: '2024.1 — 2º Período', frequencia: 75, va1: 5.2, va2: 5.8, risco: 'medio', statusEntrega: 'Entregue' },
      ],
    },
    {
      id: 'E003',
      data: '12/05/2026',
      hora: '11:00',
      tipo: 'todos',
      tipoLabel: 'Todos em Risco',
      template: 'Risco Geral de Reprovação',
      canal: 'WhatsApp',
      status: 'Enviado',
      remetente: 'Samuel Kreüviski',
      destinatarios: [
        { id: 'A001', nome: 'Ana Beatriz Sousa',    curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 68, va1: 4.5, va2: 5.2, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A003', nome: 'Daniela Ferreira',     curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 80, va1: 3.2, va2: 4.0, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A005', nome: 'Gabriela Mota',        curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 72, va1: 5.0, va2: 5.5, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A007', nome: 'Isabela Nogueira',     curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 55, va1: 2.0, va2: 3.5, risco: 'alto',  statusEntrega: 'Entregue' },
        { id: 'A008', nome: 'João Paulo Almeida',   curso: 'Engenharia de Software', turma: '2024.1 — 4º Período', frequencia: 78, va1: 6.0, va2: 6.3, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A010', nome: 'Lucas Henrique Torres',curso: 'Engenharia de Software', turma: '2023.2 — 6º Período', frequencia: 82, va1: 5.5, va2: 6.0, risco: 'medio', statusEntrega: 'Entregue' },
        { id: 'A013', nome: 'Otávio Mendes Silva',  curso: 'Arquitetura e Urbanismo', turma: '2024.1 — 2º Período', frequencia: 70, va1: 4.0, va2: 4.5, risco: 'alto', statusEntrega: 'Entregue' },
        { id: 'A015', nome: 'Rafael Cunha Bastos',  curso: 'Arquitetura e Urbanismo', turma: '2024.1 — 2º Período', frequencia: 75, va1: 5.2, va2: 5.8, risco: 'medio', statusEntrega: 'Entregue' },
      ],
    },
  ],

  // ─── ESTATÍSTICAS (mock para os 6 gráficos) ────────────────────────────────
  estatisticas: {
    // Regressão Linear — pontos de dispersão notas × desempenho
    regressao: {
      pontos: [
        { x: 1, y: 4.2 }, { x: 2, y: 5.1 }, { x: 3, y: 5.8 }, { x: 4, y: 6.0 }, { x: 5, y: 6.4 },
        { x: 6, y: 6.9 }, { x: 7, y: 7.2 }, { x: 8, y: 7.5 }, { x: 9, y: 7.8 }, { x: 10, y: 8.1 },
      ],
      linha: [{ x: 1, y: 4.0 }, { x: 10, y: 8.3 }],
      r2: 0.91,
    },
    // Variância por disciplina
    variancia: {
      labels: ['Est. de Dados', 'Eng. Requisitos', 'BD II', 'Arq. Software', 'Proj. Arq. I'],
      valores: [3.2, 2.1, 4.8, 1.9, 3.5],
      media: 3.1,
    },
    // Média e Mediana por turma
    mediaMediana: {
      labels: ['T001', 'T002', 'T003', 'T004', 'T005'],
      medias: [6.2, 7.1, 5.8, 7.5, 6.9],
      medianas: [6.0, 7.3, 5.5, 7.6, 7.0],
    },
    // Homogeneidade (radar)
    homogeneidade: {
      labels: ['Engenharia', 'Arquitetura', 'Direito', 'Medicina', 'Psicologia', 'Administração'],
      valores: [68, 82, 55, 91, 72, 65],
    },
    // Desvio padrão por curso
    desvioPadrao: {
      labels: ['Engenharia', 'Arquitetura', 'Direito', 'Medicina', 'Psicologia', 'Administração'],
      valores: [1.8, 1.2, 2.4, 0.9, 1.6, 1.9],
    },
    // Quantidade de registros
    registros: {
      total: 2847,
      analisados: 2847,
      filtrado: 487,
      periodos: ['2022.1', '2022.2', '2023.1', '2023.2', '2024.1'],
      porPeriodo: [420, 480, 510, 530, 487],
    },
  },

  // ─── MENSAGENS DE INTERVENÇÃO ──────────────────────────────────────────────
  templates: {
    faltas: (aluno, curso, disciplina) =>
      `Olá, *${aluno}*! 👋

O sistema Predicta identificou que sua frequência na disciplina *${disciplina}* (${curso}) está abaixo do mínimo exigido.

⚠️ *Situação atual:* Frequência crítica

Gostaríamos de entender se há algum motivo específico para as ausências e oferecer o suporte necessário.

Nossa instituição dispõe de:
• Monitoria acadêmica
• Apoio psicológico
• Flexibilização em casos justificados

Entre em contato com a coordenação o mais breve possível para evitar reprovação por falta.

_UniEVANGÉLICA — Predicta_`,

    notas: (aluno, curso, disciplina) =>
      `Olá, *${aluno}*! 

Identificamos que seu desempenho acadêmico na disciplina *${disciplina}* (${curso}) está abaixo da média esperada.

📊 *Situação atual:* Notas insuficientes para aprovação

Não se preocupe! Ainda há tempo para reverter essa situação. Aqui estão algumas opções:

• Monitoria com alunos tutores
• Plantão de dúvidas com o professor
• Material complementar disponível no AVA
• Prova de recuperação (conforme calendário)

Conte conosco! Vamos juntos garantir seu sucesso. 🎓

_UniEVANGÉLICA — Predicta_`,

    geral: (aluno, curso, disciplina) =>
      `Olá, *${aluno}*! 🎯

O algoritmo de predição do sistema Predicta identificou uma *tendência de risco de evasão* no seu perfil acadêmico em ${curso}.

🔍 *Análise:* Combinação de fatores de risco detectada

Queremos garantir que você conclua sua graduação com sucesso! A coordenação do curso gostaria de conversar com você para entender sua situação e oferecer o suporte adequado.

📌 Agende uma conversa com sua coordenação:
• Presencialmente na sala da coordenação
• Por e-mail ou WhatsApp institucional

Sua permanência é muito importante para nós! 💙

_UniEVANGÉLICA — Predicta_`,
  },

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  faq: [
    {
      pergunta: 'Como o Predicta calcula o risco de evasão?',
      resposta: 'O Predicta utiliza um algoritmo de Regressão Logística que combina múltiplos fatores: frequência às aulas, desempenho nas avaliações (VA1, VA2, VA3), histórico semestral e padrões comportamentais. O resultado é o IRC (Índice de Risco Combinado), que varia de 0 a 100.',
    },
    {
      pergunta: 'Como importar novos dados do Lyceum?',
      resposta: 'Clique no botão "Conectar ao Lyceum" na página de Cursos. O sistema buscará automaticamente os dados de matrícula, notas e frequência do portal acadêmico da UniEVANGÉLICA. A sincronização pode levar alguns minutos.',
    },
    {
      pergunta: 'O que é o IRC (Índice de Risco Combinado)?',
      resposta: 'O IRC é uma pontuação de 0 a 100 que representa a probabilidade de um aluno reprovar ou evadir. Abaixo de 30 = baixo risco (verde), entre 30-60 = risco médio (amarelo), acima de 60 = alto risco (vermelho).',
    },
    {
      pergunta: 'Quem tem acesso às informações dos alunos?',
      resposta: 'O acesso é controlado por perfil: Administradores veem tudo; Gestão (Reitor, Pró-Reitor, Secretaria) vê dados macro sem identificação individual; Professores e Coordenadores veem apenas os alunos de suas disciplinas.',
    },
    {
      pergunta: 'Como funciona o módulo de intervenção por WhatsApp?',
      resposta: 'Ao clicar em "Gerar Intervenção", o sistema analisa o motivo do risco do aluno e gera automaticamente 3 modelos de mensagem personalizados. Você escolhe o mais adequado e envia diretamente pelo WhatsApp com um clique.',
    },
    {
      pergunta: 'Com que frequência os dados são atualizados?',
      resposta: 'Os dados são sincronizados com o Lyceum semanalmente de forma automática. É possível forçar uma sincronização manual a qualquer momento pelo botão "Conectar ao Lyceum".',
    },
  ],
};

