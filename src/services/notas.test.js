import { describe, it, expect } from 'vitest';
import { normalizarPesos, pesosDaCadeira, estadoDaCadeira, resumoDoAno, lerNota, camposLancaveis } from './notas.js';

describe('normalizarPesos', () => {
  it('nunca deixa a prova escrita passar de 0,5', () => {
    expect(normalizarPesos({ provaEscrita: 0.8 })).toEqual({ provaEscrita: 0.5, outrosElementos: 0.5 });
  });
  it('completa os outros elementos até 1', () => {
    expect(normalizarPesos({ provaEscrita: 0.3 })).toEqual({ provaEscrita: 0.3, outrosElementos: 0.7 });
  });
  it('sem pesos usa 50/50', () => {
    expect(normalizarPesos(undefined)).toEqual({ provaEscrita: 0.5, outrosElementos: 0.5 });
  });
  it('nunca fica negativo', () => {
    expect(normalizarPesos({ provaEscrita: -1 }).provaEscrita).toBe(0);
  });
});

describe('pesosDaCadeira', () => {
  it('prefere os pesos guardados na cadeira aos de base', () => {
    expect(pesosDaCadeira({ pesos: { provaEscrita: 0.4 } }, { pesos: { provaEscrita: 0.5 } }).provaEscrita).toBe(0.4);
  });
  it('cai nos de base quando a cadeira não tem', () => {
    expect(pesosDaCadeira({}, { pesos: { provaEscrita: 0.3 } }).provaEscrita).toBe(0.3);
  });
});

describe('estadoDaCadeira', () => {
  const pesos = { provaEscrita: 0.5, outrosElementos: 0.5 };

  it('sem notas fica sem dados', () => {
    const { notaAC, resultado } = estadoDaCadeira({ metodo: 'A', avaliacaoDados: {}, pesos });
    expect(notaAC).toBeNull();
    expect(resultado.estado).toBe('semDados');
  });
  it('14 e 14 na contínua aprova com 14', () => {
    const { notaAC, resultado } = estadoDaCadeira({ metodo: 'A', avaliacaoDados: { provaEscrita: 14, outrosElementos: 14 }, pesos });
    expect(notaAC).toBe(14);
    expect(resultado.estado).toBe('aprovada');
    expect(resultado.notaFinal).toBe(14);
  });
  it('usa os pesos editados na conta da contínua', () => {
    // 10 na escrita (30%) e 16 nos outros (70%) = 14,2 → 14
    const { notaAC } = estadoDaCadeira({ metodo: 'A', avaliacaoDados: { provaEscrita: 10, outrosElementos: 16 }, pesos: { provaEscrita: 0.3 } });
    expect(notaAC).toBe(14);
  });
  it('método B só olha aos exames', () => {
    const { resultado } = estadoDaCadeira({ metodo: 'B', avaliacaoDados: { exameEscrito: 13 }, pesos });
    expect(resultado.estado).toBe('aprovada');
    expect(resultado.notaFinal).toBe(13);
  });
});

describe('resumoDoAno', () => {
  it('faz a média só das aprovadas, sem arredondar', () => {
    const r = resumoDoAno([
      { estado: 'aprovada', notaFinal: 14 },
      { estado: 'aprovada', notaFinal: 13 },
      { estado: 'admitidaEscrito', notaFinal: null },
    ]);
    expect(r.media).toBe(13.5);
    expect(r.aprovadas).toBe(2);
    expect(r.todasAprovadas).toBe(false);
    expect(r.escala).toBe('Bom'); // 13,5 arredonda para 14
  });
  it('o bónus vai à parte e só depende de fechar todas', () => {
    const r = resumoDoAno([{ estado: 'aprovada', notaFinal: 15 }, { estado: 'aprovada', notaFinal: 15 }]);
    expect(r.todasAprovadas).toBe(true);
    expect(r.media).toBe(15);
    expect(r.mediaComBonus).toBeCloseTo(15.6);
  });
  it('sem aprovadas não há média', () => {
    const r = resumoDoAno([{ estado: 'semDados', notaFinal: null }]);
    expect(r.media).toBeNull();
    expect(r.escala).toBeNull();
  });
});

describe('lerNota', () => {
  it('aceita inteiros de 0 a 20', () => {
    expect(lerNota('0')).toEqual({ ok: true, valor: 0 });
    expect(lerNota('20')).toEqual({ ok: true, valor: 20 });
  });
  it('vazio é null, não erro', () => {
    expect(lerNota('')).toEqual({ ok: true, valor: null });
  });
  it('recusa fora do intervalo e decimais', () => {
    expect(lerNota('21').ok).toBe(false);
    expect(lerNota('-1').ok).toBe(false);
    expect(lerNota('12.5').ok).toBe(false);
    expect(lerNota('abc').ok).toBe(false);
  });
});

describe('camposLancaveis', () => {
  it('método A inclui a contínua', () => {
    expect(camposLancaveis('A').map((c) => c.id)).toContain('provaEscrita');
  });
  it('método B não inclui a contínua', () => {
    expect(camposLancaveis('B').map((c) => c.id)).not.toContain('provaEscrita');
  });
});
