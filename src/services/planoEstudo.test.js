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
    // DA I (2 dias) é bem mais urgente que DO I (10 dias) — tem de aparecer mais vezes
    const vezesDAI = plano.filter((d) => d.cadeiraId === 'DA I').length;
    const vezesDOI = plano.filter((d) => d.cadeiraId === 'DO I').length;
    expect(vezesDAI).toBeGreaterThan(vezesDOI);
    expect(vezesDAI + vezesDOI).toBe(7);
    expect(plano[0].cadeiraId).toBe('DA I');
    expect(plano[0].motivo).toContain('DA I');
  });

  it('conta hoje mesmo, tal como proximaProva — não perde a prova de hoje ao meio da tarde', () => {
    const tardeDeSegunda = new Date(2026, 9, 5, 15, 30);
    const eventos = [{ tipo: 'frequencia', cadeira: 'DA I', titulo: 'Freq. DA I', data: new Date(2026, 9, 5) }]; // hoje, meia-noite
    const plano = propostaDaSemana(eventos, tardeDeSegunda);
    expect(plano).toHaveLength(7);
    expect(plano[0].cadeiraId).toBe('DA I');
    expect(plano[0].motivo).toContain('é hoje');
  });

  it('com pesos iguais (provas igualmente urgentes), reparte por igual', () => {
    const eventos = [
      { tipo: 'frequencia', cadeira: 'DA I', titulo: 'a', data: new Date(2026, 9, 10) },
      { tipo: 'frequencia', cadeira: 'DO I', titulo: 'b', data: new Date(2026, 9, 10) },
    ];
    const plano = propostaDaSemana(eventos, segunda);
    const vezesDAI = plano.filter((d) => d.cadeiraId === 'DA I').length;
    const vezesDOI = plano.filter((d) => d.cadeiraId === 'DO I').length;
    expect(Math.abs(vezesDAI - vezesDOI)).toBeLessThanOrEqual(1);
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
