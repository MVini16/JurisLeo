import { describe, it, expect, vi } from 'vitest';
import {
  limparTermo, arrumarExtratoWikcionario, arrumarWikcionario, arrumarWikipedia, pedirSignificado, pedirResumo,
} from './wikimedia.js';

// extrato em texto no formato do livro de estilo do wikcionário (língua nível 1, classe nível 2)
const EXTRATO_LEI = `= Português =
== Substantivo ==
lei f.
regra de direito ditada pela autoridade estatal e tornada obrigatória
norma ou conjunto de normas elaboradas e votadas pelo poder legislativo
=== Tradução ===
Inglês: law
== Etimologia ==
Do latim lex, legis.
== Pronúncia ==
/ˈlɐj/
= Galego =
== Substantivo ==
lei (galego)`;

const EXTRATO_LATIM = `= Latim =
== Locução ==
pacta sunt servanda
os pactos devem ser cumpridos
== Etimologia ==
Latim clássico.`;

describe('limparTermo', () => {
  it('tira espaços e pontuação à volta', () => {
    expect(limparTermo('  «pacta   sunt servanda», ')).toBe('pacta sunt servanda');
    expect(limparTermo('...')).toBe('');
  });
});

describe('arrumarExtratoWikcionario', () => {
  it('fica só com as classes em português, sem tradução, etimologia nem outras línguas', () => {
    const r = arrumarExtratoWikcionario(EXTRATO_LEI);
    expect(r.lingua).toBe('Português');
    expect(r.classes).toHaveLength(1);
    expect(r.classes[0].classe).toBe('Substantivo');
    expect(r.classes[0].definicoes).toEqual([
      'lei f.',
      'regra de direito ditada pela autoridade estatal e tornada obrigatória',
      'norma ou conjunto de normas elaboradas e votadas pelo poder legislativo',
    ]);
  });

  it('sem português usa o latim', () => {
    const r = arrumarExtratoWikcionario(EXTRATO_LATIM);
    expect(r.lingua).toBe('Latim');
    expect(r.classes[0]).toEqual({ classe: 'Locução', definicoes: ['pacta sunt servanda', 'os pactos devem ser cumpridos'] });
  });

  it('aceita cabeçalhos noutros níveis e tira marcas de lista', () => {
    const r = arrumarExtratoWikcionario('== Português ==\n=== Verbo ===\n# fazer cumprir\n# executar');
    expect(r.classes[0].definicoes).toEqual(['fazer cumprir', 'executar']);
  });

  it('limita definições por classe e número de classes', () => {
    const muitas = ['= Português =', ...['A', 'B', 'C', 'D'].flatMap((c) => [`== Classe${c} ==`, '1', '2', '3', '4', '5'])].join('\n');
    const r = arrumarExtratoWikcionario(muitas);
    expect(r.classes).toHaveLength(3);
    expect(r.classes[0].definicoes).toHaveLength(4);
  });

  it('só outras línguas ou vazio dá null', () => {
    expect(arrumarExtratoWikcionario('= Inglês =\n== Noun ==\nlaw')).toBeNull();
    expect(arrumarExtratoWikcionario('')).toBeNull();
  });
});

describe('arrumarWikcionario', () => {
  it('página com significados', () => {
    const r = arrumarWikcionario({ query: { pages: [{ title: 'lei', extract: EXTRATO_LEI }] } });
    expect(r.titulo).toBe('lei');
    expect(r.url).toBe('https://pt.wiktionary.org/wiki/lei');
  });

  it('página em falta ou sem português/latim é não encontrada', () => {
    expect(arrumarWikcionario({ query: { pages: [{ title: 'xpto', missing: true }] } })).toEqual({ naoEncontrado: true });
    expect(arrumarWikcionario({ query: { pages: [{ title: 'law', extract: '= Inglês =\n== Noun ==\nlaw' }] } })).toEqual({ naoEncontrado: true });
  });

  it('formato estranho dá null', () => {
    expect(arrumarWikcionario({})).toBeNull();
  });
});

describe('arrumarWikipedia', () => {
  it('lê o resumo, prefere o link móvel e marca desambiguação', () => {
    const r = arrumarWikipedia({
      type: 'standard', title: 'Contrato', description: 'acordo de vontades', extract: 'Contrato é um negócio jurídico…',
      content_urls: { desktop: { page: 'https://pt.wikipedia.org/wiki/Contrato' }, mobile: { page: 'https://pt.m.wikipedia.org/wiki/Contrato' } },
    });
    expect(r).toEqual({ titulo: 'Contrato', descricao: 'acordo de vontades', extrato: 'Contrato é um negócio jurídico…', url: 'https://pt.m.wikipedia.org/wiki/Contrato', desambiguacao: false });
    expect(arrumarWikipedia({ type: 'disambiguation', title: 'Lei' }).desambiguacao).toBe(true);
    expect(arrumarWikipedia({ nada: 1 })).toBeNull();
  });
});

function criarStorage() {
  const mapa = new Map();
  return { getItem: (k) => (mapa.has(k) ? mapa.get(k) : null), setItem: (k, v) => mapa.set(k, String(v)) };
}

function deps(corpo, status = 200) {
  const fetch = vi.fn(async () => ({ status, ok: status < 300, headers: { get: () => null }, json: async () => corpo }));
  return { fetch, esperar: async () => {}, online: () => true, agora: () => 0 };
}

describe('pedirSignificado e pedirResumo', () => {
  it('significado: termo em minúsculas no url, com origin=*, e guarda em cache', async () => {
    const d = deps({ query: { pages: [{ title: 'lei', extract: EXTRATO_LEI }] } });
    const cache = { storage: criarStorage(), agora: () => 0 };
    const r = await pedirSignificado('Lei', { deps: d, cache });
    const url = d.fetch.mock.calls[0][0];
    expect(url).toContain('titles=lei');
    expect(url).toContain('origin=*');
    expect(r.dados.classes[0].classe).toBe('Substantivo');
    await pedirSignificado('lei', { deps: d, cache });
    expect(d.fetch).toHaveBeenCalledTimes(1);
  });

  it('página sem significados é não encontrado e não fica em cache', async () => {
    const storage = criarStorage();
    const r = await pedirSignificado('law', { deps: deps({ query: { pages: [{ title: 'law', missing: true }] } }), cache: { storage } });
    expect(r).toMatchObject({ dados: null, erro: 'naoEncontrado' });
    expect(storage.getItem('jurisleo-cache:wikcionario-law')).toBeNull();
  });

  it('termo vazio nem pede', async () => {
    const d = deps({});
    expect((await pedirSignificado('  ', { deps: d })).erro).toBe('naoEncontrado');
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it('resumo: primeira letra maiúscula e espaços como _', async () => {
    const d = deps({ title: 'Boa-fé objetiva', extract: '…' });
    await pedirResumo('boa-fé objetiva', { deps: d, cache: { storage: criarStorage() } });
    expect(d.fetch.mock.calls[0][0]).toBe('https://pt.wikipedia.org/api/rest_v1/page/summary/Boa-f%C3%A9_objetiva');
  });
});
