import { describe, it, expect } from 'vitest';
import { normalizar, fichaVazia, limparFicha, validarFicha, filtrarFichas, ordenarFichas, contactosParaFalar, passosDaChecklist } from './fichas.js';
import { TIPOS_FICHA, tipoDeFicha } from '../data/fichas.js';

describe('dados dos tipos', () => {
  it('todos os tipos têm um campo título obrigatório e ids únicos', () => {
    const ids = TIPOS_FICHA.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TIPOS_FICHA) {
      expect(t.campos.find((c) => c.id === 'titulo')?.obrigatorio).toBe(true);
      const campos = t.campos.map((c) => c.id);
      expect(new Set(campos).size).toBe(campos.length);
      for (const r of t.resumo) expect(campos).toContain(r);
      for (const c of t.campos.filter((x) => x.tipo === 'escolha')) expect(c.opcoes.length).toBeGreaterThan(1);
    }
  });

  it('tipoDeFicha devolve nulo para um tipo desconhecido', () => {
    expect(tipoDeFicha('inventado')).toBeNull();
  });
});

describe('normalizar', () => {
  it('tira acentos e maiúsculas', () => {
    expect(normalizar('Responsabilidade Civíl')).toBe('responsabilidade civil');
    expect(normalizar(null)).toBe('');
  });
});

describe('fichaVazia e limparFicha', () => {
  it('a ficha vazia tem todos os campos', () => {
    const f = fichaVazia('erros');
    expect(Object.keys(f)).toEqual(tipoDeFicha('erros').campos.map((c) => c.id));
    expect(Object.values(f).every((v) => v === '')).toBe(true);
  });

  it('limpar tira espaços e campos que não existem', () => {
    const l = limparFicha('erros', { titulo: '  erro  ', lixo: 'x', onde: 'Aula' });
    expect(l.titulo).toBe('erro');
    expect(l.lixo).toBeUndefined();
    expect(l.onde).toBe('Aula');
    expect(l.certo).toBe('');
  });
});

describe('validarFicha', () => {
  it('pede o que é obrigatório', () => {
    expect(validarFicha('erros', { titulo: '   ' }).titulo).toMatch(/O que errei/);
    expect(validarFicha('erros', { titulo: 'x' })).toEqual({});
  });

  it('recusa uma opção que não existe', () => {
    expect(validarFicha('erros', { titulo: 'x', onde: 'Lua' }).onde).toBeDefined();
    expect(validarFicha('erros', { titulo: 'x', onde: 'Aula' })).toEqual({});
  });

  it('um tipo desconhecido dá erro', () => {
    expect(validarFicha('nada', {}).tipo).toBeDefined();
  });
});

describe('filtrarFichas', () => {
  const fichas = [
    { id: 1, titulo: 'Responsabilidade civil', cadeiraId: 'a' },
    { id: 2, titulo: 'Acto administrativo', cadeiraId: 'b', notas: 'discricionariedade' },
  ];

  it('pesquisa em todos os campos, sem acentos', () => {
    expect(filtrarFichas(fichas, { texto: 'DISCRICIONARIEDADE' }).map((f) => f.id)).toEqual([2]);
    expect(filtrarFichas(fichas, { texto: 'responsabilidade' }).map((f) => f.id)).toEqual([1]);
  });

  it('filtra por cadeira', () => {
    expect(filtrarFichas(fichas, { cadeiraId: 'b' }).map((f) => f.id)).toEqual([2]);
    expect(filtrarFichas(fichas, {}).length).toBe(2);
  });
});

describe('ordenarFichas', () => {
  it('mais recentes primeiro; o que ainda não chegou ao servidor fica no topo', () => {
    const r = ordenarFichas([{ id: 'a', atualizadaEm: 100 }, { id: 'b', atualizadaEm: 300 }, { id: 'c', atualizadaEm: null }, { id: 'd', atualizadaEm: { toMillis: () => 200 } }]);
    expect(r.map((f) => f.id)).toEqual(['c', 'b', 'd', 'a']);
  });
});

describe('contactosParaFalar', () => {
  const hoje = new Date(2026, 8, 23, 12);
  it('devolve os que já chegaram à data, por ordem', () => {
    const c = contactosParaFalar([
      { id: 1, tipo: 'contactos', voltarFalar: '2026-09-23' },
      { id: 2, tipo: 'contactos', voltarFalar: '2026-09-01' },
      { id: 3, tipo: 'contactos', voltarFalar: '2026-10-01' },
      { id: 4, tipo: 'contactos', voltarFalar: '' },
      { id: 5, tipo: 'erros', voltarFalar: '2026-09-01' },
    ], hoje);
    expect(c.map((x) => x.id)).toEqual([2, 1]);
  });
});

describe('passosDaChecklist', () => {
  it('uma linha por passo, sem marcadores nem linhas vazias', () => {
    expect(passosDaChecklist({ passos: '- rever prazos\n\n* conferir factos\n  assinar  ' })).toEqual(['rever prazos', 'conferir factos', 'assinar']);
    expect(passosDaChecklist({})).toEqual([]);
  });
});
