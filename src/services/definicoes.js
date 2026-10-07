// o catálogo das definições e a pesquisa — puro, sem react nem firebase, para testar sem mocks.
// cada definição diz onde vive: numa subpágina, numa página própria da app ou numa ação (sair, tutorial)

export const GRUPOS = [
  { id: 'conta', titulo: 'Conta' },
  { id: 'aplicacao', titulo: 'Aplicação' },
  { id: 'dados', titulo: 'Dados' },
  { id: 'suporte', titulo: 'Suporte' },
];

// as subpáginas (/perfil/:secao)
export const SECCOES = {
  dados: { id: 'dados', titulo: 'Dados académicos', grupo: 'conta', icone: 'pessoa' },
  aparencia: { id: 'aparencia', titulo: 'Aparência', grupo: 'aplicacao', icone: 'paleta' },
  brincadeiras: { id: 'brincadeiras', titulo: 'Brincadeiras', grupo: 'aplicacao', icone: 'sorriso' },
  'os-meus-dados': { id: 'os-meus-dados', titulo: 'Os meus dados', grupo: 'dados', icone: 'base' },
  sobre: { id: 'sobre', titulo: 'Sobre o JurisLeo', grupo: 'suporte', icone: 'info' },
};

// tudo o que se pode encontrar na pesquisa
export const DEFINICOES = [
  { id: 'dados', rotulo: 'Dados académicos', destino: { tipo: 'secao', secao: 'dados' }, palavras: ['curso', 'ano', 'turma', 'subturma', 'ano letivo', 'faculdade', 'perfil'] },
  { id: 'tema', rotulo: 'Tema escuro', destino: { tipo: 'secao', secao: 'aparencia' }, palavras: ['claro', 'escuro', 'noite', 'modo escuro', 'cores', 'aparencia'] },
  { id: 'folha', rotulo: 'Folha das notas novas', destino: { tipo: 'secao', secao: 'aparencia' }, palavras: ['pautado', 'quadriculado', 'pontos', 'branco', 'papel', 'caderno', 'notas'] },
  { id: 'barney', rotulo: 'Piadas do Barney', destino: { tipo: 'secao', secao: 'brincadeiras' }, palavras: ['legendary', 'how i met your mother', 'himym', 'animacao', 'piada', 'legen'] },
  { id: 'vini', rotulo: 'Mensagens do Vini ao escrever', destino: { tipo: 'secao', secao: 'brincadeiras' }, palavras: ['provocacoes', 'despacho', 'balao', 'post-it', 'mensagens', 'vini', 'tribunal'] },
  { id: 'boneco', rotulo: 'Boneco do Vini', destino: { tipo: 'secao', secao: 'brincadeiras' }, palavras: ['mascote', 'chat', 'conversa', 'esconder', 'aspeto', 'toga', 'balanca', 'posicao', 'contacto', 'telefone', 'numero', 'falar'] },
  { id: 'frequencia-vini', rotulo: 'Frequência das mensagens do Vini', destino: { tipo: 'secao', secao: 'brincadeiras' }, palavras: ['minutos', 'de quanto em quanto tempo', 'com que frequencia'] },
  { id: 'exportar-dados', rotulo: 'Exportar os meus dados', destino: { tipo: 'secao', secao: 'os-meus-dados' }, palavras: ['copia de seguranca', 'backup', 'json', 'descarregar', 'guardar tudo'] },
  { id: 'repor-cadeiras', rotulo: 'Repor as cadeiras do 2.º ano', destino: { tipo: 'secao', secao: 'os-meus-dados' }, palavras: ['apagar', 'notas', 'faltas', 'reset', 'repor', 'manutencao', 'arranjar'] },
  { id: 'ajuda', rotulo: 'Central de ajuda', destino: { tipo: 'rota', rota: '/ajuda' }, palavras: ['duvidas', 'como funciona', 'suporte', 'apoio'] },
  { id: 'tutorial', rotulo: 'Rever o tutorial', destino: { tipo: 'acao', acao: 'tutorial' }, palavras: ['introducao', 'boas-vindas', 'dashboard', 'ajuda'] },
  { id: 'sobre', rotulo: 'Sobre o JurisLeo', destino: { tipo: 'secao', secao: 'sobre' }, palavras: ['versao', 'feito por', 'vini', 'creditos', 'quem fez'] },
  { id: 'sair', rotulo: 'Terminar sessão', destino: { tipo: 'acao', acao: 'sair' }, palavras: ['sair', 'logout', 'conta', 'desligar'] },
];

function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// onde aparece o resultado: o nome da subpágina, ou o grupo
export function localDaDefinicao(definicao) {
  if (definicao.destino.tipo === 'secao') return SECCOES[definicao.destino.secao].titulo;
  return definicao.destino.tipo === 'rota' ? 'Suporte' : 'Conta';
}

// procura por palavras soltas (todas têm de bater), sem ligar a acentos nem a maiúsculas.
// o que bate no nome vem à frente do que só bate nas palavras-chave
export function pesquisarDefinicoes(termo) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return [];
  const resultados = [];
  for (const definicao of DEFINICOES) {
    const nome = normalizar(definicao.rotulo);
    const todo = `${nome} ${definicao.palavras.map(normalizar).join(' ')} ${normalizar(localDaDefinicao(definicao))}`;
    if (!palavras.every((p) => todo.includes(p))) continue;
    const noNome = palavras.every((p) => nome.includes(p));
    resultados.push({ definicao, pontos: noNome ? (nome.startsWith(palavras[0]) ? 0 : 1) : 2 });
  }
  return resultados.sort((a, b) => a.pontos - b.pontos).map((r) => r.definicao);
}

// a rota de uma subpágina
export function rotaDaSeccao(id) {
  return `/perfil/${id}`;
}

export function seccaoValida(id) {
  return Object.prototype.hasOwnProperty.call(SECCOES, id) ? SECCOES[id] : null;
}
