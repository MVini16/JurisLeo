import { describe, it, expect } from 'vitest';
import { calcularProximaRevisao, estaPronto, ordenarPorPrioridade } from './repeticaoEspacada.js';

describe('calcularProximaRevisao', () => {
  it('sobe de nível e aumenta o intervalo quando acerta', () => {
    const { novoNivel, proximaRevisao } = calcularProximaRevisao(0, true);
    expect(novoNivel).toBe(1);
    const dias = Math.round((proximaRevisao - new Date()) / 86400000);
    expect(dias).toBe(2);
  });

  it('nunca passa do nível 4', () => {
    const { novoNivel } = calcularProximaRevisao(4, true);
    expect(novoNivel).toBe(4);
  });

  it('desce de nível quando erra', () => {
    const { novoNivel } = calcularProximaRevisao(2, false);
    expect(novoNivel).toBe(1);
  });

  it('nunca desce abaixo do nível 0', () => {
    const { novoNivel } = calcularProximaRevisao(0, false);
    expect(novoNivel).toBe(0);
  });
});

describe('estaPronto', () => {
  it('está pronto se nunca foi revisto', () => {
    expect(estaPronto({})).toBe(true);
  });

  it('não está pronto se a próxima revisão é no futuro', () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);
    expect(estaPronto({ proximaRevisao: futuro })).toBe(false);
  });

  it('está pronto se a próxima revisão já passou', () => {
    const passado = new Date();
    passado.setDate(passado.getDate() - 1);
    expect(estaPronto({ proximaRevisao: passado })).toBe(true);
  });
});

describe('ordenarPorPrioridade', () => {
  it('põe os prontos primeiro, depois por nível mais baixo', () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);

    const cartas = [
      { id: 'a', nivel: 3 },
      { id: 'b', nivel: 0, proximaRevisao: futuro },
      { id: 'c', nivel: 1 },
    ];

    const ordenadas = ordenarPorPrioridade(cartas);
    expect(ordenadas.map((c) => c.id)).toEqual(['c', 'a', 'b']);
  });
});
