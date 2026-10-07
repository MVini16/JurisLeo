import { describe, it, expect } from 'vitest';
import {
  simplificarPontos, novoTraco, pontosDoTraco, larguraDoTraco, serializarDesenho, lerDesenho,
  tamanhoDoDesenhoEmBytes, alturaDoDesenho, tracosTocados, historicoInicial, adicionarTraco,
  apagarTracos, limparTudo, desfazer, refazer, MAX_TRACOS, LARGURAS,
} from './desenho.js';

const reta = (n) => Array.from({ length: n }, (_, i) => ({ x: i * 2, y: 100 }));
const traco = (pontos, extra = {}) => novoTraco({ ferramenta: 'caneta', cor: 'azul', espessura: 2, pontos, ...extra });

describe('simplificarPontos', () => {
  it('uma linha reta fica só com os extremos', () => {
    const simples = simplificarPontos(reta(200));
    expect(simples).toEqual([{ x: 0, y: 100 }, { x: 398, y: 100 }]);
  });

  it('guarda as curvas e os cantos', () => {
    const canto = [...reta(50), ...Array.from({ length: 50 }, (_, i) => ({ x: 98, y: 100 + i * 2 }))];
    const simples = simplificarPontos(canto);
    expect(simples.length).toBeGreaterThanOrEqual(3);
    expect(simples).toContainEqual({ x: 98, y: 100 });
  });

  it('aguenta linhas muito compridas sem rebentar', () => {
    const ruido = Array.from({ length: 5000 }, (_, i) => ({ x: i, y: Math.sin(i / 7) * 50 }));
    expect(simplificarPontos(ruido, 0.5).length).toBeGreaterThan(10);
  });
});

describe('traços', () => {
  it('guarda e devolve os pontos arredondados, sem perder o traçado', () => {
    const t = traco([{ x: 10.4, y: 20.6 }, { x: 60.2, y: 80.9 }, { x: 120, y: 30 }]);
    expect(pontosDoTraco(t)).toEqual([{ x: 10, y: 21 }, { x: 60, y: 81 }, { x: 120, y: 30 }]);
  });

  it('um toque sem arrasto vira um pontinho', () => {
    const t = traco([{ x: 50, y: 50 }]);
    expect(pontosDoTraco(t)).toEqual([{ x: 50, y: 50 }, { x: 50, y: 50 }]);
  });

  it('cor desconhecida volta à tinta e a espessura fica entre 1 e 3', () => {
    expect(traco(reta(3), { cor: 'rosa-choque', espessura: 9 })).toMatchObject({ k: 'tinta', l: 3 });
    expect(traco(reta(3), { espessura: -2 }).l).toBe(1);
  });

  it('a largura depende da ferramenta e da espessura', () => {
    expect(larguraDoTraco(traco(reta(3), { espessura: 1 }))).toBe(LARGURAS.caneta[0]);
    expect(larguraDoTraco(traco(reta(3), { ferramenta: 'marcador', espessura: 3 }))).toBe(LARGURAS.marcador[2]);
  });

  it('uma letra à mão ocupa poucos bytes (diferenças pequenas)', () => {
    const letra = Array.from({ length: 80 }, (_, i) => ({ x: 100 + Math.cos(i / 8) * 30 + i, y: 200 + Math.sin(i / 8) * 30 }));
    expect(tamanhoDoDesenhoEmBytes([traco(letra)])).toBeLessThan(400);
  });
});

describe('guardar e abrir', () => {
  it('ida e volta sem perder nada', () => {
    const tracos = [traco(reta(5)), traco([{ x: 5, y: 5 }, { x: 90, y: 40 }], { cor: 'vinho' })];
    expect(lerDesenho(serializarDesenho(tracos))).toEqual(tracos);
  });

  it('sem traços não guarda nada', () => {
    expect(serializarDesenho([])).toBe('');
    expect(lerDesenho('')).toEqual([]);
    expect(lerDesenho(undefined)).toEqual([]);
  });

  it('texto estragado ou com a forma errada dá desenho vazio', () => {
    expect(lerDesenho('{não é json')).toEqual([]);
    expect(lerDesenho('{"v":1}')).toEqual([]);
    expect(lerDesenho('[1,2,3]')).toEqual([]);
  });

  it('deita fora só os traços inválidos e conserta cores e espessuras desconhecidas', () => {
    const texto = JSON.stringify({ v: 1, t: [
      { f: 'c', k: 'azul', l: 2, p: [0, 0, 5, 5] },
      { f: 'x', k: 'azul', l: 2, p: [0, 0, 5, 5] },
      { f: 'c', k: 'azul', l: 2, p: [0, 0, 5] },
      { f: 'c', k: 'azul', l: 2, p: [0, 0, 'a', 5] },
      { f: 'm', k: 'javascript:alert(1)', l: 99, p: [1, 1, 2, 2] },
    ] });
    const lidos = lerDesenho(texto);
    expect(lidos).toHaveLength(2);
    expect(lidos[1]).toMatchObject({ f: 'm', k: 'tinta', l: 2 });
  });

  it('corta o que passar do máximo de traços', () => {
    const muitos = Array.from({ length: MAX_TRACOS + 50 }, () => ({ f: 'c', k: 'tinta', l: 1, p: [0, 0, 1, 1] }));
    expect(lerDesenho(JSON.stringify({ v: 1, t: muitos }))).toHaveLength(MAX_TRACOS);
  });
});

describe('altura e borracha', () => {
  it('a altura acompanha o ponto mais baixo e é 0 sem desenho', () => {
    expect(alturaDoDesenho([])).toBe(0);
    const t = traco([{ x: 10, y: 10 }, { x: 10, y: 500 }]);
    expect(alturaDoDesenho([t])).toBeGreaterThan(500);
  });

  it('a borracha apanha só os traços que toca', () => {
    const a = traco([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
    const b = traco([{ x: 0, y: 300 }, { x: 100, y: 300 }]);
    expect(tracosTocados([a, b], { x: 50, y: 5 }, 10)).toEqual([0]);
    expect(tracosTocados([a, b], { x: 50, y: 150 }, 10)).toEqual([]);
    expect(tracosTocados([a, b], { x: 50, y: 150 }, 200)).toEqual([0, 1]);
  });

  it('apanha também um pontinho', () => {
    const ponto = traco([{ x: 200, y: 200 }]);
    expect(tracosTocados([ponto], { x: 203, y: 203 }, 6)).toEqual([0]);
  });
});

describe('desfazer e refazer', () => {
  const a = traco(reta(3));
  const b = traco(reta(4), { cor: 'ouro' });

  it('adiciona, desfaz e refaz', () => {
    let h = historicoInicial();
    h = adicionarTraco(h, a);
    h = adicionarTraco(h, b);
    expect(h.tracos).toEqual([a, b]);
    h = desfazer(h);
    expect(h.tracos).toEqual([a]);
    h = refazer(h);
    expect(h.tracos).toEqual([a, b]);
  });

  it('um traço novo apaga o que havia para refazer', () => {
    let h = adicionarTraco(historicoInicial(), a);
    h = desfazer(h);
    h = adicionarTraco(h, b);
    expect(h.futuro).toEqual([]);
    expect(refazer(h)).toBe(h);
  });

  it('apagar com a borracha e limpar tudo também se desfazem', () => {
    let h = adicionarTraco(adicionarTraco(historicoInicial(), a), b);
    h = apagarTracos(h, [0]);
    expect(h.tracos).toEqual([b]);
    h = limparTudo(h);
    expect(h.tracos).toEqual([]);
    h = desfazer(desfazer(h));
    expect(h.tracos).toEqual([a, b]);
  });

  it('não faz nada sem alterações', () => {
    const h = historicoInicial([a]);
    expect(desfazer(h)).toBe(h);
    expect(apagarTracos(h, [])).toBe(h);
    expect(limparTudo(historicoInicial())).toEqual(historicoInicial());
  });

  it('o histórico tem limite', () => {
    let h = historicoInicial();
    for (let i = 0; i < 100; i++) h = adicionarTraco(h, a);
    expect(h.passado.length).toBe(60);
  });
});
