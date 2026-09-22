import { describe, it, expect } from 'vitest';
import { calcularProximaRevisao, calcularProximaRevisaoPorConfianca, CONFIANCAS, estaPronto, ordenarPorPrioridade } from './repeticaoEspacada.js';

describe('calcularProximaRevisao', () => {
  it('sobe de nível e aumenta o intervalo quando acerta', () => {
    const { novoNivel, proximaRevisao } = calcularProximaRevisao(0, true);
    expect(novoNivel).toBe(1);
    const dias = Math.round((proximaRevisao - new Date()) / 86400000);
    expect(dias).toBe(3);
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

describe('calcularProximaRevisaoPorConfianca', () => {
  it('tem cinco confianças, de 1 a 5', () => {
    expect(CONFIANCAS.map((c) => c.valor)).toEqual([1, 2, 3, 4, 5]);
  });

  it('1 (não sabia) volta ao início', () => {
    expect(calcularProximaRevisaoPorConfianca(3, 1).novoNivel).toBe(0);
  });

  it('2 desce um nível, 3 fica, 4 sobe um, 5 sobe dois', () => {
    expect(calcularProximaRevisaoPorConfianca(2, 2).novoNivel).toBe(1);
    expect(calcularProximaRevisaoPorConfianca(2, 3).novoNivel).toBe(2);
    expect(calcularProximaRevisaoPorConfianca(2, 4).novoNivel).toBe(3);
    expect(calcularProximaRevisaoPorConfianca(2, 5).novoNivel).toBe(4);
  });

  it('respeita os limites 0 e 4', () => {
    expect(calcularProximaRevisaoPorConfianca(0, 2).novoNivel).toBe(0);
    expect(calcularProximaRevisaoPorConfianca(4, 5).novoNivel).toBe(4);
  });

  it('valores fora de 1 a 5 são corrigidos', () => {
    expect(calcularProximaRevisaoPorConfianca(2, 9).novoNivel).toBe(4);
    expect(calcularProximaRevisaoPorConfianca(2, 0).novoNivel).toBe(0);
    expect(calcularProximaRevisaoPorConfianca(2, 'x').novoNivel).toBe(0);
  });

  it('a data da próxima revisão segue o nível novo', () => {
    const { proximaRevisao } = calcularProximaRevisaoPorConfianca(0, 4);
    expect(Math.round((proximaRevisao - new Date()) / 86400000)).toBe(3);
  });
});
