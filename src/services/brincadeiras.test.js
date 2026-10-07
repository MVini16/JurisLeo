import { describe, it, expect } from 'vitest';
import { podeDisparar, escolherSemRepetir, registarToque, acumularEscrita, COOLDOWN_GLOBAL_MS } from './brincadeiras.js';

describe('podeDisparar', () => {
  it('não dispara se as brincadeiras estiverem desligadas, nem as garantidas', () => {
    expect(podeDisparar({ ativo: false, agora: 1e9, garantido: true })).toBe(false);
  });

  it('as garantidas disparam sempre que estão ligadas, mesmo dentro do cooldown', () => {
    expect(podeDisparar({ ativo: true, agora: 1000, ultimoGlobal: 999, garantido: true })).toBe(true);
  });

  it('respeita o cooldown global', () => {
    const agora = 10 * COOLDOWN_GLOBAL_MS;
    expect(podeDisparar({ ativo: true, agora, ultimoGlobal: agora - 1000, aleatorio: 0 })).toBe(false);
    expect(podeDisparar({ ativo: true, agora, ultimoGlobal: agora - COOLDOWN_GLOBAL_MS, aleatorio: 0 })).toBe(true);
  });

  it('respeita o cooldown do próprio sítio', () => {
    const agora = 1e9;
    expect(podeDisparar({ ativo: true, agora, ultimoLocal: agora - 1000, cooldownLocalMs: 60000, aleatorio: 0 })).toBe(false);
    expect(podeDisparar({ ativo: true, agora, ultimoLocal: agora - 61000, cooldownLocalMs: 60000, aleatorio: 0 })).toBe(true);
  });

  it('usa a probabilidade', () => {
    expect(podeDisparar({ ativo: true, agora: 1e9, probabilidade: 0.3, aleatorio: 0.29 })).toBe(true);
    expect(podeDisparar({ ativo: true, agora: 1e9, probabilidade: 0.3, aleatorio: 0.3 })).toBe(false);
  });
});

describe('escolherSemRepetir', () => {
  it('nunca devolve o último quando há alternativas', () => {
    const lista = ['a', 'b', 'c'];
    for (let r = 0; r < 1; r += 0.1) {
      expect(escolherSemRepetir(lista, 'b', r)).not.toBe('b');
    }
  });

  it('aceita lista de um só item e lista vazia', () => {
    expect(escolherSemRepetir(['a'], 'a', 0.5)).toBe('a');
    expect(escolherSemRepetir([], null, 0.5)).toBeNull();
  });

  it('não sai da lista com aleatório a 1', () => {
    expect(escolherSemRepetir(['a', 'b'], null, 1)).toBe('b');
  });
});

describe('registarToque', () => {
  it('completa ao terceiro toque dentro da janela', () => {
    let e = registarToque({ toques: [] }, 1000);
    expect(e.completo).toBe(false);
    e = registarToque(e, 1400);
    expect(e.completo).toBe(false);
    e = registarToque(e, 1900);
    expect(e.completo).toBe(true);
    expect(e.toques).toEqual([]);
  });

  it('esquece toques antigos', () => {
    let e = registarToque({ toques: [] }, 1000);
    e = registarToque(e, 1200);
    e = registarToque(e, 5000);
    expect(e.completo).toBe(false);
    expect(e.toques).toEqual([5000]);
  });
});

describe('acumularEscrita', () => {
  it('soma quando a última tecla foi há pouco', () => {
    expect(acumularEscrita({ ativoMs: 0, ultimaTecla: 9000, agora: 10000 })).toBe(15000);
  });

  it('não soma se ela parou de escrever', () => {
    expect(acumularEscrita({ ativoMs: 30000, ultimaTecla: 1000, agora: 100000 })).toBe(30000);
  });

  it('não soma se nunca escreveu', () => {
    expect(acumularEscrita({ ativoMs: 0, ultimaTecla: null, agora: 100000 })).toBe(0);
  });
});
