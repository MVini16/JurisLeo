import { describe, it, expect } from 'vitest';
import { lerPreferencias, guardarPreferencia, aplicarPreferencias, modoAbertura, PADROES, CHAVE_PREFERENCIAS } from './preferencias.js';

// armazenamento falso, igual ao localStorage
function falso(inicial = {}) {
  const dados = { ...inicial };
  return { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = v; }, dados };
}

describe('lerPreferencias', () => {
  it('sem nada guardado usa os padrões', () => {
    expect(lerPreferencias(falso())).toEqual(PADROES);
  });

  it('lê o que foi guardado', () => {
    const s = falso({ [CHAVE_PREFERENCIAS]: JSON.stringify({ animacoes: 'off', abertura: 'nunca' }) });
    expect(lerPreferencias(s)).toEqual({ animacoes: 'off', abertura: 'nunca' });
  });

  it('valores inválidos voltam ao padrão, campo a campo', () => {
    const s = falso({ [CHAVE_PREFERENCIAS]: JSON.stringify({ animacoes: 'talvez', abertura: 'curta' }) });
    expect(lerPreferencias(s)).toEqual({ animacoes: 'on', abertura: 'curta' });
  });

  it('json estragado dá os padrões', () => {
    expect(lerPreferencias(falso({ [CHAVE_PREFERENCIAS]: '{nao e json' }))).toEqual(PADROES);
  });

  it('sem armazenamento dá os padrões', () => {
    expect(lerPreferencias(undefined)).toBeDefined();
  });
});

describe('guardarPreferencia', () => {
  it('guarda uma escolha e mantém as outras', () => {
    const s = falso();
    guardarPreferencia('abertura', 'sempre', s);
    expect(guardarPreferencia('animacoes', 'off', s)).toEqual({ animacoes: 'off', abertura: 'sempre' });
    expect(lerPreferencias(s)).toEqual({ animacoes: 'off', abertura: 'sempre' });
  });

  it('ignora chaves e valores desconhecidos', () => {
    const s = falso();
    expect(guardarPreferencia('abertura', 'inventada', s)).toEqual(PADROES);
    expect(guardarPreferencia('outra', 'on', s)).toEqual(PADROES);
    expect(s.dados[CHAVE_PREFERENCIAS]).toBeUndefined();
  });
});

describe('aplicarPreferencias', () => {
  it('põe e tira o atributo do html', () => {
    const attrs = {};
    const raiz = { setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } };
    aplicarPreferencias({ animacoes: 'off' }, raiz);
    expect(attrs['data-animacoes']).toBe('off');
    aplicarPreferencias({ animacoes: 'on' }, raiz);
    expect(attrs['data-animacoes']).toBeUndefined();
  });
});

describe('modoAbertura', () => {
  it('por dia: completa à primeira, curta depois', () => {
    expect(modoAbertura('dia', false)).toBe('completa');
    expect(modoAbertura('dia', true)).toBe('curta');
  });

  it('as outras escolhas não dependem de já ter visto', () => {
    expect(modoAbertura('sempre', true)).toBe('completa');
    expect(modoAbertura('curta', false)).toBe('curta');
    expect(modoAbertura('nunca', false)).toBe('nenhuma');
  });
});
