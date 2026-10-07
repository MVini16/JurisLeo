// lógica pura dos cadernos de notas — sem react e sem firebase, para testar com vitest sem mocks.
// um caderno é uma cadeira (ou o caderno "livre"); dentro dele há secções; cada nota é uma página.
// nada disto precisa de coleções novas: a secção é só um campo de texto opcional em cada nota

export const CADERNO_LIVRE = 'livre';
export const SECCOES_PADRAO = ['Teóricas', 'Práticas', 'Perguntas para frequência', 'Resumos', 'Dúvidas'];
export const SECCOES_LIVRE = ['Ideias', 'Rascunhos', 'Leituras'];
export const SECCAO_FREQUENCIA = 'Perguntas para frequência';
export const ABAS_NOTAS = ['todas', 'fav', 'rasc', 'freq'];

const MAX_NOME_SECCAO = 40;

export function seccoesPadrao(cadernoId) {
  return cadernoId === CADERNO_LIVRE ? SECCOES_LIVRE : SECCOES_PADRAO;
}

// compara nomes sem ligar a maiúsculas nem a acentos ("práticas" = "Praticas")
export function mesmoNome(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'pt', { sensitivity: 'base' }) === 0;
}

export function normalizarNomeSeccao(nome) {
  return String(nome ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NOME_SECCAO);
}

// o caderno de uma nota: a cadeira, se for uma das conhecidas; senão o caderno livre
export function cadernoDaNota(nota, idsConhecidos) {
  return idsConhecidos.includes(nota?.cadeiraId) ? nota.cadeiraId : CADERNO_LIVRE;
}

// a secção de uma nota; as antigas (sem secção) vêm do tipo teórica/prática
export function seccaoDaNota(nota, cadernoId) {
  const guardada = normalizarNomeSeccao(nota?.seccao);
  const padrao = seccoesPadrao(cadernoId);
  if (guardada) return padrao.find((s) => mesmoNome(s, guardada)) ?? guardada;
  if (cadernoId === CADERNO_LIVRE) return SECCOES_LIVRE[0];
  return nota?.tipo === 'pratica' ? 'Práticas' : 'Teóricas';
}

export function eParaFrequencia(nota, idsConhecidos) {
  return seccaoDaNota(nota, cadernoDaNota(nota, idsConhecidos)) === SECCAO_FREQUENCIA;
}

export function milissegundos(marca) {
  if (marca?.toMillis) return marca.toMillis();
  return typeof marca === 'number' ? marca : 0;
}

function semAcentos(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function passaAba(nota, aba, ids) {
  if (aba === 'fav') return !!nota.favorita;
  if (aba === 'rasc') return !!nota.rascunho;
  if (aba === 'freq') return eParaFrequencia(nota, ids);
  return true;
}

// filtra por separador, por caderno e por pesquisa (sem ligar a acentos)
export function filtrarNotas(notas, { aba = 'todas', cadernoId = null, pesquisa = '', idsConhecidos }) {
  const termo = semAcentos(pesquisa).trim();
  return notas.filter((nota) => {
    if (cadernoId && cadernoDaNota(nota, idsConhecidos) !== cadernoId) return false;
    if (!passaAba(nota, aba, idsConhecidos)) return false;
    if (!termo) return true;
    const alvo = semAcentos(`${nota.titulo ?? ''} ${nota.conteudo ?? ''} ${(nota.tags || []).join(' ')}`);
    return alvo.includes(termo);
  });
}

export function contarPorAba(notas, idsConhecidos) {
  const contagem = {};
  for (const aba of ABAS_NOTAS) contagem[aba] = notas.filter((n) => passaAba(n, aba, idsConhecidos)).length;
  return contagem;
}

export function contarPorCaderno(notas, idsConhecidos) {
  const contagem = Object.fromEntries([...idsConhecidos, CADERNO_LIVRE].map((id) => [id, 0]));
  for (const nota of notas) contagem[cadernoDaNota(nota, idsConhecidos)] += 1;
  return contagem;
}

function maisRecentePrimeiro(a, b) {
  return milissegundos(b.atualizadoEm) - milissegundos(a.atualizadoEm);
}

// secções de um caderno: as padrão (sempre) e as personalizadas que já têm páginas
export function seccoesDoCaderno(notas, cadernoId, idsConhecidos) {
  const nomes = [...seccoesPadrao(cadernoId)];
  const personalizadas = [];
  for (const nota of notas) {
    if (cadernoDaNota(nota, idsConhecidos) !== cadernoId) continue;
    const nome = seccaoDaNota(nota, cadernoId);
    if (![...nomes, ...personalizadas].some((s) => mesmoNome(s, nome))) personalizadas.push(nome);
  }
  personalizadas.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
  return [...nomes, ...personalizadas];
}

// a árvore do caderno: [{ nome, personalizada, notas }] com as páginas mais recentes primeiro
export function agruparPorSeccao(notas, cadernoId, idsConhecidos) {
  const doCaderno = notas.filter((n) => cadernoDaNota(n, idsConhecidos) === cadernoId);
  const padrao = seccoesPadrao(cadernoId);
  return seccoesDoCaderno(notas, cadernoId, idsConhecidos).map((nome) => ({
    nome,
    personalizada: !padrao.includes(nome),
    notas: doCaderno.filter((n) => mesmoNome(seccaoDaNota(n, cadernoId), nome)).sort(maisRecentePrimeiro),
  }));
}

export function previewTexto(nota, max = 160) {
  const limpo = String(nota?.conteudo ?? '').replace(/\s+/g, ' ').trim();
  return limpo.length > max ? `${limpo.slice(0, max).trimEnd()}…` : limpo;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function dataCurta(marca) {
  const d = marca?.toDate?.();
  return d ? `${d.getDate()} ${MESES[d.getMonth()]}` : '';
}
