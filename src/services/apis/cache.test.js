import { describe, it, expect, vi } from 'vitest';
import { lerCache, guardarCache, comCache, PREFIXO_CACHE } from './cache.js';

// localStorage falso, em memória
function criarStorage() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    mapa,
  };
}

const T0 = new Date(2026, 8, 24, 10, 0, 0).getTime();
const MIN = 60 * 1000;

describe('lerCache e guardarCache', () => {
  it('guarda e lê dentro da validade', () => {
    const storage = criarStorage();
    expect(guardarCache('tempo', { tMax: 24 }, 45 * MIN, { storage, agora: T0 })).toBe(true);
    expect(storage.mapa.has(PREFIXO_CACHE + 'tempo')).toBe(true);
    expect(lerCache('tempo', { storage, agora: T0 + 10 * MIN })).toEqual({ dados: { tMax: 24 }, guardadoEm: T0, expirado: false });
  });

  it('depois da validade continua a devolver, marcado como expirado', () => {
    const storage = criarStorage();
    guardarCache('tempo', 1, 45 * MIN, { storage, agora: T0 });
    expect(lerCache('tempo', { storage, agora: T0 + 45 * MIN }).expirado).toBe(true);
  });

  it('sem nada, lixo ou formato antigo dá null', () => {
    const storage = criarStorage();
    expect(lerCache('nada', { storage })).toBeNull();
    storage.setItem(PREFIXO_CACHE + 'lixo', '{nao é json');
    expect(lerCache('lixo', { storage })).toBeNull();
    storage.setItem(PREFIXO_CACHE + 'velho', JSON.stringify({ dados: 1 }));
    expect(lerCache('velho', { storage })).toBeNull();
  });

  it('storage cheio ou inexistente não rebenta', () => {
    const cheio = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(guardarCache('x', 1, MIN, { storage: cheio })).toBe(false);
    expect(guardarCache('x', 1, MIN, { storage: undefined })).toBe(false);
    expect(lerCache('x', { storage: undefined })).toBeNull();
  });
});

describe('comCache', () => {
  it('cache válida: não faz o pedido', async () => {
    const storage = criarStorage();
    guardarCache('tempo', 'guardado', 45 * MIN, { storage, agora: T0 });
    const pedirFn = vi.fn();
    const r = await comCache('tempo', 45 * MIN, pedirFn, { storage, agora: () => T0 + MIN });
    expect(pedirFn).not.toHaveBeenCalled();
    expect(r).toMatchObject({ dados: 'guardado', daCache: true, erro: null });
  });

  it('sem cache: pede e guarda', async () => {
    const storage = criarStorage();
    const pedirFn = vi.fn(async () => ({ ok: true, dados: 'novo', erro: null }));
    const r = await comCache('tempo', 45 * MIN, pedirFn, { storage, agora: () => T0 });
    expect(r).toMatchObject({ dados: 'novo', guardadoEm: T0, daCache: false, erro: null });
    expect(lerCache('tempo', { storage, agora: T0 }).dados).toBe('novo');
  });

  it('cache expirada e pedido falha: mostra a antiga com o erro', async () => {
    const storage = criarStorage();
    guardarCache('tempo', 'antigo', 45 * MIN, { storage, agora: T0 });
    const pedirFn = vi.fn(async () => ({ ok: false, dados: null, erro: 'semLigacao', tentarDepois: null }));
    const r = await comCache('tempo', 45 * MIN, pedirFn, { storage, agora: () => T0 + 2 * 60 * MIN });
    expect(r).toEqual({ dados: 'antigo', guardadoEm: T0, daCache: true, erro: 'semLigacao', tentarDepois: null });
  });

  it('sem cache e pedido falha: sem dados, com o erro e a hora do limite', async () => {
    const storage = criarStorage();
    const hora = new Date(T0 + MIN);
    const pedirFn = vi.fn(async () => ({ ok: false, dados: null, erro: 'limite', tentarDepois: hora }));
    const r = await comCache('tempo', 45 * MIN, pedirFn, { storage, agora: () => T0 });
    expect(r).toEqual({ dados: null, guardadoEm: null, daCache: false, erro: 'limite', tentarDepois: hora });
  });
});
