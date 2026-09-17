import { describe, it, expect } from 'vitest';
import { avaliarCadeira, arredondar, escalaQualitativa, calcularMediaAnual } from './avaliacao.js';

describe('arredondar', () => {
  it('arredonda 0,5 sempre para cima', () => {
    expect(arredondar(9.5)).toBe(10);
    expect(arredondar(12.5)).toBe(13);
    expect(arredondar(12.4)).toBe(12);
  });
});

// tabela de casos de teste obrigatórios da especificação (secção 6.5)
describe('avaliarCadeira', () => {
  const casos = [
    { n: 1, metodo: 'A', notaAC: 14, estado: 'aprovada', notaFinal: 14 },
    { n: 2, metodo: 'A', notaAC: 12, estado: 'aprovada', notaFinal: 12 },
    { n: 3, metodo: 'A', notaAC: 11, estado: 'admitidaEscrito', notaFinal: null },
    { n: 4, metodo: 'A', notaAC: 10, estado: 'admitidaEscrito', notaFinal: null },
    { n: 5, metodo: 'A', notaAC: 9, estado: 'passaMetodoB', notaFinal: 9, podeReinscricao: true },
    { n: 6, metodo: 'A', notaAC: 8, estado: 'passaMetodoB', notaFinal: 8, podeReinscricao: true },
    { n: 7, metodo: 'A', notaAC: 7, estado: 'passaMetodoB', notaFinal: 7, podeReinscricao: false },
    { n: 8, metodo: 'A', notaAC: 11, exameEscrito: 14, estado: 'aprovada', notaFinal: 13 },
    { n: 9, metodo: 'A', notaAC: 10, exameEscrito: 10, estado: 'aprovada', notaFinal: 10 },
    { n: 10, metodo: 'A', notaAC: 11, exameEscrito: 7, estado: 'excluida', notaFinal: 7 },
    { n: 11, metodo: 'A', notaAC: 10, exameEscrito: 8, estado: 'admitidaOral', notaFinal: null, notaEntradaOral: 9 },
    { n: 12, metodo: 'A', notaAC: 11, exameEscrito: 9, estado: 'admitidaOral', notaFinal: null, notaEntradaOral: 10 },
    { n: 13, metodo: 'B', exameEscrito: 12, estado: 'aprovada', notaFinal: 12 },
    { n: 14, metodo: 'B', exameEscrito: 16, estado: 'aprovada', notaFinal: 16 },
    { n: 15, metodo: 'B', exameEscrito: 11, estado: 'admitidaOral', notaFinal: null, notaEntradaOral: 11 },
    { n: 16, metodo: 'B', exameEscrito: 8, estado: 'admitidaOral', notaFinal: null, notaEntradaOral: 8 },
    { n: 17, metodo: 'B', exameEscrito: 7, estado: 'excluida', notaFinal: 7 },
    { n: 18, metodo: 'B', exameEscrito: 3, estado: 'excluida', notaFinal: 3 },
    { n: 19, metodo: 'B', exameEscrito: 10, exameOral: 14, estado: 'aprovada', notaFinal: 14 },
    { n: 20, metodo: 'B', exameEscrito: 11, exameOral: 10, estado: 'aprovada', notaFinal: 11 },
    { n: 21, metodo: 'B', exameEscrito: 8, exameOral: 10, estado: 'aprovada', notaFinal: 10 },
    { n: 22, metodo: 'B', exameEscrito: 8, exameOral: 9, estado: 'excluida', notaFinal: 9 },
    { n: 23, metodo: 'B', exameEscrito: 10, exameOral: 8, estado: 'excluida', notaFinal: 9 },
    { n: 24, metodo: 'A', notaAC: 10, exameEscrito: 8, exameOral: 12, estado: 'aprovada', notaFinal: 12 },
    // caso 25: caso limite da própria especificação — a tabela original diz "excluida"/10,
    // mas o texto que a acompanha resolve a ambiguidade a favor de "aprovada"/10, usando a
    // média arredondada (9,5 → 10) como critério de aprovação. implementado assim; confirmar
    // com o vini se esta leitura do regulamento está correcta.
    { n: 25, metodo: 'A', notaAC: 11, exameEscrito: 9, exameOral: 9, estado: 'aprovada', notaFinal: 10 },
  ];

  for (const caso of casos) {
    it(`caso ${caso.n}: método ${caso.metodo}, AC=${caso.notaAC ?? '—'}, escrito=${caso.exameEscrito ?? '—'}, oral=${caso.exameOral ?? '—'} → ${caso.estado}`, () => {
      const resultado = avaliarCadeira(caso);
      expect(resultado.estado).toBe(caso.estado);
      expect(resultado.notaFinal).toBe(caso.notaFinal);
      if (caso.notaEntradaOral != null) {
        expect(resultado.notaEntradaOral).toBe(caso.notaEntradaOral);
      }
      if (caso.podeReinscricao != null) {
        expect(resultado.podeRequererReinscricaoMetodoA).toBe(caso.podeReinscricao);
      }
    });
  }
});

describe('escalaQualitativa', () => {
  it('classifica corretamente cada faixa', () => {
    expect(escalaQualitativa(9)).toBe(null);
    expect(escalaQualitativa(10)).toBe('Suficiente');
    expect(escalaQualitativa(13)).toBe('Suficiente');
    expect(escalaQualitativa(14)).toBe('Bom');
    expect(escalaQualitativa(15)).toBe('Bom');
    expect(escalaQualitativa(16)).toBe('Muito Bom');
    expect(escalaQualitativa(17)).toBe('Muito Bom');
    expect(escalaQualitativa(18)).toBe('Excelente');
    expect(escalaQualitativa(20)).toBe('Excelente');
  });
});

describe('calcularMediaAnual', () => {
  it('faz a média simples sem bónus', () => {
    expect(calcularMediaAnual([12, 14, 16], false)).toBeCloseTo(14, 5);
  });
  it('acrescenta 0,6 quando conclui tudo no ano', () => {
    expect(calcularMediaAnual([12, 14, 16], true)).toBeCloseTo(14.6, 5);
  });
});
