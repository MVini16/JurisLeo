import { describe, it, expect } from 'vitest';
import { gerarOcorrencias, idOcorrencia, tipoDaAula, comEstados, aulaAgoraESeguinte, paraMinutos } from './ocorrencias.js';

const aulaBase = {
  id: 'abc',
  titulo: 'DA I · Prática',
  diaSemana: 1, // segunda
  horaInicio: '17:10',
  horaFim: '18:00',
  cadeira: 'administrativo-1',
  sala: '12.34',
  dataInicio: new Date(2026, 8, 7),
  dataFim: new Date(2026, 11, 18),
  contaFalta: true,
};

describe('gerarOcorrencias', () => {
  it('gera uma por semana entre o início e o fim', () => {
    const o = gerarOcorrencias(aulaBase);
    expect(o[0].data.getDate()).toBe(7);
    expect(o[0].data.getMonth()).toBe(8);
    expect(o.every((x) => x.data.getDay() === 1)).toBe(true);
  });

  it('não gera aulas nos feriados nacionais', () => {
    // 5 de outubro de 2026 é uma segunda-feira e feriado
    const o = gerarOcorrencias(aulaBase);
    expect(o.some((x) => x.data.getMonth() === 9 && x.data.getDate() === 5)).toBe(false);
    // 7 de dezembro é segunda, 8 de dezembro (terça) é feriado — a segunda mantém-se
    expect(o.some((x) => x.data.getMonth() === 11 && x.data.getDate() === 7)).toBe(true);
  });

  it('pode incluir os feriados se pedido', () => {
    const o = gerarOcorrencias(aulaBase, { comFeriados: true });
    expect(o.some((x) => x.data.getMonth() === 9 && x.data.getDate() === 5)).toBe(true);
  });

  it('o id é estável para a mesma aula no mesmo dia', () => {
    const o = gerarOcorrencias(aulaBase);
    expect(o[0].ocorrenciaId).toBe('abc_2026-09-07');
    expect(idOcorrencia('abc', new Date(2026, 8, 7, 15, 0))).toBe('abc_2026-09-07');
  });

  it('sem datas não gera nada', () => {
    expect(gerarOcorrencias({ ...aulaBase, dataInicio: null })).toEqual([]);
  });

  it('lê timestamps do firestore (objeto com toDate)', () => {
    const ts = (d) => ({ toDate: () => d });
    const o = gerarOcorrencias({ ...aulaBase, dataInicio: ts(aulaBase.dataInicio), dataFim: ts(aulaBase.dataFim) });
    expect(o.length).toBeGreaterThan(10);
  });
});

describe('tipoDaAula', () => {
  it('conta falta significa prática', () => {
    expect(tipoDaAula({ contaFalta: true })).toBe('pratica');
    expect(tipoDaAula({ contaFalta: false })).toBe('teorica');
  });
  it('o tipo explícito manda', () => {
    expect(tipoDaAula({ tipoAula: 'teorica', contaFalta: true })).toBe('teorica');
  });
});

describe('comEstados', () => {
  it('por defeito fica por marcar', () => {
    const o = comEstados([{ ocorrenciaId: 'x' }], {});
    expect(o[0].estadoAula).toBe('porMarcar');
  });
  it('junta o estado marcado', () => {
    const o = comEstados([{ ocorrenciaId: 'x' }], { x: { estado: 'faltei' } });
    expect(o[0].estadoAula).toBe('faltei');
  });
});

describe('aulaAgoraESeguinte', () => {
  const hoje = [
    { id: 'a', horaInicio: '14:00', horaFim: '14:50' },
    { id: 'b', horaInicio: '15:00', horaFim: '15:50' },
    { id: 'c', horaInicio: '16:10', horaFim: '17:00' },
  ];

  it('durante uma aula devolve essa e a seguinte', () => {
    const r = aulaAgoraESeguinte(hoje, new Date(2026, 8, 7, 15, 20));
    expect(r.emCurso.id).toBe('b');
    expect(r.seguinte.id).toBe('c');
  });

  it('no intervalo não há aula em curso, só a seguinte', () => {
    const r = aulaAgoraESeguinte(hoje, new Date(2026, 8, 7, 16, 0));
    expect(r.emCurso).toBeNull();
    expect(r.seguinte.id).toBe('c');
  });

  it('depois da última não há nada', () => {
    const r = aulaAgoraESeguinte(hoje, new Date(2026, 8, 7, 19, 0));
    expect(r.emCurso).toBeNull();
    expect(r.seguinte).toBeNull();
  });

  it('antes da primeira só há seguinte', () => {
    const r = aulaAgoraESeguinte(hoje, new Date(2026, 8, 7, 9, 0));
    expect(r.emCurso).toBeNull();
    expect(r.seguinte.id).toBe('a');
  });
});

describe('paraMinutos', () => {
  it('converte hh:mm', () => {
    expect(paraMinutos('14:30')).toBe(870);
    expect(paraMinutos('')).toBeNull();
  });
});
