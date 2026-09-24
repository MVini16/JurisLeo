// correção de texto com o languagetool — só quando ela carrega em "rever", nunca enquanto escreve
// sem cache de propósito: o texto dela muda a toda a hora e não vale a pena guardar respostas antigas
import {
  URL_LANGUAGETOOL, LINGUA, PEDIDOS_POR_MINUTO, CARACTERES_POR_BLOCO, CARACTERES_POR_REVISAO, MAX_SUGESTOES,
} from '../../data/languagetool.js';
import { pedir } from './cliente.js';
import { criarLimitadorPorMinuto } from './limitador.js';

// um só limitador para a app inteira: os 20 por minuto contam em todas as anotações
export const limitadorLanguageTool = criarLimitadorPorMinuto(PEDIDOS_POR_MINUTO);

// parte o texto em blocos até ao máximo, de preferência numa mudança de linha, senão num espaço;
// cada bloco sabe onde começa no texto inteiro, para as posições dos erros baterem certo
export function partirEmBlocos(texto, maximo = CARACTERES_POR_BLOCO) {
  const blocos = [];
  let inicio = 0;
  while (inicio < texto.length) {
    let fim = texto.length;
    if (fim - inicio > maximo) {
      const limite = inicio + maximo;
      const linha = texto.lastIndexOf('\n', limite - 1);
      const espaco = texto.lastIndexOf(' ', limite - 1);
      if (linha > inicio) fim = linha + 1;
      else if (espaco > inicio) fim = espaco + 1;
      else fim = limite;
    }
    const pedaco = texto.slice(inicio, fim);
    if (pedaco.trim()) blocos.push({ inicio, texto: pedaco });
    inicio = fim;
  }
  return blocos;
}

// issueType do languagetool → um dos nossos tipos (ver ROTULOS_TIPO em data/languagetool.js)
const TIPOS_ISSUE = {
  misspelling: 'ortografia',
  grammar: 'gramatica',
  typographical: 'pontuacao',
  whitespace: 'pontuacao',
  style: 'estilo',
  register: 'estilo',
  'locale-violation': 'estilo',
};

export function tipoDeErro(regra) {
  if (TIPOS_ISSUE[regra?.issueType]) return TIPOS_ISSUE[regra.issueType];
  // algumas regras não trazem issueType mas vêm na categoria dos erros de escrita
  if (regra?.category?.id === 'TYPOS') return 'ortografia';
  return 'outro';
}

// resposta do languagetool → [{ id, inicio, tamanho, mensagem, sugestoes }] com posições no texto inteiro; null se não for o formato esperado
export function arrumarErros(json, inicioBloco = 0) {
  if (!json || !Array.isArray(json.matches)) return null;
  return json.matches
    .filter((m) => Number.isInteger(m?.offset) && Number.isInteger(m?.length) && m.length > 0)
    .map((m) => {
      const inicio = m.offset + inicioBloco;
      return {
        id: `${inicio}-${m.rule?.id ?? 'regra'}`,
        inicio,
        tamanho: m.length,
        mensagem: m.message ?? '',
        tipo: tipoDeErro(m.rule),
        sugestoes: (m.replacements ?? [])
          .map((r) => r?.value)
          .filter((v) => typeof v === 'string')
          .slice(0, MAX_SUGESTOES),
      };
    });
}

// troca o erro pela sugestão e acerta as posições dos erros que vêm depois;
// os que se sobrepunham ao trecho trocado deixam de fazer sentido e saem
export function aplicarSugestao(texto, erros, erro, troca) {
  const fim = erro.inicio + erro.tamanho;
  const novoTexto = texto.slice(0, erro.inicio) + troca + texto.slice(fim);
  const diferenca = troca.length - erro.tamanho;
  const novosErros = erros
    .filter((e) => e.id !== erro.id && (e.inicio + e.tamanho <= erro.inicio || e.inicio >= fim))
    // o id fica o original: só tem de ser único e estável para o react
    .map((e) => (e.inicio >= fim ? { ...e, inicio: e.inicio + diferenca } : e));
  return { texto: novoTexto, erros: novosErros };
}

// o bocado de texto à volta do erro, para o painel: { antes, errado, depois }
export function contextoDoErro(texto, erro, margem = 30) {
  const ini = Math.max(0, erro.inicio - margem);
  const fim = Math.min(texto.length, erro.inicio + erro.tamanho + margem);
  return {
    antes: (ini > 0 ? '…' : '') + texto.slice(ini, erro.inicio),
    errado: texto.slice(erro.inicio, erro.inicio + erro.tamanho),
    depois: texto.slice(erro.inicio + erro.tamanho, fim) + (fim < texto.length ? '…' : ''),
  };
}

// revê o texto todo, ou só a seleção { inicio, fim }: { ok, erros, erro, tentarDepois }
// as posições vêm sempre no texto inteiro, e cada erro guarda o texto que estava errado (errado),
// para se saber mais tarde se o texto mudou por baixo dele
export async function reverTexto(texto, { selecao = null, deps = {}, limitador = limitadorLanguageTool } = {}) {
  const inteiro = String(texto ?? '');
  const base = selecao && selecao.fim > selecao.inicio ? selecao.inicio : 0;
  const limpo = selecao && selecao.fim > selecao.inicio ? inteiro.slice(selecao.inicio, selecao.fim) : inteiro;
  if (!limpo.trim()) return { ok: true, erros: [], erro: null, tentarDepois: null };
  if (limpo.length > CARACTERES_POR_REVISAO) return { ok: false, erros: [], erro: 'textoLongo', tentarDepois: null };

  const agora = deps.agora ?? (() => Date.now());
  const erros = [];
  for (const bloco of partirEmBlocos(limpo)) {
    if (!limitador.tentar()) {
      return { ok: false, erros: [], erro: 'limite', tentarDepois: new Date(agora() + limitador.livreEm()) };
    }
    const resposta = await pedir(URL_LANGUAGETOOL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ text: bloco.texto, language: LINGUA }).toString(),
    }, deps);
    if (!resposta.ok) return { ok: false, erros: [], erro: resposta.erro, tentarDepois: resposta.tentarDepois };
    const doBloco = arrumarErros(resposta.dados, base + bloco.inicio);
    if (doBloco === null) return { ok: false, erros: [], erro: 'respostaInvalida', tentarDepois: null };
    erros.push(...doBloco.map((e) => ({ ...e, errado: inteiro.slice(e.inicio, e.inicio + e.tamanho) })));
  }
  return { ok: true, erros, erro: null, tentarDepois: null };
}

// ─── depois de rever ─────────────────────────────────────────────────────────

// se ela escreveu depois de rever, um erro cujo texto já não está no mesmo sítio sai da lista:
// assim nunca se troca uma palavra que já não é a que estava errada
export function errosAindaValidos(texto, erros) {
  return erros.filter((e) => texto.slice(e.inicio, e.inicio + e.tamanho) === e.errado);
}

// minúsculas, sem pontuação à volta; "Pacta," e "pacta" são a mesma palavra
export function normalizarPalavra(palavra) {
  return String(palavra ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

// as palavras soltas dos termos do glossário ("pacta sunt servanda" → pacta, sunt, servanda)
export function palavrasDosTermos(termos) {
  return (termos ?? []).flatMap((t) => String(t ?? '').split(/\s+/)).map(normalizarPalavra).filter(Boolean);
}

// tira os erros em palavras que ela já disse que estão certas (ou que estão no glossário);
// erros de espaços e pontuação ficam sempre, porque não têm palavra
export function filtrarConhecidas(erros, conhecidas) {
  const conjunto = new Set((conhecidas ?? []).map(normalizarPalavra).filter(Boolean));
  if (conjunto.size === 0) return erros;
  return erros.filter((e) => {
    const palavra = normalizarPalavra(e.errado);
    return !palavra || !conjunto.has(palavra);
  });
}
