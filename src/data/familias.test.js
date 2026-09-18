import { describe, it, expect } from 'vitest';
import { familiaDoEvento, corDoEvento, FAMILIAS } from './familias.js';

describe('familiaDoEvento', () => {
  it('sem família é da faculdade', () => {
    expect(familiaDoEvento({})).toBe('faculdade');
    expect(familiaDoEvento(undefined)).toBe('faculdade');
  });
  it('reconhece as famílias conhecidas', () => {
    expect(familiaDoEvento({ familia: 'ferias' })).toBe('ferias');
    expect(familiaDoEvento({ familia: 'saude' })).toBe('saude');
  });
  it('família desconhecida cai na faculdade', () => {
    expect(familiaDoEvento({ familia: 'outra' })).toBe('faculdade');
  });
});

describe('corDoEvento', () => {
  it('faculdade usa a cor da cadeira', () => {
    expect(corDoEvento({ cadeira: 'administrativo-1' })).toBe('#1F3A5F');
  });
  it('faculdade sem cadeira usa o dourado', () => {
    expect(corDoEvento({})).toBe('var(--gold)');
  });
  it('as outras famílias têm cor própria, mesmo com cadeira', () => {
    expect(corDoEvento({ familia: 'social', cadeira: 'familia' })).toBe('var(--familia-social)');
  });
});

describe('FAMILIAS', () => {
  it('são quatro', () => {
    expect(FAMILIAS).toHaveLength(4);
  });
});
