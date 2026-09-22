import { describe, it, expect } from 'vitest';
import { linhasParaTopicos, marcarTopico, contarTopicos, pontosParaReclamar, pontosParaRever } from './topicosCorrecao.js';

describe('linhasParaTopicos', () => {
  it('uma linha, um tópico, por marcar', () => {
    const topicos = linhasParaTopicos('Responsabilidade civil\nNexo de causalidade');
    expect(topicos).toEqual([
      { texto: 'Responsabilidade civil', tinha: null },
      { texto: 'Nexo de causalidade', tinha: null },
    ]);
  });

  it('ignora linhas vazias e marcadores', () => {
    const topicos = linhasParaTopicos('- Um tópico\n\n* Outro\n');
    expect(topicos.map((t) => t.texto)).toEqual(['Um tópico', 'Outro']);
  });

  it('lista vazia devolve lista vazia', () => {
    expect(linhasParaTopicos('')).toEqual([]);
  });
});

describe('marcarTopico', () => {
  it('marca o tópico no índice certo, sem mexer nos outros', () => {
    const topicos = linhasParaTopicos('A\nB');
    const marcados = marcarTopico(topicos, 0, true);
    expect(marcados[0].tinha).toBe(true);
    expect(marcados[1].tinha).toBe(null);
  });

  it('ignora índices fora dos limites', () => {
    const topicos = linhasParaTopicos('A');
    expect(marcarTopico(topicos, 5, true)).toBe(topicos);
  });
});

describe('contarTopicos', () => {
  it('conta tinha, faltou e por marcar', () => {
    let topicos = linhasParaTopicos('A\nB\nC');
    topicos = marcarTopico(topicos, 0, true);
    topicos = marcarTopico(topicos, 1, false);
    expect(contarTopicos(topicos)).toEqual({ tinha: 1, faltou: 1, porMarcar: 1, total: 3 });
  });
});

describe('pontosParaReclamar e pontosParaRever', () => {
  it('separa o que reclamar do que rever', () => {
    let topicos = linhasParaTopicos('Prescrição\nCaducidade\nBoa fé');
    topicos = marcarTopico(topicos, 0, true);
    topicos = marcarTopico(topicos, 1, false);
    expect(pontosParaReclamar(topicos)).toEqual(['Prescrição']);
    expect(pontosParaRever(topicos)).toEqual(['Caducidade']);
  });
});
