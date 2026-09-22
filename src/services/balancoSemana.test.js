import { describe, it, expect } from 'vitest';
import { segundaDaSemana, balancoDaSemana, perguntaDaSemana } from './balancoSemana.js';

// domingo, 4 de outubro de 2026
const domingo = new Date(2026, 9, 4, 20, 0);

describe('segundaDaSemana', () => {
  it('acha a segunda-feira desta semana', () => {
    expect(segundaDaSemana(domingo).getDate()).toBe(28); // segunda 28 de setembro
  });
});

describe('balancoDaSemana', () => {
  it('só conta o que caiu na semana corrente (segunda a domingo)', () => {
    const sessoes = [
      { inicio: new Date(2026, 8, 29, 10), minutos: 30 }, // terça desta semana
      { inicio: new Date(2026, 8, 20, 10), minutos: 999 }, // semana passada, não conta
    ];
    const flashcards = [{ ultimaRevisaoEm: new Date(2026, 9, 1) }];
    const sumarios = [{ atualizadoEm: new Date(2026, 9, 2) }];
    const tarefas = [{ concluida: false }, { concluida: true }];

    const balanco = balancoDaSemana({ sessoes, flashcards, sumarios, tarefas }, domingo);
    expect(balanco.minutos).toBe(30);
    expect(balanco.flashcardsRevistos).toBe(1);
    expect(balanco.sumariosFeitos).toBe(1);
    expect(balanco.tarefasPorFazer).toBe(1);
    expect(balanco.pergunta).toBeTruthy();
  });

  it('sem nenhum dado, tudo fica a zero', () => {
    const balanco = balancoDaSemana({}, domingo);
    expect(balanco.minutos).toBe(0);
    expect(balanco.flashcardsRevistos).toBe(0);
  });
});

describe('perguntaDaSemana', () => {
  it('é sempre a mesma para a mesma semana', () => {
    expect(perguntaDaSemana(domingo)).toBe(perguntaDaSemana(new Date(2026, 9, 3)));
  });
});
