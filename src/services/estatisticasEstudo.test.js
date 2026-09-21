import { describe, it, expect } from 'vitest';
import { minutosPorDia, sequenciaAtual, nivelDoDia, mapaDeCalor, minutosDaSemana, minutosPorCadeira, textoDuracao } from './estatisticasEstudo.js';

// quarta-feira, 23 de setembro de 2026, ao meio-dia
const HOJE = new Date(2026, 8, 23, 12);
const sessao = (chave, minutos, cadeiraId = 'x') => {
  const [a, m, d] = chave.split('-').map(Number);
  return { inicio: new Date(a, m - 1, d, 10), minutos, cadeiraId };
};

describe('minutosPorDia', () => {
  it('soma as sessões do mesmo dia, em hora local', () => {
    const mapa = minutosPorDia([sessao('2026-09-22', 30), sessao('2026-09-22', 20), sessao('2026-09-21', 10)]);
    expect(mapa).toEqual({ '2026-09-22': 50, '2026-09-21': 10 });
  });

  it('ignora sessões sem minutos ou sem data', () => {
    expect(minutosPorDia([{ inicio: new Date(), minutos: 0 }, { minutos: 30 }])).toEqual({});
  });

  it('aceita timestamps do firestore', () => {
    const ts = { toDate: () => new Date(2026, 8, 22, 9) };
    expect(minutosPorDia([{ inicio: ts, minutos: 15 }])).toEqual({ '2026-09-22': 15 });
  });
});

describe('sequenciaAtual', () => {
  it('sem estudo é zero', () => {
    expect(sequenciaAtual({}, HOJE)).toEqual({ dias: 0, descansosUsados: 0 });
  });

  it('conta dias seguidos até hoje', () => {
    const mapa = { '2026-09-23': 10, '2026-09-22': 10, '2026-09-21': 10 };
    expect(sequenciaAtual(mapa, HOJE).dias).toBe(3);
  });

  it('hoje ainda sem estudo não quebra a série', () => {
    const mapa = { '2026-09-22': 10, '2026-09-21': 10 };
    expect(sequenciaAtual(mapa, HOJE).dias).toBe(2);
  });

  it('um dia de descanso por semana não quebra a série nem soma', () => {
    // estudou seg 21 e ter 22... e dom 20 foi descanso, sáb 19 estudou
    const mapa = { '2026-09-23': 10, '2026-09-22': 10, '2026-09-21': 10, '2026-09-19': 10 };
    expect(sequenciaAtual(mapa, HOJE)).toEqual({ dias: 4, descansosUsados: 1 });
  });

  it('dois dias sem estudar na mesma semana quebram a série', () => {
    // sáb 19 e dom 20 pertencem à mesma semana (seg 14 a dom 20): só um pode ser descanso
    const mapa = { '2026-09-23': 10, '2026-09-22': 10, '2026-09-21': 10, '2026-09-18': 10 };
    expect(sequenciaAtual(mapa, HOJE).dias).toBe(3);
  });

  it('um descanso em cada semana diferente mantém a série', () => {
    // dom 20 (semana anterior) e seg 21 (esta semana) são descansos de semanas diferentes
    const mapa = { '2026-09-23': 10, '2026-09-22': 10, '2026-09-19': 10, '2026-09-18': 10 };
    expect(sequenciaAtual(mapa, HOJE)).toEqual({ dias: 4, descansosUsados: 2 });
  });

  it('descansos antes do primeiro dia estudado não contam', () => {
    const mapa = { '2026-09-23': 10 };
    expect(sequenciaAtual(mapa, HOJE)).toEqual({ dias: 1, descansosUsados: 0 });
  });
});

describe('nivelDoDia', () => {
  it('sobe com os minutos', () => {
    expect([0, 10, 30, 60, 120, 300].map(nivelDoDia)).toEqual([0, 1, 2, 3, 4, 4]);
  });
});

describe('mapaDeCalor', () => {
  it('tem o número certo de semanas e 7 dias cada, de segunda a domingo', () => {
    const mapa = mapaDeCalor({}, HOJE, 12);
    expect(mapa).toHaveLength(12);
    expect(mapa.every((s) => s.length === 7)).toBe(true);
    expect(mapa[11][0].chave).toBe('2026-09-21'); // segunda desta semana
    expect(mapa[11][6].chave).toBe('2026-09-27');
  });

  it('marca os dias que ainda não chegaram como futuros', () => {
    const semana = mapaDeCalor({}, HOJE, 1)[0];
    expect(semana.map((d) => d.futuro)).toEqual([false, false, false, true, true, true, true]);
  });

  it('põe os minutos e o nível em cada dia', () => {
    const semana = mapaDeCalor({ '2026-09-22': 65 }, HOJE, 1)[0];
    expect(semana[1]).toMatchObject({ chave: '2026-09-22', minutos: 65, nivel: 3 });
  });
});

describe('minutosDaSemana', () => {
  it('soma de segunda até hoje', () => {
    expect(minutosDaSemana({ '2026-09-21': 30, '2026-09-23': 45, '2026-09-20': 99 }, HOJE)).toBe(75);
  });
});

describe('minutosPorCadeira', () => {
  it('ordena do que mais estudou para o que menos', () => {
    const r = minutosPorCadeira([sessao('2026-09-22', 20, 'a'), sessao('2026-09-22', 50, 'b'), sessao('2026-09-21', 10, 'a')]);
    expect(r).toEqual([{ cadeiraId: 'b', minutos: 50 }, { cadeiraId: 'a', minutos: 30 }]);
  });

  it('filtra por data e agrupa sessões sem cadeira', () => {
    const r = minutosPorCadeira([sessao('2026-08-01', 40, 'a'), { inicio: new Date(2026, 8, 22), minutos: 10, cadeiraId: null }], new Date(2026, 8, 1));
    expect(r).toEqual([{ cadeiraId: 'semCadeira', minutos: 10 }]);
  });
});

describe('textoDuracao', () => {
  it('escreve horas e minutos', () => {
    expect(textoDuracao(0)).toBe('0 min');
    expect(textoDuracao(45)).toBe('45 min');
    expect(textoDuracao(60)).toBe('1 h');
    expect(textoDuracao(150)).toBe('2 h 30');
    expect(textoDuracao(125)).toBe('2 h 05');
  });
});
