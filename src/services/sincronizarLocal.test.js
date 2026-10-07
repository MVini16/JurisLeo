import { describe, it, expect } from 'vitest';
import { copiavel, hash, atualizarMeta, planear, aplicarDaNuvem } from './sincronizarLocal.js';

function storageFalso(inicial = {}) {
  const d = { ...inicial };
  return {
    get length() { return Object.keys(d).length; },
    key: (i) => Object.keys(d)[i] ?? null,
    getItem: (k) => (k in d ? d[k] : null),
    setItem: (k, v) => { d[k] = String(v); },
    _d: d,
  };
}

describe('copiavel', () => {
  it('só copia chaves da app, sem as da instalação nem as de sincronização', () => {
    expect(copiavel('jurisleo-brincadeiras')).toBe(true);
    expect(copiavel('jurisleo-versao-vista')).toBe(false);
    expect(copiavel('jurisleo-sync-meta')).toBe(false);
    expect(copiavel('jurisleo-admin-resumos')).toBe(false);
    expect(copiavel('outra-coisa')).toBe(false);
  });
});

describe('atualizarMeta', () => {
  it('marca como novas as chaves que mudaram', () => {
    const s = storageFalso({ 'jurisleo-a': '1' });
    let meta = atualizarMeta(s, {}, 100);
    expect(meta['jurisleo-a']).toEqual({ h: hash('1'), em: 100 });
    meta = atualizarMeta(s, meta, 200);
    expect(meta['jurisleo-a'].em).toBe(100);
    s.setItem('jurisleo-a', '2');
    meta = atualizarMeta(s, meta, 300);
    expect(meta['jurisleo-a'].em).toBe(300);
  });
});

describe('planear', () => {
  it('num telemóvel novo traz tudo da nuvem', () => {
    const s = storageFalso();
    const { aplicar, enviar } = planear(s, {}, { 'jurisleo-brincadeiras': { v: '{"modoApp":"social"}', em: 50 } });
    expect(aplicar['jurisleo-brincadeiras'].v).toBe('{"modoApp":"social"}');
    expect(enviar).toEqual({});
  });
  it('o que é mais recente aqui sobe, o que é mais recente na nuvem desce', () => {
    const s = storageFalso({ 'jurisleo-a': 'novo', 'jurisleo-b': 'velho' });
    const meta = { 'jurisleo-a': { h: hash('novo'), em: 200 }, 'jurisleo-b': { h: hash('velho'), em: 100 } };
    const remoto = { 'jurisleo-a': { v: 'antigo', em: 150 }, 'jurisleo-b': { v: 'melhor', em: 300 } };
    const { aplicar, enviar } = planear(s, meta, remoto);
    expect(enviar['jurisleo-a'].v).toBe('novo');
    expect(aplicar['jurisleo-b'].v).toBe('melhor');
  });
  it('o que está igual não faz nada', () => {
    const s = storageFalso({ 'jurisleo-a': 'x' });
    const meta = { 'jurisleo-a': { h: hash('x'), em: 10 } };
    expect(planear(s, meta, { 'jurisleo-a': { v: 'x', em: 10 } })).toEqual({ aplicar: {}, enviar: {} });
  });
  it('ignora lixo na nuvem', () => {
    const s = storageFalso();
    expect(planear(s, {}, { 'jurisleo-a': { v: 5, em: 'x' }, 'qualquer': { v: 'a', em: 1 } })).toEqual({ aplicar: {}, enviar: {} });
  });
});

describe('aplicarDaNuvem', () => {
  it('escreve e regista no meta para não voltar a subir', () => {
    const s = storageFalso();
    const meta = aplicarDaNuvem(s, {}, { 'jurisleo-a': { v: 'z', em: 77 } });
    expect(s.getItem('jurisleo-a')).toBe('z');
    expect(planear(s, meta, { 'jurisleo-a': { v: 'z', em: 77 } })).toEqual({ aplicar: {}, enviar: {} });
  });
});
