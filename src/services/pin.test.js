import { describe, it, expect } from 'vitest';
import {
  pinValido, gerarSal, hashPin, criarCredencial, verificarPin, estadoInicialBloqueio, estaBloqueado, minutosDeBloqueio,
  aposTentativaErrada, sessaoExpirada, lerCredencial, guardarCredencial, lerBloqueio, guardarBloqueio,
  MAX_TENTATIVAS, BLOQUEIO_MS, INATIVIDADE_MS,
} from './pin.js';

function armazenamentoFalso() {
  const dados = {};
  return { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = v; }, dados };
}

describe('pinValido', () => {
  it('só aceita seis dígitos', () => {
    expect(pinValido('123456')).toBe(true);
    for (const mau of ['12345', '1234567', 'abcdef', '12 456', '', null, undefined]) expect(pinValido(mau)).toBe(false);
  });
});

describe('hash e credencial', () => {
  it('o mesmo pin com o mesmo sal dá o mesmo hash; sal diferente, hash diferente', async () => {
    expect(await hashPin('123456', 'abc')).toBe(await hashPin('123456', 'abc'));
    expect(await hashPin('123456', 'abc')).not.toBe(await hashPin('123456', 'abd'));
    expect(await hashPin('123456', 'abc')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('o sal é aleatório', () => {
    expect(gerarSal()).not.toBe(gerarSal());
    expect(gerarSal()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('a credencial não guarda o pin', async () => {
    const c = await criarCredencial('123456');
    expect(JSON.stringify(c)).not.toContain('123456');
  });

  it('verifica o pin certo e recusa o errado ou mal formado', async () => {
    const c = await criarCredencial('123456');
    expect(await verificarPin('123456', c)).toBe(true);
    expect(await verificarPin('654321', c)).toBe(false);
    expect(await verificarPin('12', c)).toBe(false);
    expect(await verificarPin('123456', null)).toBe(false);
  });
});

describe('bloqueio', () => {
  it('as duas primeiras tentativas erradas não bloqueiam; a terceira bloqueia uma hora', () => {
    let e = estadoInicialBloqueio();
    e = aposTentativaErrada(e, 1000);
    expect(estaBloqueado(e, 1000)).toBe(false);
    e = aposTentativaErrada(e, 1000);
    expect(e.tentativas).toBe(MAX_TENTATIVAS - 1);
    e = aposTentativaErrada(e, 1000);
    expect(estaBloqueado(e, 1000)).toBe(true);
    expect(e.bloqueadoAte).toBe(1000 + BLOQUEIO_MS);
  });

  it('desbloqueia quando a hora passa', () => {
    const e = { tentativas: 0, bloqueadoAte: 5000 };
    expect(estaBloqueado(e, 4999)).toBe(true);
    expect(estaBloqueado(e, 5000)).toBe(false);
  });

  it('diz quantos minutos faltam', () => {
    expect(minutosDeBloqueio({ bloqueadoAte: 1000 + 30 * 60000 }, 1000)).toBe(30);
    expect(minutosDeBloqueio({ bloqueadoAte: 0 }, 1000)).toBe(0);
  });
});

describe('inatividade', () => {
  it('expira ao fim de 15 minutos', () => {
    expect(sessaoExpirada(0, INATIVIDADE_MS - 1)).toBe(false);
    expect(sessaoExpirada(0, INATIVIDADE_MS)).toBe(true);
  });
});

describe('armazenamento', () => {
  it('guarda e lê a credencial e o bloqueio', async () => {
    const s = armazenamentoFalso();
    expect(lerCredencial(s)).toBeNull();
    expect(lerBloqueio(s)).toEqual(estadoInicialBloqueio());
    const c = await criarCredencial('123456');
    guardarCredencial(s, c);
    guardarBloqueio(s, { tentativas: 2, bloqueadoAte: 0 });
    expect(lerCredencial(s)).toEqual(c);
    expect(lerBloqueio(s).tentativas).toBe(2);
  });

  it('dados estragados dão o estado inicial', () => {
    const s = armazenamentoFalso();
    s.setItem('jurisleo-consola-pin', '{mau');
    s.setItem('jurisleo-consola-bloqueio', '{mau');
    expect(lerCredencial(s)).toBeNull();
    expect(lerBloqueio(s)).toEqual(estadoInicialBloqueio());
  });
});
