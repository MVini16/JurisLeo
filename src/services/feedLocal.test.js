import { describe, it, expect } from 'vitest';
import { registoDeHoje, metaAtual, somarResposta, acabouDeCumprirMeta, maisCartas, alternarGuardado, CARTAS_EXTRA } from './feedLocal.js';

describe('registo do dia', () => {
  it('começa a zero num dia novo', () => {
    expect(registoDeHoje({ dia: '2026-10-06', respondidas: 9, extra: 5 }, '2026-10-07')).toEqual({ dia: '2026-10-07', respondidas: 0, extra: 0 });
  });
  it('soma respostas e deteta o momento em que a meta é cumprida', () => {
    let r = registoDeHoje(null, '2026-10-07');
    for (let i = 0; i < 9; i++) r = somarResposta(r, '2026-10-07');
    expect(acabouDeCumprirMeta(r)).toBe(false);
    r = somarResposta(r, '2026-10-07');
    expect(acabouDeCumprirMeta(r)).toBe(true);
    r = somarResposta(r, '2026-10-07');
    expect(acabouDeCumprirMeta(r)).toBe(false);
  });
  it('mais cartas sobe a meta e o fim volta a chegar mais à frente', () => {
    let r = { dia: 'd', respondidas: 10, extra: 0 };
    r = maisCartas(r, 'd');
    expect(metaAtual(r)).toBe(10 + CARTAS_EXTRA);
    expect(acabouDeCumprirMeta({ ...r, respondidas: 15 })).toBe(true);
  });
});

describe('guardados', () => {
  it('guarda e desguarda', () => {
    const a = alternarGuardado([], 'x');
    expect(a).toEqual(['x']);
    expect(alternarGuardado(a, 'x')).toEqual([]);
  });
});
