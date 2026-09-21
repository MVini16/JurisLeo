import { describe, it, expect } from 'vitest';
import { moduloAtivo, estadoModulos, ordemCartoes, moverCartao } from './modulos.js';
import { MODULOS, ORDEM_CARTOES_DEFEITO, GRUPOS_FERRAMENTAS } from '../data/modulos.js';

describe('moduloAtivo', () => {
  it('sem escolha guardada vale o defeito', () => {
    expect(moduloAtivo('tarefasPendentes', undefined)).toBe(true);
    expect(moduloAtivo('tarefasPendentes', {})).toBe(true);
  });

  it('a escolha guardada manda', () => {
    expect(moduloAtivo('tarefasPendentes', { tarefasPendentes: false })).toBe(false);
  });

  it('os módulos fixos nunca se desligam', () => {
    expect(moduloAtivo('aulaAgora', { aulaAgora: false })).toBe(true);
    expect(moduloAtivo('proximaFrequencia', { proximaFrequencia: false })).toBe(true);
  });

  it('um módulo que não existe está desligado', () => {
    expect(moduloAtivo('inventado', { inventado: true })).toBe(false);
  });

  it('ignora valores que não são verdadeiro/falso', () => {
    expect(moduloAtivo('aulasHoje', { aulasHoje: 'nao' })).toBe(true);
  });
});

describe('estadoModulos', () => {
  it('tem uma entrada por módulo do registo', () => {
    expect(Object.keys(estadoModulos({}))).toHaveLength(MODULOS.length);
  });
});

describe('ordemCartoes', () => {
  it('sem ordem guardada usa a de defeito', () => {
    expect(ordemCartoes(undefined)).toEqual(ORDEM_CARTOES_DEFEITO);
  });

  it('respeita a ordem dela', () => {
    const inversa = [...ORDEM_CARTOES_DEFEITO].reverse();
    expect(ordemCartoes(inversa)).toEqual(inversa);
  });

  it('põe no fim os cartões novos que ela ainda não tinha', () => {
    expect(ordemCartoes(['tarefasPendentes', 'aulasHoje'])).toEqual(['tarefasPendentes', 'aulasHoje', 'aulaAgora', 'proximaFrequencia', 'ferramentas']);
  });

  it('tira ids que já não existem e repetidos', () => {
    expect(ordemCartoes(['lixo', 'aulasHoje', 'aulasHoje'])).toEqual(['aulasHoje', 'aulaAgora', 'proximaFrequencia', 'tarefasPendentes', 'ferramentas']);
  });
});

describe('moverCartao', () => {
  it('sobe e desce um lugar', () => {
    expect(moverCartao(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moverCartao(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
  });

  it('não sai dos limites', () => {
    expect(moverCartao(['a', 'b'], 'a', -1)).toEqual(['a', 'b']);
    expect(moverCartao(['a', 'b'], 'b', 1)).toEqual(['a', 'b']);
  });

  it('não mexe se o id não existe', () => {
    expect(moverCartao(['a', 'b'], 'z', 1)).toEqual(['a', 'b']);
  });
});

describe('ferramentas', () => {
  it('todas têm rota e grupo conhecido, e ids únicos', () => {
    const ferr = MODULOS.filter((m) => m.categoria === 'ferramentas');
    expect(ferr.length).toBeGreaterThan(10);
    for (const m of ferr) {
      expect(m.rota).toMatch(/^\//);
      expect(GRUPOS_FERRAMENTAS).toContain(m.grupo);
    }
    const ids = MODULOS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('as ferramentas vêm ligadas por defeito e desligam-se', () => {
    expect(moduloAtivo('ferrPrazos', {})).toBe(true);
    expect(moduloAtivo('ferrPrazos', { ferrPrazos: false })).toBe(false);
  });
});
