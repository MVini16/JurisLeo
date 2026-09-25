import { describe, it, expect } from 'vitest';
import { provasNaJanela, passagensFinais, prontosComPassagem } from './passagemFinal.js';

const HOJE = new Date(2026, 11, 1, 10); // terça, 1 de dezembro
const prova = (dia, extra = {}) => ({ id: `p${dia}`, tipo: 'frequencia', titulo: `Freq ${dia}`, cadeira: 'obrigacoes-1', data: new Date(2026, 11, dia, 14), ...extra });
const cartao = (id, extra = {}) => ({ id, cadeiraId: 'obrigacoes-1', nivel: 2, proximaRevisao: new Date(2026, 11, 20), ...extra });

describe('provasNaJanela', () => {
  it('só entram provas de hoje até daqui a 3 dias, com cadeira e não canceladas', () => {
    const eventos = [prova(1), prova(4), prova(5), prova(2, { estado: 'cancelado' }), prova(3, { cadeira: null }), { tipo: 'entrega', data: new Date(2026, 11, 2), cadeira: 'x' }];
    expect(provasNaJanela(eventos, HOJE).map((p) => p.evento.id)).toEqual(['p1', 'p4']);
  });

  it('um evento de vários dias conta uma vez', () => {
    const e = prova(3, { dataOriginal: new Date(2026, 11, 3) });
    expect(provasNaJanela([e, { ...e, data: new Date(2026, 11, 4) }], HOJE)).toHaveLength(1);
  });
});

describe('passagensFinais', () => {
  it('reparte os cartões por ver pelos dias que faltam, os mais difíceis primeiro', () => {
    const cartoes = [
      cartao('a', { nivel: 3 }), cartao('b', { nivel: 0 }), cartao('c', { nivel: 1 }), cartao('d'), cartao('e'),
      cartao('visto', { ultimaRevisaoEm: new Date(2026, 11, 1, 8) }),
      cartao('outra', { cadeiraId: 'familia' }),
    ];
    const [p] = passagensFinais(cartoes, [prova(4)], HOJE); // daqui a 3 dias
    expect(p).toMatchObject({ diasAte: 3, total: 6, vistos: 1, porVer: 5 });
    expect(p.hoje.map((f) => f.id)).toEqual(['b', 'c']); // 5 por 3 dias → 2 hoje
  });

  it('uma revisão antes da janela não conta como vista', () => {
    const [p] = passagensFinais([cartao('a', { ultimaRevisaoEm: new Date(2026, 10, 25) })], [prova(4)], HOJE);
    expect(p.porVer).toBe(1);
  });

  it('no dia da prova vai tudo o que falta', () => {
    const cartoes = ['a', 'b', 'c'].map((id) => cartao(id));
    const [p] = passagensFinais(cartoes, [prova(1)], HOJE);
    expect(p.hoje).toHaveLength(3);
  });
});

describe('prontosComPassagem', () => {
  it('junta os prontos normais aos da passagem final, sem repetir', () => {
    const cartoes = [cartao('pronto', { proximaRevisao: new Date(2026, 10, 1) }), cartao('b', { nivel: 0 }), cartao('c')];
    const ids = prontosComPassagem(cartoes, [prova(2)], HOJE).map((f) => f.id);
    expect(ids).toEqual(['pronto', 'b', 'c']);
    expect(prontosComPassagem(cartoes, [], HOJE).map((f) => f.id)).toEqual(['pronto']);
  });
});
