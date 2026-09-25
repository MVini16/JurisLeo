import { describe, it, expect } from 'vitest';
import { normalizarEcra, ecraDosModulos, tirarWidget, mudarTamanho, moverWidget, juntarWidget, mudarEstrutura, widgetsPorPor } from './ecra.js';

const CATALOGO = [
  { id: 'a', tamanhos: ['largo', 'pequeno'], deModulo: 'modA' },
  { id: 'b', tamanhos: ['pequeno'] },
  { id: 'c', tamanhos: ['pequeno', 'largo'], deModulo: 'modC' },
  { id: 'd', tamanhos: ['largo'], deModulo: 'modD' },
];
const INICIAL = { estrutura: 'grelha', widgets: [{ id: 'a', tamanho: 'largo' }, { id: 'b', tamanho: 'pequeno' }, { id: 'c', tamanho: 'pequeno' }] };
const ecra = { estrutura: 'grelha', widgets: [{ id: 'a', tamanho: 'largo' }, { id: 'b', tamanho: 'pequeno' }, { id: 'c', tamanho: 'pequeno' }] };

describe('normalizarEcra', () => {
  it('tira ids desconhecidos e repetidos, e corrige tamanhos que o widget não tem', () => {
    const r = normalizarEcra({ estrutura: 'lista', widgets: [{ id: 'a', tamanho: 'enorme' }, { id: 'zz', tamanho: 'largo' }, { id: 'a', tamanho: 'pequeno' }, null, { id: 'b', tamanho: 'pequeno' }] }, CATALOGO);
    expect(r).toEqual({ estrutura: 'lista', widgets: [{ id: 'a', tamanho: 'largo' }, { id: 'b', tamanho: 'pequeno' }] });
  });

  it('sem nada guardado dá uma grelha vazia, e uma estrutura desconhecida volta a grelha', () => {
    expect(normalizarEcra(undefined, CATALOGO)).toEqual({ estrutura: 'grelha', widgets: [] });
    expect(normalizarEcra({ estrutura: 'xpto', widgets: [] }, CATALOGO).estrutura).toBe('grelha');
  });
});

describe('ecraDosModulos', () => {
  it('sem escolhas antigas é o ecrã inicial', () => {
    expect(ecraDosModulos({}, CATALOGO, INICIAL)).toEqual(INICIAL);
  });

  it('respeita o que ela tinha desligado e ligado nos cartões antigos', () => {
    const r = ecraDosModulos({ modA: false, modD: true }, CATALOGO, INICIAL);
    expect(r.widgets.map((w) => w.id)).toEqual(['b', 'c', 'd']);
    expect(r.widgets[2].tamanho).toBe('largo');
  });
});

describe('edição', () => {
  it('tira um widget pelo índice e ignora índices fora da lista', () => {
    expect(tirarWidget(ecra, 1).widgets.map((w) => w.id)).toEqual(['a', 'c']);
    expect(tirarWidget(ecra, 9)).toBe(ecra);
  });

  it('muda para o tamanho seguinte e volta ao primeiro', () => {
    const um = mudarTamanho(ecra, 0, CATALOGO);
    expect(um.widgets[0].tamanho).toBe('pequeno');
    expect(mudarTamanho(um, 0, CATALOGO).widgets[0].tamanho).toBe('largo');
  });

  it('um widget com um só tamanho não muda', () => {
    expect(mudarTamanho(ecra, 1, CATALOGO)).toBe(ecra);
  });

  it('move um widget de um sítio para outro', () => {
    expect(moverWidget(ecra, 0, 2).widgets.map((w) => w.id)).toEqual(['b', 'c', 'a']);
    expect(moverWidget(ecra, 2, 0).widgets.map((w) => w.id)).toEqual(['c', 'a', 'b']);
    expect(moverWidget(ecra, 1, 1)).toBe(ecra);
  });

  it('junta no fim no primeiro tamanho e não repete', () => {
    const r = juntarWidget(ecra, 'd', CATALOGO);
    expect(r.widgets.at(-1)).toEqual({ id: 'd', tamanho: 'largo' });
    expect(juntarWidget(r, 'd', CATALOGO)).toBe(r);
    expect(juntarWidget(ecra, 'zz', CATALOGO)).toBe(ecra);
  });

  it('muda a estrutura só para uma que exista', () => {
    expect(mudarEstrutura(ecra, 'destaque').estrutura).toBe('destaque');
    expect(mudarEstrutura(ecra, 'xpto')).toBe(ecra);
  });

  it('a galeria mostra só o que ainda não está no ecrã', () => {
    expect(widgetsPorPor(ecra, CATALOGO).map((w) => w.id)).toEqual(['d']);
  });
});
