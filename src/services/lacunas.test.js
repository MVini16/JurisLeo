import { describe, it, expect } from 'vitest';
import { temLacunas, converterLacunas } from './lacunas.js';

describe('temLacunas', () => {
  it('reconhece as marcas {{ }}', () => {
    expect(temLacunas('O contrato é um {{negócio jurídico}}')).toBe(true);
    expect(temLacunas('sem marcas')).toBe(false);
    expect(temLacunas('{{ }}')).toBe(true);
    expect(temLacunas('{sozinha}')).toBe(false);
    expect(temLacunas(undefined)).toBe(false);
  });

  it('pode ser chamada várias vezes seguidas com o mesmo resultado', () => {
    for (let i = 0; i < 3; i++) expect(temLacunas('a {{b}} c')).toBe(true);
  });
});

describe('converterLacunas', () => {
  it('esconde a lacuna na frente e mostra tudo no verso', () => {
    expect(converterLacunas('O contrato é um {{negócio jurídico}} bilateral')).toEqual({
      frente: 'O contrato é um [...] bilateral',
      tras: 'O contrato é um negócio jurídico bilateral',
      escondidas: ['negócio jurídico'],
    });
  });

  it('aceita várias lacunas na mesma frase', () => {
    const r = converterLacunas('A {{capacidade}} pode ser de {{gozo}} ou de {{exercício}}');
    expect(r.frente).toBe('A [...] pode ser de [...] ou de [...]');
    expect(r.escondidas).toEqual(['capacidade', 'gozo', 'exercício']);
    expect(r.tras).toBe('A capacidade pode ser de gozo ou de exercício');
  });

  it('tira espaços dentro das marcas', () => {
    expect(converterLacunas('a {{  b  }} c').tras).toBe('a b c');
  });

  it('sem lacunas ou com uma lacuna vazia devolve nulo', () => {
    expect(converterLacunas('sem nada')).toBeNull();
    expect(converterLacunas('a {{ }} b')).toBeNull();
    expect(converterLacunas('')).toBeNull();
    expect(converterLacunas(null)).toBeNull();
  });
});
