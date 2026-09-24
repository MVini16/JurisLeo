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

// revê o texto todo: { ok, erros, erro, tentarDepois }; para no primeiro bloco que falhar
export async function reverTexto(texto, { deps = {}, limitador = limitadorLanguageTool } = {}) {
  const limpo = String(texto ?? '');
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
    const doBloco = arrumarErros(resposta.dados, bloco.inicio);
    if (doBloco === null) return { ok: false, erros: [], erro: 'respostaInvalida', tentarDepois: null };
    erros.push(...doBloco);
  }
  return { ok: true, erros, erro: null, tentarDepois: null };
}
