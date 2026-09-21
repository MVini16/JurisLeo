import { describe, it, expect } from 'vitest';
import { calcularPrazo, ehDiaUtil, proximoDiaUtil, diasUteisEntre, explicarPrazo, PRAZOS_PREDEFINIDOS } from './prazos.js';
import { chaveData } from '../data/feriados.js';

// quarta-feira, 23 de setembro de 2026
const QUA = new Date(2026, 8, 23, 12);
const k = (r) => chaveData(r.fim);

describe('ehDiaUtil', () => {
  it('fins de semana e feriados não são úteis', () => {
    expect(ehDiaUtil(new Date(2026, 8, 26))).toBe(false); // sábado
    expect(ehDiaUtil(new Date(2026, 8, 27))).toBe(false); // domingo
    expect(ehDiaUtil(new Date(2026, 9, 5))).toBe(false); // 5 de outubro, feriado
    expect(ehDiaUtil(new Date(2026, 8, 23))).toBe(true);
  });
});

describe('proximoDiaUtil', () => {
  it('o próprio dia se for útil, senão o seguinte', () => {
    expect(chaveData(proximoDiaUtil(QUA))).toBe('2026-09-23');
    expect(chaveData(proximoDiaUtil(new Date(2026, 8, 26)))).toBe('2026-09-28');
  });
});

describe('calcularPrazo em dias úteis', () => {
  it('2 dias úteis a partir de quarta acaba na sexta', () => {
    expect(k(calcularPrazo(QUA, 2))).toBe('2026-09-25');
  });

  it('3 dias úteis a partir de quarta salta o fim de semana', () => {
    const r = calcularPrazo(QUA, 3);
    expect(k(r)).toBe('2026-09-28');
    expect(r.saltados.map((s) => s.motivo)).toEqual(['sábado', 'domingo']);
  });

  it('salta feriados: 1 dia útil depois de sexta 2 de outubro é terça 6 (segunda 5 é feriado)', () => {
    const r = calcularPrazo(new Date(2026, 9, 2, 12), 1);
    expect(k(r)).toBe('2026-10-06');
    expect(r.saltados.map((s) => s.motivo)).toContain('Implantação da República');
  });

  it('0 dias devolve o próprio dia', () => {
    expect(k(calcularPrazo(QUA, 0))).toBe('2026-09-23');
  });

  it('não muda a data que recebe', () => {
    const inicio = new Date(2026, 8, 23, 12);
    calcularPrazo(inicio, 10);
    expect(chaveData(inicio)).toBe('2026-09-23');
  });
});

describe('calcularPrazo em dias seguidos', () => {
  it('conta todos os dias', () => {
    expect(k(calcularPrazo(QUA, 7, { tipo: 'seguidos' }))).toBe('2026-09-30');
  });

  it('por defeito acaba mesmo num sábado', () => {
    expect(k(calcularPrazo(QUA, 3, { tipo: 'seguidos' }))).toBe('2026-09-26');
  });

  it('com a opção, passa para o dia útil seguinte', () => {
    const r = calcularPrazo(QUA, 3, { tipo: 'seguidos', passaParaUtil: true });
    expect(k(r)).toBe('2026-09-28');
    expect(r.passouParaUtil).toBe(true);
    expect(r.motivoPassagem).toBe('sábado');
  });

  it('a opção não mexe num prazo que já acaba num dia útil', () => {
    const r = calcularPrazo(QUA, 2, { tipo: 'seguidos', passaParaUtil: true });
    expect(k(r)).toBe('2026-09-25');
    expect(r.passouParaUtil).toBe(false);
  });
});

describe('diasUteisEntre', () => {
  it('conta sem o início e com o fim', () => {
    expect(diasUteisEntre(QUA, new Date(2026, 8, 28, 12))).toBe(3);
    expect(diasUteisEntre(QUA, QUA)).toBe(0);
  });
});

describe('explicarPrazo', () => {
  it('explica o que ficou de fora', () => {
    const frases = explicarPrazo(calcularPrazo(QUA, 3));
    expect(frases[0]).toMatch(/não conta/);
    expect(frases[1]).toMatch(/2 dias de fim de semana/);
  });

  it('nomeia o feriado', () => {
    const frases = explicarPrazo(calcularPrazo(new Date(2026, 9, 2, 12), 1));
    expect(frases.join(' ')).toMatch(/Implantação da República/);
  });
});

describe('prazos predefinidos', () => {
  it('só os que estão no regulamento, cada um com a fonte', () => {
    expect(PRAZOS_PREDEFINIDOS.map((p) => p.id)).toEqual(['recurso-nota', 'comprovativo']);
    expect(PRAZOS_PREDEFINIDOS.every((p) => p.fonte)).toBe(true);
    expect(PRAZOS_PREDEFINIDOS[0]).toMatchObject({ dias: 2, tipo: 'uteis' });
  });
});
