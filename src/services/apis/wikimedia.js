// significado (wikcionário) e resumo de um conceito (wikipédia) — as "arrumar" são puras,
// as "pedir" passam pelo cliente.js e pela cache (30 dias e 7 dias)
import {
  URL_WIKCIONARIO, URL_PAGINA_WIKCIONARIO, URL_WIKIPEDIA, VALIDADE_WIKCIONARIO_MS, VALIDADE_WIKIPEDIA_MS,
  LINGUAS_WIKCIONARIO, SECCOES_IGNORADAS, MAX_DEFINICOES_POR_CLASSE, MAX_CLASSES,
} from '../../data/wikimedia.js';
import { pedir } from './cliente.js';
import { comCache } from './cache.js';

// "  Pacta Sunt  " → "pacta sunt": o wikcionário usa minúsculas (a não ser nomes próprios)
export function limparTermo(termo) {
  return String(termo ?? '').replace(/\s+/g, ' ').trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

// "== Substantivo ==" → { nivel: 2, titulo: 'Substantivo' }; outra linha → null
function lerCabecalho(linha) {
  const m = /^(=+)\s*(.+?)\s*\1\s*$/.exec(linha.trim());
  return m ? { nivel: m[1].length, titulo: m[2].trim() } : null;
}

// extrato em texto do wikcionário → { lingua, classes: [{ classe, definicoes }] } ou null se não houver significados
// não depende dos níveis dos cabeçalhos: língua é um nome de LINGUAS_WIKCIONARIO, classe é qualquer
// outro cabeçalho dentro dela que não esteja em SECCOES_IGNORADAS
// a primeira linha de cada classe no wikcionário é a própria palavra em sílabas e o género
// ("pres.cri.ção f."): não é uma definição, por isso sai
function eLinhaDaPalavra(linha, titulo) {
  if (!titulo) return false;
  const semSilabas = linha.replace(/[.·]/g, '').toLowerCase();
  return semSilabas.startsWith(titulo.toLowerCase());
}

export function arrumarExtratoWikcionario(extrato, titulo = '') {
  const porLingua = {};
  let lingua = null;
  let classe = null;
  for (const linha of String(extrato ?? '').split('\n')) {
    const cab = lerCabecalho(linha);
    if (cab) {
      if (LINGUAS_WIKCIONARIO.includes(cab.titulo)) {
        lingua = cab.titulo;
        classe = null;
        porLingua[lingua] ??= [];
      } else if (lingua && cab.nivel >= 2 && !SECCOES_IGNORADAS.includes(cab.titulo)) {
        classe = { classe: cab.titulo, definicoes: [] };
        porLingua[lingua].push(classe);
      } else {
        // secção ignorada, ou outra língua: nada até ao próximo cabeçalho conta
        if (!LINGUAS_WIKCIONARIO.includes(cab.titulo) && cab.nivel === 1) lingua = null;
        classe = null;
      }
      continue;
    }
    const texto = linha.replace(/^[#*:\s]+/, '').trim();
    if (classe && texto && !eLinhaDaPalavra(texto, titulo)) classe.definicoes.push(texto);
  }
  for (const nome of LINGUAS_WIKCIONARIO) {
    const classes = (porLingua[nome] ?? [])
      .map((c) => ({ classe: c.classe, definicoes: c.definicoes.slice(0, MAX_DEFINICOES_POR_CLASSE) }))
      .filter((c) => c.definicoes.length > 0)
      .slice(0, MAX_CLASSES);
    if (classes.length > 0) return { lingua: nome, classes };
  }
  return null;
}

// resposta da api (formatversion=2) → { titulo, lingua, classes, url } | { naoEncontrado: true }; null se o formato for estranho
export function arrumarWikcionario(json) {
  const pagina = json?.query?.pages?.[0];
  if (!pagina || typeof pagina.title !== 'string') return null;
  if (pagina.missing || pagina.invalid) return { naoEncontrado: true };
  const conteudo = arrumarExtratoWikcionario(pagina.extract, pagina.title);
  if (!conteudo) return { naoEncontrado: true };
  return { titulo: pagina.title, ...conteudo, url: URL_PAGINA_WIKCIONARIO(pagina.title) };
}

// resposta do resumo da wikipédia → { titulo, descricao, extrato, url, desambiguacao }; null se o formato for estranho
export function arrumarWikipedia(json) {
  if (!json || typeof json.title !== 'string') return null;
  return {
    titulo: json.title,
    descricao: json.description ?? '',
    extrato: json.extract ?? '',
    url: json.content_urls?.mobile?.page ?? json.content_urls?.desktop?.page ?? '',
    // página de desambiguação: há vários artigos com este nome
    desambiguacao: json.type === 'disambiguation',
  };
}

async function pedirArrumado(url, arrumar, deps) {
  const resposta = await pedir(url, {}, deps);
  if (!resposta.ok) return resposta;
  const dados = arrumar(resposta.dados);
  if (dados === null) return { ok: false, dados: null, erro: 'respostaInvalida', tentarDepois: null };
  // página que existe mas sem significados em português ou latim conta como não encontrada (e não se guarda)
  if (dados.naoEncontrado) return { ok: false, dados: null, erro: 'naoEncontrado', tentarDepois: null };
  return { ...resposta, dados };
}

// devolvem o formato do comCache: { dados, guardadoEm, daCache, erro, tentarDepois }
export function pedirSignificado(termo, { deps, cache } = {}) {
  const limpo = limparTermo(termo).toLowerCase();
  if (!limpo) return Promise.resolve({ dados: null, guardadoEm: null, daCache: false, erro: 'naoEncontrado', tentarDepois: null });
  return comCache(`wikcionario-${limpo}`, VALIDADE_WIKCIONARIO_MS,
    () => pedirArrumado(URL_WIKCIONARIO(limpo), arrumarWikcionario, deps), cache);
}

export function pedirResumo(termo, { deps, cache } = {}) {
  const limpo = limparTermo(termo);
  if (!limpo) return Promise.resolve({ dados: null, guardadoEm: null, daCache: false, erro: 'naoEncontrado', tentarDepois: null });
  // a wikipédia quer a primeira letra maiúscula no título
  const titulo = limpo.charAt(0).toUpperCase() + limpo.slice(1);
  return comCache(`wikipedia-${titulo.toLowerCase()}`, VALIDADE_WIKIPEDIA_MS,
    () => pedirArrumado(URL_WIKIPEDIA(titulo), arrumarWikipedia, deps), cache);
}

// ─── que palavra procurar ────────────────────────────────────────────────────

// com seleção: o bocado selecionado (até 60 caracteres); sem seleção: a palavra onde está o cursor
// (letras, números, hífen e apóstrofo contam como parte da palavra: "boa-fé", "d'água")
export function termoDoCampo(texto, inicio, fim = inicio) {
  const t = String(texto ?? '');
  if (fim > inicio) return limparTermo(t.slice(inicio, fim)).slice(0, 60);
  const parteDaPalavra = (c) => /[\p{L}\p{N}'’-]/u.test(c ?? '');
  let a = inicio;
  let b = inicio;
  while (a > 0 && parteDaPalavra(t[a - 1])) a -= 1;
  while (b < t.length && parteDaPalavra(t[b])) b += 1;
  return limparTermo(t.slice(a, b));
}
