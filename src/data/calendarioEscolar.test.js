import { describe, it, expect } from 'vitest';
import { epocasDoDia, naEpocaNormal, calendarioEscolar } from './calendarioEscolar.js';

describe('epocasDoDia', () => {
  it('um dia de aulas normal não tem época', () => {
    expect(epocasDoDia('2026-10-14')).toEqual([]);
  });

  it('30 de novembro é o primeiro dia das provas de avaliação contínua', () => {
    expect(epocasDoDia('2026-11-30').map((e) => e.id)).toContain('provasAvaliacaoContinua');
    expect(epocasDoDia('2026-11-29')).toEqual([]);
  });

  it('as pontas dos intervalos contam', () => {
    expect(epocasDoDia('2027-01-04').map((e) => e.id)).toContain('escritosEpocaNormal');
    expect(epocasDoDia('2027-01-19').map((e) => e.id)).toContain('escritosEpocaNormal');
    expect(epocasDoDia('2027-01-20')).toEqual([]);
  });

  it('um dia pode estar em duas épocas (escritos de coincidência e orais)', () => {
    const ids = epocasDoDia('2027-01-22').map((e) => e.id);
    expect(ids).toContain('escritosCoincidencia');
    expect(ids).toContain('oraisEpocaNormal');
  });

  it('marca como previsíveis as épocas de coincidência', () => {
    expect(epocasDoDia('2027-01-21').find((e) => e.id === 'escritosCoincidencia').previsivel).toBe(true);
    expect(epocasDoDia('2027-01-05').find((e) => e.id === 'escritosEpocaNormal').previsivel).toBe(false);
  });
});

describe('naEpocaNormal', () => {
  it('é verdade nos escritos e nas orais da época normal', () => {
    expect(naEpocaNormal('2027-01-10')).toBe(true);
    expect(naEpocaNormal('2027-02-05')).toBe(true);
  });

  it('é falso nas aulas, no recurso e nas coincidências', () => {
    expect(naEpocaNormal('2026-10-14')).toBe(false);
    expect(naEpocaNormal('2027-02-16')).toBe(false);
    expect(naEpocaNormal('2027-02-23')).toBe(false);
  });
});

describe('dados', () => {
  it('as datas batem com o despacho 54/2026', () => {
    expect(calendarioEscolar.semestres[0].aulas.fim).toBe('2026-12-18');
    expect(calendarioEscolar.semestres[1].exames.recurso.fim).toBe('2027-07-23');
  });
});
