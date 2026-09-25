import { describe, it, expect } from 'vitest';
import { contagemFrequencias, proximaPratica, linhaDoDia, horaDeMinutos, dominioPorCadeira, dominioMedio, anotacaoDeHaUmMes, resumoDaSemana } from './widgets.js';

const HOJE = new Date(2026, 8, 25, 15, 32); // sexta, 25 de setembro de 2026, 15:32
const JANELA = { inicio: '2026-11-30', fim: '2026-12-18' };
const aula = (horaInicio, horaFim, tipoAula = 'teorica', extra = {}) => ({ horaInicio, horaFim, tipoAula, cadeira: 'x', ...extra });

describe('contagemFrequencias', () => {
  it('sem provas marcadas conta os dias de calendário até à janela', () => {
    const r = contagemFrequencias([], JANELA, HOJE);
    expect(r).toMatchObject({ origem: 'janela', dias: 66 });
    expect(r.fracao).toBe(0);
  });

  it('com uma prova marcada usa a prova, e conta por dias de calendário, não por blocos de 24 h', () => {
    const eventos = [{ tipo: 'frequencia', titulo: 'Freq. DO', data: new Date(2026, 8, 26, 9) }];
    const r = contagemFrequencias(eventos, JANELA, HOJE);
    expect(r).toMatchObject({ origem: 'prova', dias: 1, titulo: 'Freq. DO' });
  });

  it('o anel enche à medida que a prova se aproxima', () => {
    const perto = contagemFrequencias([{ tipo: 'frequencia', data: new Date(2026, 8, 27, 9) }], JANELA, HOJE);
    const longe = contagemFrequencias([{ tipo: 'frequencia', data: new Date(2026, 10, 1, 9) }], JANELA, HOJE);
    expect(perto.fracao).toBeGreaterThan(longe.fracao);
  });

  it('ignora provas canceladas e, depois da janela começar, sem provas não há contagem', () => {
    expect(contagemFrequencias([{ tipo: 'frequencia', data: new Date(2026, 8, 26), estado: 'cancelado' }], JANELA, HOJE).origem).toBe('janela');
    expect(contagemFrequencias([], JANELA, new Date(2026, 11, 1))).toBeNull();
  });
});

describe('proximaPratica', () => {
  it('encontra a prática que começa na próxima hora', () => {
    const r = proximaPratica([aula('15:00', '15:50'), aula('16:10', '17:00', 'pratica')], HOJE);
    expect(r.faltam).toBe(38);
  });

  it('não conta teóricas, práticas já começadas, canceladas nem as que estão longe', () => {
    expect(proximaPratica([aula('16:10', '17:00')], HOJE)).toBeNull();
    expect(proximaPratica([aula('15:00', '15:50', 'pratica')], HOJE)).toBeNull();
    expect(proximaPratica([aula('16:10', '17:00', 'pratica', { estadoAula: 'cancelada' })], HOJE)).toBeNull();
    expect(proximaPratica([aula('17:10', '18:00', 'pratica')], HOJE)).toBeNull();
  });
});

describe('linhaDoDia', () => {
  it('põe as aulas numa linha e encontra o furo do intervalo', () => {
    const r = linhaDoDia([aula('16:10', '17:00'), aula('14:00', '14:50'), aula('15:00', '15:50'), aula('17:10', '18:00')]);
    expect(horaDeMinutos(r.inicio)).toBe('14:00');
    expect(horaDeMinutos(r.fim)).toBe('18:00');
    expect(r.blocos[0].esquerda).toBe(0);
    expect(r.furos).toHaveLength(3);
    expect(r.furos[1]).toMatchObject({ minutos: 20, inicio: 950, fim: 970 });
  });

  it('com o mínimo de 15 minutos só fica o intervalo grande', () => {
    expect(linhaDoDia([aula('14:00', '14:50'), aula('15:00', '15:50'), aula('16:10', '17:00')], 15).furos).toHaveLength(1);
  });

  it('sem aulas não há linha', () => {
    expect(linhaDoDia([])).toBeNull();
  });
});

describe('domínio', () => {
  const cartoes = [
    { cadeiraId: 'a', ultimaConfianca: 5 }, { cadeiraId: 'a', ultimaConfianca: 3 },
    { cadeiraId: 'b', ultimaConfianca: 1 }, { cadeiraId: 'b' }, { ultimaConfianca: 4 },
  ];

  it('calcula a percentagem por cadeira só com cartões já revistos', () => {
    expect(dominioPorCadeira(cartoes)).toEqual([
      { cadeiraId: 'a', cartoes: 2, percentagem: 75 },
      { cadeiraId: 'b', cartoes: 1, percentagem: 0 },
    ]);
  });

  it('a média dá o mesmo peso a cada cadeira, e sem dados é null', () => {
    expect(dominioMedio(dominioPorCadeira(cartoes))).toBe(38);
    expect(dominioMedio([])).toBeNull();
  });
});

describe('anotacaoDeHaUmMes', () => {
  it('escolhe a anotação mais perto de 30 dias atrás', () => {
    const anotacoes = [
      { titulo: 'ontem', criadoEm: new Date(2026, 8, 24) },
      { titulo: '29 dias', criadoEm: new Date(2026, 7, 27) },
      { titulo: '30 dias', criadoEm: { toDate: () => new Date(2026, 7, 26) } },
    ];
    expect(anotacaoDeHaUmMes(anotacoes, HOJE).anotacao.titulo).toBe('30 dias');
  });

  it('sem nada nessa altura devolve null', () => {
    expect(anotacaoDeHaUmMes([{ criadoEm: new Date(2026, 8, 20) }, {}], HOJE)).toBeNull();
  });
});

describe('resumoDaSemana', () => {
  it('soma os minutos de segunda a domingo e conta cartões e sumários desta semana', () => {
    const r = resumoDaSemana({
      sessoes: [{ inicio: new Date(2026, 8, 21, 10), minutos: 60 }, { inicio: new Date(2026, 8, 25, 10), minutos: 30 }, { inicio: new Date(2026, 8, 20, 10), minutos: 90 }],
      flashcards: [{ ultimaRevisaoEm: new Date(2026, 8, 22) }, { ultimaRevisaoEm: new Date(2026, 8, 10) }],
      sumarios: [{ atualizadoEm: new Date(2026, 8, 23) }],
    }, HOJE);
    expect(r).toMatchObject({ minutos: 90, cartoes: 1, sumarios: 1, hojeIndice: 4 });
    expect(r.porDia).toEqual([60, 0, 0, 0, 30, 0, 0]);
  });
});
