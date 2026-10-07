import { describe, it, expect } from 'vitest';
import { recolherCopia, restaurarCopia, FORMATO } from './copiaLocal.js';

// um storage de mentira, com a mesma interface do localStorage
function falso(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    _m: m,
  };
}

describe('recolherCopia', () => {
  it('copia só as chaves da app e deixa de fora as da instalação', () => {
    const s = falso({ 'jurisleo-jogos': '{"vf":1}', 'jurisleo-versao-vista': 'x', outra: 'y', 'jurisleo-brincadeiras': '{}' });
    const copia = JSON.parse(recolherCopia(s));
    expect(copia.formato).toBe(FORMATO);
    expect(Object.keys(copia.dados)).toEqual(['jurisleo-brincadeiras', 'jurisleo-jogos']);
  });
  it('sem nada guardado dá uma cópia vazia', () => {
    expect(JSON.parse(recolherCopia(falso())).dados).toEqual({});
  });
});

describe('restaurarCopia', () => {
  it('repõe numa instalação limpa', () => {
    const origem = falso({ 'jurisleo-jogos': '{"vf":{"melhor":9}}', 'jurisleo-estudo-dias': '["2026-10-07"]' });
    const destino = falso();
    const r = restaurarCopia(destino, recolherCopia(origem));
    expect(r).toEqual({ ok: true, repostas: 2 });
    expect(destino.getItem('jurisleo-jogos')).toBe('{"vf":{"melhor":9}}');
  });
  it('recusa lixo e formatos errados', () => {
    expect(restaurarCopia(falso(), 'não é json').ok).toBe(false);
    expect(restaurarCopia(falso(), '{"formato":"outro","dados":{}}').ok).toBe(false);
    expect(restaurarCopia(falso(), null).ok).toBe(false);
  });
  it('ignora chaves que não são da app e valores que não são texto', () => {
    const destino = falso();
    const texto = JSON.stringify({ formato: FORMATO, dados: { 'jurisleo-a': 'ok', 'outra-coisa': 'x', 'jurisleo-b': 5, 'jurisleo-versao-vista': 'x' } });
    expect(restaurarCopia(destino, texto)).toEqual({ ok: true, repostas: 1 });
    expect(destino.getItem('outra-coisa')).toBeNull();
    expect(destino.getItem('jurisleo-versao-vista')).toBeNull();
  });
  it('uma cópia sem nada útil dá erro', () => {
    expect(restaurarCopia(falso(), JSON.stringify({ formato: FORMATO, dados: {} })).ok).toBe(false);
  });
});
