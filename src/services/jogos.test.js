import { describe, it, expect } from 'vitest';
import {
  misturar, escolherN, filtrarPorCadeira, flashcardsParaVF, flashcardParaEscolha, flashcardsParaEscolha, flashcardsParaPares, montarRonda,
  baralharOpcoes, pontosVF, resultadoVF, tituloGarantido, meiaMeia, pistaDoVini, prepararTabuleiro, eParCerto, pontosPares, registarRecorde,
  PERGUNTAS_POR_JOGO, ESCADA,
} from './jogos.js';
import { VERDADEIRO_FALSO, ESCOLHA_MULTIPLA, CASOS, PARES } from '../data/jogos.js';

const sequencia = (...v) => { let i = 0; return () => v[Math.min(i++, v.length - 1)]; };
const BANCO = { vf: VERDADEIRO_FALSO, escolha: ESCOLHA_MULTIPLA, casos: CASOS, pares: PARES };
const fc = (id, frente, tras, cadeiraId = 'obrigacoes-1', extra = {}) => ({ id, frente, tras, cadeiraId, ...extra });

describe('misturar e escolher', () => {
  it('não perde nem inventa elementos e não mexe no original', () => {
    const original = [1, 2, 3, 4, 5];
    const r = misturar(original, sequencia(0.1, 0.9, 0.5, 0.3));
    expect([...r].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
  it('escolherN respeita o tamanho', () => {
    expect(escolherN([1, 2, 3], 2)).toHaveLength(2);
    expect(escolherN([1, 2, 3], 10)).toHaveLength(3);
  });
  it('filtra por cadeira, e "todas" não filtra', () => {
    const l = [{ cadeiraId: 'a' }, { cadeiraId: 'b' }];
    expect(filtrarPorCadeira(l, 'a')).toHaveLength(1);
    expect(filtrarPorCadeira(l, 'todas')).toHaveLength(2);
  });
});

describe('as perguntas dela', () => {
  const cartoes = [fc('1', 'Pressupostos do art. 483.º?', 'Facto, ilicitude, culpa, dano e nexo.'), fc('2', 'Prazo do art. 498.º?', 'Três anos.'), fc('3', 'Regime supletivo?', 'Comunhão de adquiridos.', 'familia'), fc('4', 'Fonte do DIP?', 'Tratados e costume.', 'dip-1')];

  it('flashcard vira escolha com a certa dentro das opções e sem repetidas', () => {
    const p = flashcardParaEscolha(cartoes[0], cartoes, sequencia(0.2, 0.7, 0.1));
    expect(p.opcoes).toHaveLength(4);
    expect(new Set(p.opcoes).size).toBe(4);
    expect(p.opcoes[p.certa]).toBe('Facto, ilicitude, culpa, dano e nexo.');
    expect(p.dela).toBe(true);
  });
  it('sem opções suficientes não faz escolha', () => {
    expect(flashcardParaEscolha(cartoes[0], cartoes.slice(0, 2))).toBeNull();
  });
  it('as opções erradas que ela escreveu têm prioridade', () => {
    const c = fc('9', 'Capital de Portugal?', 'Lisboa', 'hri', { opcoes: ['Porto', 'Braga', 'Faro'] });
    const p = flashcardParaEscolha(c, [c]);
    expect(p.opcoes.sort()).toEqual(['Braga', 'Faro', 'Lisboa', 'Porto']);
  });
  it('flashcards viram afirmações verdadeiras e falsas', () => {
    const r = flashcardsParaVF(cartoes, () => 0);
    expect(r.some((p) => p.verdade)).toBe(true);
    expect(r.some((p) => !p.verdade)).toBe(true);
    r.filter((p) => !p.verdade).forEach((p) => expect(p.explicacao).toContain('A resposta certa é'));
  });
  it('perguntas V/F escritas por ela entram tal e qual', () => {
    const r = flashcardsParaVF([fc('v', 'A culpa presume-se sempre.', 'Falso, regra geral prova-se.', 'obrigacoes-1', { tipo: 'vf', verdade: false })]);
    expect(r).toEqual([expect.objectContaining({ afirmacao: 'A culpa presume-se sempre.', verdade: false })]);
  });
  it('pares só com textos curtos', () => {
    const r = flashcardsParaPares([...cartoes, fc('l', 'x'.repeat(100), 'curto')]);
    expect(r).toHaveLength(4);
  });
  it('escolha só usa flashcards normais ou do tipo escolha', () => {
    const lista = [...cartoes, fc('v', 'afirmação', 'explicação', 'familia', { tipo: 'vf', verdade: true })];
    expect(flashcardsParaEscolha(lista).every((p) => !p.id.includes('-v'))).toBe(true);
  });
});

describe('montarRonda', () => {
  it('cada jogo devolve no máximo o número de perguntas definido, tirado do banco', () => {
    for (const jogo of ['vf', 'jurista', 'caso', 'pares']) {
      const r = montarRonda(jogo, { banco: BANCO, fonte: 'banco' });
      expect(r.length, jogo).toBeGreaterThan(0);
      expect(r.length, jogo).toBeLessThanOrEqual(PERGUNTAS_POR_JOGO[jogo]);
    }
  });
  it('filtra por cadeira', () => {
    const r = montarRonda('vf', { banco: BANCO, fonte: 'banco', cadeiraId: 'familia' });
    expect(r.every((p) => p.cadeiraId === 'familia')).toBe(true);
  });
  it('"as minhas" sem flashcards fica vazio, "mistura" mistura', () => {
    expect(montarRonda('vf', { banco: BANCO, flashcards: [], fonte: 'minhas' })).toEqual([]);
    const meus = [fc('1', 'P1?', 'R1'), fc('2', 'P2?', 'R2'), fc('3', 'P3?', 'R3'), fc('4', 'P4?', 'R4')];
    const r = montarRonda('jurista', { banco: BANCO, flashcards: meus, fonte: 'mistura', aleatorio: () => 0.5 });
    expect(r.some((p) => p.dela)).toBe(true);
  });
  it('baralhar as opções mantém a certa a apontar para a mesma resposta', () => {
    const p = ESCOLHA_MULTIPLA[0];
    const b = baralharOpcoes(p, sequencia(0.9, 0.1, 0.5));
    expect(b.opcoes[b.certa]).toBe(p.opcoes[p.certa]);
  });
});

describe('verdadeiro ou falso', () => {
  it('pontos crescem com as seguidas até ao limite', () => {
    expect([1, 2, 3, 4, 5, 6, 20].map(pontosVF)).toEqual([10, 15, 20, 25, 30, 30, 30]);
  });
  it('um erro quebra a série', () => {
    expect(resultadoVF([true, true, false, true])).toEqual({ pontos: 10 + 15 + 10, certas: 3, erradas: 1, melhorSerie: 2 });
    expect(resultadoVF([])).toEqual({ pontos: 0, certas: 0, erradas: 0, melhorSerie: 0 });
  });
});

describe('quem quer ser jurista', () => {
  it('a escada tem 10 degraus', () => {
    expect(ESCADA).toHaveLength(10);
  });
  it('o título garantido é o do último patamar passado', () => {
    expect(tituloGarantido(0)).toContain('Sem título');
    expect(tituloGarantido(2)).toContain('Sem título');
    expect(tituloGarantido(3)).toBe(ESCADA[2]);
    expect(tituloGarantido(5)).toBe(ESCADA[2]);
    expect(tituloGarantido(6)).toBe(ESCADA[5]);
    expect(tituloGarantido(9)).toBe(ESCADA[5]);
  });
  it('50/50 esconde duas erradas e nunca a certa', () => {
    for (let i = 0; i < 30; i += 1) {
      const p = ESCOLHA_MULTIPLA[i % ESCOLHA_MULTIPLA.length];
      const escondidas = meiaMeia(p);
      expect(escondidas).toHaveLength(2);
      expect(escondidas).not.toContain(p.certa);
    }
  });
  it('a pista do Vini mostra a fonte mas não a resposta', () => {
    const p = ESCOLHA_MULTIPLA[0];
    const pista = pistaDoVini(p);
    expect(pista).toContain(p.fonte);
    expect(pista).not.toContain(p.opcoes[p.certa]);
  });
});

describe('ligar os pares', () => {
  it('o tabuleiro tem os dois lados com os mesmos ids', () => {
    const t = prepararTabuleiro(PARES.slice(0, 6));
    expect(t.esquerda.map((c) => c.id).sort()).toEqual(t.direita.map((c) => c.id).sort());
  });
  it('só é par certo quando os ids são iguais', () => {
    expect(eParCerto('a', 'a')).toBe(true);
    expect(eParCerto('a', 'b')).toBe(false);
    expect(eParCerto(null, null)).toBe(false);
  });
  it('pontuação com erros e bónus de tempo', () => {
    expect(pontosPares({ certos: 6, erros: 0, segundos: 0 })).toBe(180);
    expect(pontosPares({ certos: 6, erros: 2, segundos: 90 })).toBe(110);
    expect(pontosPares({ certos: 0, erros: 5, segundos: 10 })).toBe(0);
  });
});

describe('recordes', () => {
  it('guarda o melhor e conta jogadas', () => {
    let r = registarRecorde({}, 'vf', 100);
    expect(r.novoRecorde).toBe(true);
    r = registarRecorde(r.registo, 'vf', 80);
    expect(r.novoRecorde).toBe(false);
    expect(r.registo.vf).toEqual({ melhor: 100, jogadas: 2 });
  });
});
