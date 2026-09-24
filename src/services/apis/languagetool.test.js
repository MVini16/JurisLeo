import { describe, it, expect, vi } from 'vitest';
import {
  partirEmBlocos, arrumarErros, aplicarSugestao, contextoDoErro, reverTexto,
  tipoDeErro, errosAindaValidos, normalizarPalavra, palavrasDosTermos, filtrarConhecidas,
} from './languagetool.js';
import { criarLimitadorPorMinuto } from './limitador.js';

// resposta no formato do languagetool
const RESPOSTA = {
  matches: [
    { message: 'Possível erro ortográfico.', offset: 2, length: 9, replacements: [{ value: 'contrato' }, { value: 'contratos' }, { value: 'contratou' }, { value: 'contrata' }], rule: { id: 'HUNSPELL_RULE', issueType: 'misspelling' } },
    { message: 'Espaço duplo.', offset: 11, length: 2, replacements: [{ value: ' ' }], rule: { id: 'WHITESPACE_RULE', issueType: 'whitespace' } },
    { message: 'sem tamanho', offset: 0, length: 0, replacements: [] },
  ],
};

describe('partirEmBlocos', () => {
  it('texto curto é um bloco só, a começar no 0', () => {
    expect(partirEmBlocos('olá mundo')).toEqual([{ inicio: 0, texto: 'olá mundo' }]);
  });

  it('corta numa mudança de linha e guarda onde começa cada bloco', () => {
    const texto = 'aaaa\nbbbb\ncccc';
    const blocos = partirEmBlocos(texto, 10);
    expect(blocos.map((b) => b.texto).join('')).toBe(texto);
    expect(blocos.every((b) => b.texto.length <= 10)).toBe(true);
    for (const b of blocos) expect(texto.slice(b.inicio, b.inicio + b.texto.length)).toBe(b.texto);
  });

  it('sem linhas corta num espaço, e sem espaços corta a meio', () => {
    expect(partirEmBlocos('aaa bbb ccc', 8)[0].texto).toBe('aaa bbb ');
    expect(partirEmBlocos('abcdefghij', 4).map((b) => b.texto)).toEqual(['abcd', 'efgh', 'ij']);
  });

  it('blocos só com espaços não são enviados', () => {
    expect(partirEmBlocos('aaaa\n    \n', 5).map((b) => b.texto)).toEqual(['aaaa\n']);
  });
});

describe('arrumarErros', () => {
  it('converte, soma o início do bloco, limita as sugestões e ignora erros sem tamanho', () => {
    const erros = arrumarErros(RESPOSTA, 100);
    expect(erros).toHaveLength(2);
    expect(erros[0]).toEqual({ id: '102-HUNSPELL_RULE', inicio: 102, tamanho: 9, mensagem: 'Possível erro ortográfico.', tipo: 'ortografia', sugestoes: ['contrato', 'contratos', 'contratou'] });
  });

  it('formato estranho dá null', () => {
    expect(arrumarErros({})).toBeNull();
    expect(arrumarErros(null)).toBeNull();
  });
});

describe('aplicarSugestao', () => {
  const texto = 'O contracto  é nulo';
  const erros = arrumarErros(RESPOSTA, 0);

  it('troca a palavra e empurra os erros seguintes', () => {
    const r = aplicarSugestao(texto, erros, erros[0], 'contrato');
    expect(r.texto).toBe('O contrato  é nulo');
    expect(r.erros).toHaveLength(1);
    expect(r.erros[0].inicio).toBe(10);
    expect(r.texto.slice(r.erros[0].inicio, r.erros[0].inicio + r.erros[0].tamanho)).toBe('  ');
  });

  it('erros que se sobrepõem ao trecho trocado saem', () => {
    const sobreposto = { id: 'x', inicio: 4, tamanho: 3, mensagem: '', sugestoes: [] };
    const r = aplicarSugestao(texto, [erros[0], sobreposto], erros[0], 'contrato');
    expect(r.erros).toEqual([]);
  });
});

describe('contextoDoErro', () => {
  it('parte o texto à volta do erro, com reticências quando corta', () => {
    const texto = 'Isto é um texto bastante comprido com um erroo no meio de tudo isto.';
    const inicio = texto.indexOf('erroo');
    const c = contextoDoErro(texto, { inicio, tamanho: 5 }, 10);
    expect(c.errado).toBe('erroo');
    expect(c.antes.startsWith('…')).toBe(true);
    expect(c.depois.endsWith('…')).toBe(true);
  });
});

// fetch falso que responde sempre o mesmo
function deps(corpo, status = 200) {
  const fetch = vi.fn(async () => ({ status, ok: status < 300, headers: { get: () => null }, json: async () => corpo }));
  return { fetch, esperar: async () => {}, online: () => true, agora: () => 0 };
}

describe('reverTexto', () => {
  it('texto vazio não faz pedido', async () => {
    const d = deps(RESPOSTA);
    expect(await reverTexto('   ', { deps: d, limitador: criarLimitadorPorMinuto(20) })).toMatchObject({ ok: true, erros: [] });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it('envia por POST em pt-PT e devolve os erros', async () => {
    const d = deps(RESPOSTA);
    const r = await reverTexto('O contracto  é nulo', { deps: d, limitador: criarLimitadorPorMinuto(20) });
    expect(r.ok).toBe(true);
    expect(r.erros).toHaveLength(2);
    const [url, opcoes] = d.fetch.mock.calls[0];
    expect(url).toBe('https://api.languagetool.org/v2/check');
    expect(opcoes.method).toBe('POST');
    const corpo = new URLSearchParams(opcoes.body);
    expect(corpo.get('language')).toBe('pt-PT');
    expect(corpo.get('text')).toBe('O contracto  é nulo');
  });

  it('texto demasiado comprido nem tenta', async () => {
    const d = deps(RESPOSTA);
    const r = await reverTexto('a'.repeat(60001), { deps: d, limitador: criarLimitadorPorMinuto(20) });
    expect(r.erro).toBe('textoLongo');
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it('sem lugar no limitador devolve limite com a hora', async () => {
    const limitador = criarLimitadorPorMinuto(1, { relogio: () => 0 });
    limitador.tentar();
    const r = await reverTexto('olá', { deps: deps(RESPOSTA), limitador });
    expect(r.erro).toBe('limite');
    expect(r.tentarDepois.getTime()).toBe(60000);
  });

  it('erro do serviço passa para cima', async () => {
    const r = await reverTexto('olá', { deps: deps({}, 503), limitador: criarLimitadorPorMinuto(20) });
    expect(r).toMatchObject({ ok: false, erro: 'servicoEmBaixo' });
  });
});

describe('tipoDeErro', () => {
  it('traduz o issueType, usa a categoria TYPOS e cai em outro', () => {
    expect(tipoDeErro({ issueType: 'grammar' })).toBe('gramatica');
    expect(tipoDeErro({ issueType: 'style' })).toBe('estilo');
    expect(tipoDeErro({ category: { id: 'TYPOS' } })).toBe('ortografia');
    expect(tipoDeErro({ issueType: 'coisa-nova' })).toBe('outro');
    expect(tipoDeErro(undefined)).toBe('outro');
  });
});

describe('reverTexto guarda o texto errado e aceita uma seleção', () => {
  it('cada erro guarda o que estava escrito', async () => {
    const r = await reverTexto('O contracto  é nulo', { deps: deps(RESPOSTA), limitador: criarLimitadorPorMinuto(20) });
    expect(r.erros.map((e) => e.errado)).toEqual(['contracto', '  ']);
  });

  it('só a seleção vai no pedido, e as posições voltam no texto inteiro', async () => {
    const texto = 'Início certo. O contracto  é nulo';
    const selecao = { inicio: 14, fim: texto.length };
    const d = deps(RESPOSTA);
    const r = await reverTexto(texto, { selecao, deps: d, limitador: criarLimitadorPorMinuto(20) });
    expect(new URLSearchParams(d.fetch.mock.calls[0][1].body).get('text')).toBe('O contracto  é nulo');
    expect(r.erros[0].inicio).toBe(16);
    expect(r.erros[0].errado).toBe('contracto');
  });

  it('seleção vazia revê tudo', async () => {
    const d = deps({ matches: [] });
    await reverTexto('abc', { selecao: { inicio: 1, fim: 1 }, deps: d, limitador: criarLimitadorPorMinuto(20) });
    expect(new URLSearchParams(d.fetch.mock.calls[0][1].body).get('text')).toBe('abc');
  });
});

describe('errosAindaValidos', () => {
  const erro = { id: 'a', inicio: 2, tamanho: 9, errado: 'contracto' };

  it('mantém o erro se o texto ainda está lá', () => {
    expect(errosAindaValidos('O contracto é nulo', [erro])).toHaveLength(1);
  });

  it('tira o erro se ela escreveu por cima ou antes dele', () => {
    expect(errosAindaValidos('O contrato é nulo', [erro])).toHaveLength(0);
    expect(errosAindaValidos('Sim. O contracto é nulo', [erro])).toHaveLength(0);
  });
});

describe('palavras conhecidas', () => {
  it('normaliza maiúsculas e pontuação à volta', () => {
    expect(normalizarPalavra('«Pacta,')).toBe('pacta');
    expect(normalizarPalavra('  ')).toBe('');
  });

  it('parte os termos do glossário em palavras', () => {
    expect(palavrasDosTermos(['Pacta sunt servanda', 'ex vi legis'])).toEqual(['pacta', 'sunt', 'servanda', 'ex', 'vi', 'legis']);
  });

  it('tira os erros em palavras conhecidas, mas nunca os de espaços', () => {
    const erros = [
      { id: 'a', errado: 'Servanda' },
      { id: 'b', errado: 'contracto' },
      { id: 'c', errado: '  ' },
    ];
    expect(filtrarConhecidas(erros, ['servanda']).map((e) => e.id)).toEqual(['b', 'c']);
    expect(filtrarConhecidas(erros, [])).toBe(erros);
  });
});
