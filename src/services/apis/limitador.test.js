import { describe, it, expect } from 'vitest';
import { criarLimitadorPorMinuto, lerUsoDoDia, cabeNoDia, registarUsoDoDia } from './limitador.js';

function criarStorage() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
  };
}

describe('criarLimitadorPorMinuto', () => {
  it('deixa até ao máximo e depois trava', () => {
    let agora = 0;
    const lim = criarLimitadorPorMinuto(3, { relogio: () => agora });
    expect([lim.tentar(), lim.tentar(), lim.tentar()]).toEqual([true, true, true]);
    expect(lim.tentar()).toBe(false);
    expect(lim.podePedir()).toBe(false);
  });

  it('janela deslizante: liberta quando o pedido mais antigo faz 60 s', () => {
    let agora = 0;
    const lim = criarLimitadorPorMinuto(2, { relogio: () => agora });
    lim.tentar();
    agora = 20000;
    lim.tentar();
    agora = 30000;
    expect(lim.livreEm()).toBe(30000);
    agora = 60000;
    expect(lim.livreEm()).toBe(0);
    expect(lim.tentar()).toBe(true);
    expect(lim.tentar()).toBe(false);
  });

  it('um pedido recusado não conta', () => {
    let agora = 0;
    const lim = criarLimitadorPorMinuto(1, { relogio: () => agora });
    lim.tentar();
    agora = 59000;
    lim.tentar();
    agora = 60000;
    expect(lim.tentar()).toBe(true);
  });
});

describe('uso do dia', () => {
  const manha = new Date(2026, 8, 24, 9, 0);
  const noite = new Date(2026, 8, 24, 23, 59);
  const amanha = new Date(2026, 8, 25, 0, 1);

  it('soma ao longo do dia e respeita o máximo', () => {
    const storage = criarStorage();
    expect(lerUsoDoDia('mymemory', { storage, agora: manha })).toBe(0);
    expect(registarUsoDoDia('mymemory', 3000, { storage, agora: manha })).toBe(3000);
    expect(registarUsoDoDia('mymemory', 1500, { storage, agora: noite })).toBe(4500);
    expect(cabeNoDia('mymemory', 500, 5000, { storage, agora: noite })).toBe(true);
    expect(cabeNoDia('mymemory', 501, 5000, { storage, agora: noite })).toBe(false);
  });

  it('volta a zero depois da meia-noite', () => {
    const storage = criarStorage();
    registarUsoDoDia('mymemory', 4999, { storage, agora: noite });
    expect(lerUsoDoDia('mymemory', { storage, agora: amanha })).toBe(0);
    expect(registarUsoDoDia('mymemory', 10, { storage, agora: amanha })).toBe(10);
  });

  it('chaves diferentes não se misturam', () => {
    const storage = criarStorage();
    registarUsoDoDia('a', 10, { storage, agora: manha });
    expect(lerUsoDoDia('b', { storage, agora: manha })).toBe(0);
  });

  it('storage bloqueado ou com lixo não rebenta', () => {
    const bloqueado = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('SecurityError'); } };
    expect(lerUsoDoDia('x', { storage: bloqueado, agora: manha })).toBe(0);
    expect(registarUsoDoDia('x', 5, { storage: bloqueado, agora: manha })).toBe(5);
    const lixo = { getItem: () => '{estragado', setItem: () => {} };
    expect(lerUsoDoDia('x', { storage: lixo, agora: manha })).toBe(0);
  });
});
