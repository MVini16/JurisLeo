import { describe, it, expect } from 'vitest';
import { flashcardsRevistosHoje, sumariosHoje, progressoMissoes, ALVOS } from './missoesDoDia.js';

const hoje = new Date(2026, 9, 5, 20, 0);
const hoje9h = new Date(2026, 9, 5, 9, 0);
const ontem = new Date(2026, 9, 4, 20, 0);

describe('flashcardsRevistosHoje', () => {
  it('conta só os com ultimaRevisaoEm hoje', () => {
    const flashcards = [{ ultimaRevisaoEm: hoje9h }, { ultimaRevisaoEm: ontem }, {}];
    expect(flashcardsRevistosHoje(flashcards, hoje)).toBe(1);
  });
});

describe('sumariosHoje', () => {
  it('conta só os atualizados hoje', () => {
    const sumarios = [{ atualizadoEm: hoje9h }, { atualizadoEm: ontem }];
    expect(sumariosHoje(sumarios, hoje)).toBe(1);
  });
});

describe('progressoMissoes', () => {
  it('marca cumprida quando atinge o alvo', () => {
    const sessoes = [{ inicio: hoje9h, minutos: ALVOS.minutos }];
    const flashcards = Array.from({ length: ALVOS.flashcards }, () => ({ ultimaRevisaoEm: hoje9h }));
    const sumarios = [{ atualizadoEm: hoje9h }];
    const progresso = progressoMissoes({ sessoes, flashcards, sumarios }, hoje);
    expect(progresso.minutos.cumprida).toBe(true);
    expect(progresso.flashcards.cumprida).toBe(true);
    expect(progresso.sumario.cumprida).toBe(true);
  });

  it('não marca cumprida sem chegar ao alvo', () => {
    const progresso = progressoMissoes({ sessoes: [], flashcards: [], sumarios: [] }, hoje);
    expect(progresso.minutos.cumprida).toBe(false);
    expect(progresso.minutos.feito).toBe(0);
  });
});
