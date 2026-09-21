import { describe, it, expect } from 'vitest';
import { epocasDoDia, naEpocaNormal } from './calendarioEscolar.js';

describe('epocasDoDia', () => {
  it('não encontra nenhuma época num dia normal de aulas', () => {
    expect(epocasDoDia(new Date(2026, 9, 15))).toEqual([]);
  });

  it('encontra as provas de avaliação contínua do 1.º semestre', () => {
    const epocas = epocasDoDia(new Date(2026, 11, 5));
    expect(epocas.map((e) => e.id)).toEqual(['provasAvaliacaoContinua']);
    expect(epocas[0].semestre).toBe(1);
  });

  it('encontra os exames escritos da época normal', () => {
    const epocas = epocasDoDia(new Date(2027, 0, 10));
    expect(epocas.map((e) => e.id)).toContain('escritosEpocaNormal');
  });

  it('marca a sobreposição entre coincidências de escritos e orais da época normal', () => {
    // 2027-01-22: dentro de escritosCoincidencia (21 a 27) e de oraisEpocaNormal (22 a 12/02)
    const epocas = epocasDoDia('2027-01-22');
    const ids = epocas.map((e) => e.id);
    expect(ids).toContain('escritosCoincidencia');
    expect(ids).toContain('oraisEpocaNormal');
  });

  it('marca as épocas de coincidência como previsíveis', () => {
    const epocas = epocasDoDia('2027-01-25');
    const coincidencia = epocas.find((e) => e.id === 'escritosCoincidencia');
    expect(coincidencia.previsivel).toBe(true);
  });

  it('aceita uma data em string aaaa-mm-dd', () => {
    expect(epocasDoDia('2027-02-16').map((e) => e.id)).toEqual(['recurso']);
  });
});

describe('naEpocaNormal', () => {
  it('é verdadeiro durante os exames escritos da época normal', () => {
    expect(naEpocaNormal('2027-01-10')).toBe(true);
  });

  it('é verdadeiro durante as orais da época normal', () => {
    expect(naEpocaNormal('2027-02-01')).toBe(true);
  });

  it('é falso durante o recurso', () => {
    expect(naEpocaNormal('2027-02-17')).toBe(false);
  });

  it('é falso durante as provas de avaliação contínua', () => {
    expect(naEpocaNormal('2026-12-05')).toBe(false);
  });

  it('é falso num dia normal de aulas', () => {
    expect(naEpocaNormal(new Date(2026, 9, 15))).toBe(false);
  });
});
