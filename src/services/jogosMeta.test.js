import { describe, it, expect } from 'vitest';
import {
  nivelDeCarreira, LIMIARES_XP, xpBase, XP_PERFEITA, sortearCaixa, CAIXA, probabilidadeDeSelo, sortearSelo, aplicarJogada, perfilVazio,
  aleatorioComSemente, audienciaDoDia, mensagemQuase, pausaSugerida, conquistasDesbloqueadas, CONQUISTAS,
} from './jogosMeta.js';
import { SELOS } from '../data/selos.js';
import { ESCOLHA_MULTIPLA } from '../data/jogos.js';
import { ESCADA } from './jogos.js';

describe('nível de carreira', () => {
  it('começa em Caloira e sobe nos limiares', () => {
    expect(nivelDeCarreira(0).titulo).toBe(ESCADA[0]);
    expect(nivelDeCarreira(149).indice).toBe(0);
    expect(nivelDeCarreira(150).titulo).toBe(ESCADA[1]);
    expect(nivelDeCarreira(150).xpNoNivel).toBe(0);
  });
  it('diz quanto falta e a fração dentro do nível', () => {
    const n = nivelDeCarreira(200);
    expect(n.xpParaProximo).toBe(400 - 200);
    expect(n.fracao).toBeCloseTo(50 / 250);
    expect(n.proximoTitulo).toBe(ESCADA[2]);
  });
  it('no último nível não há próximo', () => {
    const n = nivelDeCarreira(99999);
    expect(n.indice).toBe(9);
    expect(n.proximoTitulo).toBeNull();
    expect(n.fracao).toBe(1);
  });
  it('tem um limiar por título', () => {
    expect(LIMIARES_XP).toHaveLength(ESCADA.length);
  });
});

describe('xp e caixa de despachos', () => {
  it('xp é metade dos pontos, com mínimo e bónus', () => {
    expect(xpBase(100)).toBe(50);
    expect(xpBase(0)).toBe(5);
    expect(xpBase(100, true)).toBe(50 + XP_PERFEITA);
  });
  it('a caixa devolve cada prémio conforme o sorteio e o total dos pesos é 100', () => {
    expect(CAIXA.reduce((s, c) => s + c.peso, 0)).toBe(100);
    expect(sortearCaixa(() => 0).multiplicador).toBe(1);
    expect(sortearCaixa(() => 0.6).multiplicador).toBe(2);
    expect(sortearCaixa(() => 0.9).multiplicador).toBe(3);
    expect(sortearCaixa(() => 0.999).multiplicador).toBe(5);
  });
  it('os prémios maiores são mesmo mais raros', () => {
    let somas = { 1: 0, 5: 0 };
    const rng = aleatorioComSemente('teste');
    for (let i = 0; i < 4000; i += 1) { const m = sortearCaixa(rng).multiplicador; if (m === 1 || m === 5) somas[m] += 1; }
    expect(somas[1]).toBeGreaterThan(somas[5] * 8);
  });
});

describe('selos', () => {
  it('ids únicos e textos sem travessões ou emojis', () => {
    expect(new Set(SELOS.map((s) => s.id)).size).toBe(SELOS.length);
    SELOS.forEach((s) => {
      expect(`${s.latim}${s.significado}`).not.toMatch(/[–—]/);
      expect(`${s.latim}${s.significado}`).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(['comum', 'raro', 'lendario']).toContain(s.raridade);
    });
  });
  it('sorteia só selos que ainda não tem e devolve null quando acabou', () => {
    const tem = SELOS.slice(0, SELOS.length - 1).map((s) => s.id);
    expect(sortearSelo(tem, () => 0.5).id).toBe(SELOS[SELOS.length - 1].id);
    expect(sortearSelo(SELOS.map((s) => s.id))).toBeNull();
  });
  it('a probabilidade sobe com o desempenho e tem teto', () => {
    expect(probabilidadeDeSelo({})).toBeCloseTo(0.3);
    expect(probabilidadeDeSelo({ perfeita: true })).toBeGreaterThan(probabilidadeDeSelo({}));
    expect(probabilidadeDeSelo({ perfeita: true, novoRecorde: true, diario: true })).toBe(0.9);
  });
});

describe('audiência do dia', () => {
  it('é igual durante o dia e muda de dia para dia', () => {
    const a = audienciaDoDia(ESCOLHA_MULTIPLA, '2026-10-07').map((p) => p.id);
    const b = audienciaDoDia(ESCOLHA_MULTIPLA, '2026-10-07').map((p) => p.id);
    const c = audienciaDoDia(ESCOLHA_MULTIPLA, '2026-10-08').map((p) => p.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
    expect(a).not.toEqual(c);
  });
  it('as opções baralhadas mantêm a certa', () => {
    audienciaDoDia(ESCOLHA_MULTIPLA, '2026-10-07').forEach((p) => {
      const original = ESCOLHA_MULTIPLA.find((o) => o.id === p.id);
      expect(p.opcoes[p.certa]).toBe(original.opcoes[original.certa]);
    });
  });
  it('o gerador com semente repete', () => {
    const r1 = aleatorioComSemente('x'); const r2 = aleatorioComSemente('x');
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });
});

describe('mensagens e pausa', () => {
  it('dá mensagens conforme a distância ao recorde', () => {
    expect(mensagemQuase({ pontos: 200, melhor: 150, novoRecorde: true })).toContain('Recorde');
    expect(mensagemQuase({ pontos: 95, melhor: 100 })).toContain('Faltaram só 5');
    expect(mensagemQuase({ pontos: 75, melhor: 100 })).toContain('perto');
    expect(mensagemQuase({ pontos: 10, melhor: 100 })).toContain('próxima');
    expect(mensagemQuase({ pontos: 10, melhor: 0 })).toContain('Primeira');
  });
  it('sugere pausa aos 25 minutos', () => {
    expect(pausaSugerida(24)).toBe(false);
    expect(pausaSugerida(25)).toBe(true);
  });
});

describe('conquistas', () => {
  it('desbloqueiam com o estado', () => {
    const vazio = { jogadas: 0, perfeitas: 0, selos: 0, audiencias: 0, nivel: 0 };
    expect(conquistasDesbloqueadas(vazio)).toEqual([]);
    expect(conquistasDesbloqueadas({ ...vazio, jogadas: 10, perfeitas: 1, nivel: 3 })).toEqual(['primeira', 'dez', 'perfeita', 'advogada']);
    expect(CONQUISTAS.map((c) => c.id)).toContain('selos-todos');
  });
});

describe('aplicarJogada', () => {
  const sempre = (v) => () => v;
  it('soma o XP com a caixa e conta a jogada', () => {
    const r = aplicarJogada(perfilVazio(), { pontos: 100, hoje: '2026-10-07' }, sempre(0.99));
    // aleatório 0.99: caixa x5 e selo recusado (0.99 > probabilidade)
    expect(r.caixa.multiplicador).toBe(5);
    expect(r.xpGanho).toBe(50 * 5);
    expect(r.selo).toBeNull();
    expect(r.perfil.jogadas).toBe(1);
    expect(r.conquistasNovas).toContain('primeira');
  });
  it('dá selo quando o sorteio calha, e nunca repete', () => {
    const r1 = aplicarJogada(perfilVazio(), { pontos: 50, hoje: 'h' }, sempre(0));
    expect(r1.selo).not.toBeNull();
    const r2 = aplicarJogada(r1.perfil, { pontos: 50, hoje: 'h' }, sempre(0));
    expect(r2.selo.id).not.toBe(r1.selo.id);
  });
  it('a audiência do dia só dá o bónus uma vez por dia', () => {
    const a = aplicarJogada(perfilVazio(), { pontos: 40, diario: true, hoje: '2026-10-07' }, sempre(0.99));
    expect(a.bonusDiario).toBe(100);
    const b = aplicarJogada(a.perfil, { pontos: 40, diario: true, hoje: '2026-10-07' }, sempre(0.99));
    expect(b.bonusDiario).toBe(0);
    const c = aplicarJogada(b.perfil, { pontos: 40, diario: true, hoje: '2026-10-08' }, sempre(0.99));
    expect(c.bonusDiario).toBe(100);
    expect(c.perfil.audiencias).toBe(2);
  });
  it('sobe de nível e diz que subiu', () => {
    const r = aplicarJogada({ ...perfilVazio(), xp: 140 }, { pontos: 100, perfeita: true, hoje: 'h' }, sempre(0.99));
    expect(r.subiuDeNivel).toBe(true);
    expect(r.nivelDepois.indice).toBeGreaterThan(r.nivelAntes.indice);
  });
  it('as conquistas novas só aparecem uma vez', () => {
    const r1 = aplicarJogada(perfilVazio(), { pontos: 10, hoje: 'h' }, sempre(0.99));
    const r2 = aplicarJogada(r1.perfil, { pontos: 10, hoje: 'h' }, sempre(0.99));
    expect(r2.conquistasNovas).not.toContain('primeira');
  });
});
