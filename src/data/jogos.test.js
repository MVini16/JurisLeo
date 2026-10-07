import { describe, it, expect } from 'vitest';
import { VERDADEIRO_FALSO, ESCOLHA_MULTIPLA, CASOS, PARES, JOGOS } from './jogos.js';
import { idsCadeiras } from './dadosLeonor.js';

const todas = [...VERDADEIRO_FALSO, ...ESCOLHA_MULTIPLA, ...CASOS, ...PARES];
const SEM_TRAVESSOES = /[–—]/;
const SEM_EMOJIS = /\p{Extended_Pictographic}/u;

describe('o banco dos minijogos', () => {
  it('os ids são únicos e as cadeiras existem', () => {
    const ids = todas.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    todas.forEach((p) => expect(idsCadeiras, p.id).toContain(p.cadeiraId));
  });

  it('todas as perguntas têm fonte, e as que explicam têm explicação', () => {
    todas.forEach((p) => expect(p.fonte?.length, p.id).toBeGreaterThan(3));
    [...VERDADEIRO_FALSO, ...ESCOLHA_MULTIPLA, ...CASOS].forEach((p) => expect(p.explicacao?.length, p.id).toBeGreaterThan(10));
  });

  it('as perguntas de escolha têm 4 opções diferentes e a certa dentro do intervalo', () => {
    [...ESCOLHA_MULTIPLA, ...CASOS].forEach((p) => {
      expect(p.opcoes, p.id).toHaveLength(4);
      expect(new Set(p.opcoes).size, p.id).toBe(4);
      expect(Number.isInteger(p.certa) && p.certa >= 0 && p.certa < 4, p.id).toBe(true);
    });
  });

  it('há um bom equilíbrio entre verdadeiro e falso', () => {
    const verdadeiras = VERDADEIRO_FALSO.filter((p) => p.verdade).length;
    expect(verdadeiras).toBeGreaterThan(VERDADEIRO_FALSO.length * 0.3);
    expect(verdadeiras).toBeLessThan(VERDADEIRO_FALSO.length * 0.7);
  });

  it('os pares não repetem lados', () => {
    expect(new Set(PARES.map((p) => p.a)).size).toBe(PARES.length);
    expect(new Set(PARES.map((p) => p.b)).size).toBe(PARES.length);
  });

  it('o texto não tem travessões nem emojis', () => {
    JSON.stringify(todas, null, 0).split('"').forEach((t) => {
      expect(t).not.toMatch(SEM_TRAVESSOES);
      expect(t).not.toMatch(SEM_EMOJIS);
    });
  });

  it('há quatro jogos e cada um tem perguntas suficientes', () => {
    expect(JOGOS.map((j) => j.id)).toEqual(['vf', 'jurista', 'caso', 'pares']);
    expect(VERDADEIRO_FALSO.length).toBeGreaterThanOrEqual(40);
    expect(ESCOLHA_MULTIPLA.length).toBeGreaterThanOrEqual(30);
    expect(CASOS.length).toBeGreaterThanOrEqual(10);
    expect(PARES.length).toBeGreaterThanOrEqual(30);
  });
});
