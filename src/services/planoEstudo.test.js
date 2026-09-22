import { describe, it, expect } from 'vitest';
import { diasAteDomingo, provasPorUrgencia, propostaDaSemana, proximaCadeira } from './planoEstudo.js';

// segunda-feira, 5 de outubro de 2026
const segunda = new Date(2026, 9, 5, 10);
const domingo = new Date(2026, 9, 4, 10);
const sabado = new Date(2026, 9, 3, 10);

describe('diasAteDomingo', () => {
  it('de segunda, dá os 7 dias até domingo', () => {
    const dias = diasAteDomingo(segunda);
    expect(dias).toHaveLength(7);
    expect(dias[0].getDay()).toBe(1);
    expect(dias[6].getDay()).toBe(0);
  });

  it('de domingo, dá só hoje', () => {
    expect(diasAteDomingo(domingo)).toHaveLength(1);
  });

  it('de sábado, dá sábado e domingo', () => {
    const dias = diasAteDomingo(sabado);
    expect(dias).toHaveLength(2);
    expect(dias[1].getDay()).toBe(0);
  });
});

describe('provasPorUrgencia', () => {
  it('só uma por cadeira — a mais próxima', () => {
    const eventos = [
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'Freq. tardia', data: new Date(2026, 9, 20) },
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'Freq. próxima', data: new Date(2026, 9, 8) },
      { tipo: 'exame', cadeira: 'DO I', titulo: 'Exame DO', data: new Date(2026, 9, 10) },
    ];
    const provas = provasPorUrgencia(eventos, segunda);
    expect(provas).toHaveLength(2);
    expect(provas[0].titulo).toBe('Freq. próxima');
  });

  it('ignora provas passadas e canceladas', () => {
    const eventos = [
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'Passada', data: new Date(2026, 9, 1) },
      { tipo: 'frequencia', cadeira: 'DO I', titulo: 'Cancelada', data: new Date(2026, 9, 8), estado: 'cancelado' },
    ];
    expect(provasPorUrgencia(eventos, segunda)).toEqual([]);
  });
});

describe('propostaDaSemana', () => {
  it('sem provas, não propõe nada', () => {
    expect(propostaDaSemana([], segunda)).toEqual([]);
  });

  it('propõe uma cadeira por dia, ciclando pelas provas mais urgentes primeiro', () => {
    const eventos = [
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'Freq. DA I', data: new Date(2026, 9, 7) },
      { tipo: 'frequencia', cadeira: 'DO I', titulo: 'Freq. DO I', data: new Date(2026, 9, 15) },
    ];
    const plano = propostaDaSemana(eventos, segunda);
    expect(plano).toHaveLength(7);
    expect(plano[0].cadeiraId).toBe('DA I');
    expect(plano[1].cadeiraId).toBe('DO I');
    expect(plano[0].motivo).toContain('DA I');
  });
});

describe('proximaCadeira', () => {
  it('roda para a cadeira seguinte na lista de urgência', () => {
    const eventos = [
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'a', data: new Date(2026, 9, 7) },
      { tipo: 'frequencia', cadeira: 'DO I', titulo: 'b', data: new Date(2026, 9, 15) },
    ];
    expect(proximaCadeira('DA I', eventos, segunda)).toBe('DO I');
    expect(proximaCadeira('DO I', eventos, segunda)).toBe('DA I');
  });

  it('com só uma cadeira, não muda', () => {
    const eventos = [{ tipo: 'frequencia', cadeira: 'DA I', titulo: 'a', data: new Date(2026, 9, 7) }];
    expect(proximaCadeira('DA I', eventos, segunda)).toBe('DA I');
  });
});
