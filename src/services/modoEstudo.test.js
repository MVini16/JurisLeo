import { describe, it, expect } from 'vitest';
import {
  direcaoDoGesto, acaoDoGesto, resumoDaSessao, mensagemFinal, serieDeDias, registarDia, varianteValida, diaDe,
  comboAtual, proximoPorResponder, maisCartoes, barrasDeProgresso,
} from './modoEstudo.js';

describe('direcaoDoGesto', () => {
  it('ignora gestos curtos', () => {
    expect(direcaoDoGesto({ dx: 10, dy: -20 })).toBeNull();
  });
  it('escolhe o eixo dominante', () => {
    expect(direcaoDoGesto({ dx: 5, dy: -120 })).toBe('cima');
    expect(direcaoDoGesto({ dx: 5, dy: 120 })).toBe('baixo');
    expect(direcaoDoGesto({ dx: 130, dy: 20 })).toBe('direita');
    expect(direcaoDoGesto({ dx: -130, dy: 20 })).toBe('esquerda');
  });
});

describe('acaoDoGesto', () => {
  it('na pilha só responde depois de virar', () => {
    expect(acaoDoGesto('pilha', 'direita', false)).toBeNull();
    expect(acaoDoGesto('pilha', 'direita', true)).toBe('acertei');
    expect(acaoDoGesto('pilha', 'esquerda', true)).toBe('errei');
  });
  it('no feed, cima vira e depois avança', () => {
    expect(acaoDoGesto('feed', 'cima', false)).toBe('virar');
    expect(acaoDoGesto('feed', 'cima', true)).toBe('acertei');
    expect(acaoDoGesto('feed', 'baixo', true)).toBeNull();
  });
  it('o story não usa gestos', () => {
    expect(acaoDoGesto('story', 'cima', true)).toBeNull();
  });
});

describe('resumo e mensagem', () => {
  it('conta certas e erradas', () => {
    expect(resumoDaSessao([true, false, true, true])).toEqual({ total: 4, certas: 3, erradas: 1, percentagem: 75 });
    expect(resumoDaSessao([])).toEqual({ total: 0, certas: 0, erradas: 0, percentagem: 0 });
  });
  it('mensagens por faixa', () => {
    expect(mensagemFinal({ total: 3, percentagem: 100 })).toContain('perfeita');
    expect(mensagemFinal({ total: 3, percentagem: 10 })).toContain('Amanhã');
  });
});

describe('série de dias', () => {
  it('conta dias seguidos até hoje', () => {
    expect(serieDeDias(['2026-10-05', '2026-10-06', '2026-10-07'], '2026-10-07')).toBe(3);
  });
  it('não perde a série antes de ela estudar hoje', () => {
    expect(serieDeDias(['2026-10-05', '2026-10-06'], '2026-10-07')).toBe(2);
  });
  it('um dia em falta corta a série', () => {
    expect(serieDeDias(['2026-10-03', '2026-10-06'], '2026-10-07')).toBe(1);
    expect(serieDeDias(['2026-10-01'], '2026-10-07')).toBe(0);
  });
  it('atravessa o fim do mês', () => {
    expect(serieDeDias(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2);
  });
  it('registarDia não duplica e ordena', () => {
    expect(registarDia(['2026-10-06'], '2026-10-07')).toEqual(['2026-10-06', '2026-10-07']);
    expect(registarDia(['2026-10-07'], '2026-10-07')).toEqual(['2026-10-07']);
  });
  it('diaDe formata YYYY-MM-DD', () => {
    expect(diaDe(new Date(2026, 9, 7))).toBe('2026-10-07');
  });
});

describe('varianteValida', () => {
  it('cai no story se desconhecida', () => {
    expect(varianteValida('feed')).toBe('feed');
    expect(varianteValida('xpto')).toBe('story');
  });
});

describe('extras do story', () => {
  it('combo conta as certas seguidas no fim', () => {
    expect(comboAtual([true, false, true, true, true])).toBe(3);
    expect(comboAtual([true, true, false])).toBe(0);
    expect(comboAtual([])).toBe(0);
  });
  it('proximoPorResponder dá a volta e devolve -1 quando acabou', () => {
    const lista = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(proximoPorResponder(lista, { a: true }, 1)).toBe(1);
    expect(proximoPorResponder(lista, { b: true, c: false }, 1)).toBe(0);
    expect(proximoPorResponder(lista, { a: true, b: true, c: true }, 0)).toBe(-1);
  });
  it('maisCartoes não repete os usados e dá no máximo n', () => {
    const todos = ['a', 'b', 'c', 'd'].map((id) => ({ id, nivel: 0, proximaRevisao: null }));
    const r = maisCartoes(todos, [{ id: 'a' }], 2);
    expect(r).toHaveLength(2);
    expect(r.map((c) => c.id)).not.toContain('a');
  });
  it('barras: segmentos até 20, contínua acima', () => {
    expect(barrasDeProgresso(3, 1).estados).toEqual(['feito', 'agora', 'falta']);
    expect(barrasDeProgresso(40, 19)).toEqual({ tipo: 'continua', fracao: 0.5 });
  });
});
