import { describe, it, expect } from 'vitest';
import { baralhar, cartoesJogaveis, podeJogar, montarJogo, ehPar, textoDoTempo, PARES_POR_JOGO } from './pares.js';

const c = (id, frente, tras) => ({ id, frente, tras });
const cartoes = Array.from({ length: 10 }, (_, i) => c(`c${i}`, `pergunta ${i}`, `resposta ${i}`));

describe('baralhar', () => {
  it('não altera a lista original e mantém os elementos', () => {
    const original = [1, 2, 3, 4, 5];
    const b = baralhar(original, () => 0.3);
    expect(original).toEqual([1, 2, 3, 4, 5]);
    expect([...b].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('cartoesJogaveis', () => {
  it('tira cartões vazios, iguais nos dois lados ou demasiado longos', () => {
    const r = cartoesJogaveis([c('a', 'x', 'y'), c('b', '', 'y'), c('c', 'x', ''), c('d', 'igual', 'igual'), c('e', 'a'.repeat(200), 'y'), c('f', ' p ', ' r ')]);
    expect(r.map((x) => x.id)).toEqual(['a', 'f']);
  });

  it('só se pode jogar com pelo menos três cartões', () => {
    expect(podeJogar(cartoes.slice(0, 2))).toBe(false);
    expect(podeJogar(cartoes.slice(0, 3))).toBe(true);
  });
});

describe('montarJogo', () => {
  it('cria duas peças por cartão, até ao máximo de pares', () => {
    const j = montarJogo(cartoes);
    expect(j.pares).toBe(PARES_POR_JOGO);
    expect(j.pecas).toHaveLength(PARES_POR_JOGO * 2);
    const ids = j.pecas.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('com poucos cartões usa todos', () => {
    const j = montarJogo(cartoes.slice(0, 4));
    expect(j.pares).toBe(4);
    expect(j.pecas).toHaveLength(8);
  });

  it('cada cartão dá exatamente uma peça de frente e uma de verso', () => {
    const j = montarJogo(cartoes.slice(0, 5));
    for (const par of new Set(j.pecas.map((p) => p.par))) {
      const lados = j.pecas.filter((p) => p.par === par).map((p) => p.lado).sort();
      expect(lados).toEqual(['f', 't']);
    }
  });

  it('as peças levam o texto do cartão', () => {
    const j = montarJogo([c('a', 'frente A', 'verso A'), c('b', 'frente B', 'verso B'), c('c', 'frente C', 'verso C')]);
    expect(j.pecas.find((p) => p.id === 'a:f').texto).toBe('frente A');
    expect(j.pecas.find((p) => p.id === 'a:t').texto).toBe('verso A');
  });

  it('sem cartões devolve um jogo vazio', () => {
    expect(montarJogo([])).toEqual({ pares: 0, pecas: [] });
  });
});

describe('ehPar', () => {
  const fa = { id: 'a:f', par: 'a', lado: 'f' };
  const ta = { id: 'a:t', par: 'a', lado: 't' };
  const tb = { id: 'b:t', par: 'b', lado: 't' };

  it('a frente e o verso do mesmo cartão são um par', () => {
    expect(ehPar(fa, ta)).toBe(true);
    expect(ehPar(ta, fa)).toBe(true);
  });

  it('cartões diferentes, a mesma peça duas vezes ou peças em falta não são', () => {
    expect(ehPar(fa, tb)).toBe(false);
    expect(ehPar(fa, fa)).toBe(false);
    expect(ehPar(fa, null)).toBe(false);
  });
});

describe('textoDoTempo', () => {
  it('escreve minutos e segundos', () => {
    expect(textoDoTempo(42)).toBe('0:42');
    expect(textoDoTempo(65)).toBe('1:05');
    expect(textoDoTempo(-3)).toBe('0:00');
  });
});
