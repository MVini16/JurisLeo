// dados reais da leonor, 1.º semestre de 2026/2027
// turma a, subturma 7, tudo em método a
// fonte: horário oficial fdul 2026/2027 (2.º ano, s1, turma a), alterado a 14-09-2026,
// cruzado com programas e regentes 2026/2027

export const dadosLeonor = {
  turma: 'TA',
  subturma: 7,
  anoLetivo: '2026/2027',
  ano: 2,
  semestreAtual: 1,
};

// as cinco cadeiras do 1.º semestre
export const cadeirasS1 = [
  {
    id: 'administrativo-1',
    nome: 'Direito Administrativo I',
    abrev: 'DA I',
    regente: 'Paulo Otero',
    colaboradores: ['Domingos Farinho', 'João Tiago Silveira', 'Mafalda Carmona'],
    metodo: 'A',
    optativa: false,
    cor: '#1F3A5F',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30,
    aulasTeoricasPrevistas: 30,
  },
  {
    id: 'dip-1',
    nome: 'Direito Internacional Público I',
    abrev: 'DIP I',
    regente: 'Carlos Blanco de Morais',
    colaboradores: ['Vasco Becker-Weinberg'],
    metodo: 'A',
    optativa: false,
    cor: '#2E6F5E',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30,
    aulasTeoricasPrevistas: 30,
  },
  {
    id: 'obrigacoes-1',
    nome: 'Direito das Obrigações I',
    abrev: 'DO I',
    regente: 'Diogo Costa Gonçalves',
    colaboradores: ['David Oliveira Festas'],
    metodo: 'A',
    optativa: false,
    cor: '#7B1E2B',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30,
    aulasTeoricasPrevistas: 30,
  },
  {
    id: 'familia',
    nome: 'Direito da Família',
    abrev: 'DF',
    regente: 'Jorge Duarte Pinheiro',
    colaboradores: [],
    metodo: 'A',
    optativa: false,
    cor: '#B5838D',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30,
    aulasTeoricasPrevistas: 30,
  },
  {
    id: 'hri',
    nome: 'História das Relações Internacionais',
    abrev: 'HRI',
    regente: 'Filipe de Arede Nunes',
    colaboradores: ['Luís Cabral de Oliveira'],
    metodo: 'A',
    optativa: true,
    cor: '#5C8374',
    pesos: { provaEscrita: 0.5, outrosElementos: 0.5 },
    aulasPraticasPrevistas: 30,
    aulasTeoricasPrevistas: 30,
  },
];

// tempos letivos da fdul: 50 minutos, com intervalo entre o 2.º e o 3.º
export const temposLetivos = [
  { id: 1, inicio: '14:00', fim: '14:50' },
  { id: 2, inicio: '15:00', fim: '15:50' },
  { id: 3, inicio: '16:10', fim: '17:00' },
  { id: 4, inicio: '17:10', fim: '18:00' },
];

// horário completo: 20 aulas por semana, 10 teóricas e 10 práticas
// diaSemana: 1 = segunda ... 5 = sexta (igual a date.getday())
export const horarioS1 = [
  // segunda
  { diaSemana: 1, tempo: 1, cadeiraId: 'dip-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 1, tempo: 2, cadeiraId: 'obrigacoes-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 1, tempo: 3, cadeiraId: 'obrigacoes-1', tipo: 'pratica', sala: '12.02' },
  { diaSemana: 1, tempo: 4, cadeiraId: 'administrativo-1', tipo: 'pratica', sala: '12.34' },

  // terça
  { diaSemana: 2, tempo: 1, cadeiraId: 'familia', tipo: 'pratica', sala: 'Anf.9' },
  { diaSemana: 2, tempo: 2, cadeiraId: 'hri', tipo: 'pratica', sala: 'Anf.9' },
  { diaSemana: 2, tempo: 3, cadeiraId: 'administrativo-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 2, tempo: 4, cadeiraId: 'hri', tipo: 'teorica', sala: 'Anf.9' },

  // quarta
  { diaSemana: 3, tempo: 1, cadeiraId: 'dip-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 3, tempo: 2, cadeiraId: 'familia', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 3, tempo: 3, cadeiraId: 'dip-1', tipo: 'pratica', sala: '12.02' },
  { diaSemana: 3, tempo: 4, cadeiraId: 'obrigacoes-1', tipo: 'pratica', sala: '12.02' },

  // quinta
  { diaSemana: 4, tempo: 1, cadeiraId: 'dip-1', tipo: 'pratica', sala: '10.11' },
  { diaSemana: 4, tempo: 2, cadeiraId: 'familia', tipo: 'pratica', sala: '12.32' },
  { diaSemana: 4, tempo: 3, cadeiraId: 'administrativo-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 4, tempo: 4, cadeiraId: 'hri', tipo: 'teorica', sala: 'Anf.9' },

  // sexta
  { diaSemana: 5, tempo: 1, cadeiraId: 'familia', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 5, tempo: 2, cadeiraId: 'obrigacoes-1', tipo: 'teorica', sala: 'Anfiteatro 1' },
  { diaSemana: 5, tempo: 3, cadeiraId: 'hri', tipo: 'pratica', sala: '12.04' },
  { diaSemana: 5, tempo: 4, cadeiraId: 'administrativo-1', tipo: 'pratica', sala: '12.34' },
];

// datas do 1.º semestre, calendário escolar fdul 2026/2027 (despacho 54/2026)
export const calendarioS1 = {
  inicioAulas: '2026-09-07',
  fimAulas: '2026-12-18',
  janelaFrequencias: { inicio: '2026-11-30', fim: '2026-12-18' },
};

// mapas derivados, para os sítios que só precisam de cor/nome por id
export const coresCadeiras = Object.fromEntries(cadeirasS1.map((c) => [c.id, c.cor]));
export const abrevCadeiras = Object.fromEntries(cadeirasS1.map((c) => [c.id, c.abrev]));
export const nomesCadeiras = Object.fromEntries(cadeirasS1.map((c) => [c.id, c.nome]));

// nome curto para mostrar num badge — usa a abreviatura, ou o próprio id em maiúsculas se for desconhecido
export function nomeCurtoCadeira(id) {
  return abrevCadeiras[id] || id?.toUpperCase() || '';
}

export function getCadeira(id) {
  return cadeirasS1.find((c) => c.id === id) || null;
}
