import { describe, it, expect } from 'vitest';
import { escolherSemRepetir, reunirFrases, legendaDaFrase } from './citacoes.js';
import { citacoes } from '../data/citacoes.js';

describe('dados das citações', () => {
  it('todas têm texto, autor, fonte e um nível de verificação conhecido, com id único', () => {
    const ids = citacoes.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of citacoes) {
      expect(c.texto.length).toBeGreaterThan(5);
      expect(c.autor).toBeTruthy();
      expect(c.fonte?.nome).toBeTruthy();
      expect(['primaria', 'tradicao', 'wikiquote']).toContain(c.verificacao);
    }
  });

  it('as de séries têm ligação para a fonte e são curtas', () => {
    for (const c of citacoes.filter((x) => x.origem === 'serie')) {
      expect(c.fonte.url).toMatch(/^https:\/\//);
      expect(c.texto.split(/\s+/).length).toBeLessThanOrEqual(25);
      expect(c.pt).toBeUndefined(); // nunca se traduz uma fala como se fosse a fala
    }
  });

  it('as de direito romano têm a referência ao Digesto ou à obra', () => {
    for (const c of citacoes.filter((x) => x.verificacao === 'primaria')) expect(c.fonte.nome).toMatch(/Digesto|Pro Cluentio/);
  });
});

describe('escolherSemRepetir', () => {
  const ids = ['a', 'b', 'c', 'd'];

  it('não repete nenhuma antes de todas terem saído', () => {
    let saidas = [];
    const vistas = [];
    for (let i = 0; i < 4; i++) {
      const r = escolherSemRepetir(ids, saidas);
      vistas.push(r.escolhida);
      saidas = r.saidas;
    }
    expect(new Set(vistas).size).toBe(4);
  });

  it('quando acabam, recomeça sem repetir a última de seguida', () => {
    const r = escolherSemRepetir(ids, ['a', 'b', 'c', 'd'], () => 0);
    expect(r.escolhida).not.toBe('d');
    expect(r.saidas).toEqual([r.escolhida]);
  });

  it('ignora ids que já não existem', () => {
    const r = escolherSemRepetir(['a', 'b'], ['zzz', 'a'], () => 0);
    expect(r.escolhida).toBe('b');
    expect(r.saidas).toEqual(['a', 'b']);
  });

  it('lista vazia não escolhe nada; uma só frase repete-se por força', () => {
    expect(escolherSemRepetir([], ['a']).escolhida).toBeNull();
    expect(escolherSemRepetir(['a'], ['a']).escolhida).toBe('a');
  });

  it('com muitas frases percorre-as todas antes de repetir', () => {
    const muitas = Array.from({ length: 500 }, (_, i) => `f${i}`);
    let saidas = [];
    const vistas = new Set();
    for (let i = 0; i < 500; i++) {
      const r = escolherSemRepetir(muitas, saidas);
      vistas.add(r.escolhida);
      saidas = r.saidas;
    }
    expect(vistas.size).toBe(500);
  });
});

describe('reunirFrases', () => {
  const originais = ['frase nossa'];
  const cits = [
    { id: 'x', texto: 'texto x', autor: 'A', fonte: { nome: 'Digesto' }, origem: 'direito' },
    { id: 'y', texto: 'texto y', autor: 'B', fonte: { nome: 'Suits' }, origem: 'serie' },
    { id: 'z', texto: 'sem fonte', autor: 'C', origem: 'direito' },
  ];

  it('misto junta as nossas e as citações com fonte', () => {
    expect(reunirFrases({ originais, citacoes: cits }).map((f) => f.id)).toEqual(['o:frase nossa', 'c:x', 'c:y']);
  });

  it('só originais, ou só citações', () => {
    expect(reunirFrases({ originais, citacoes: cits, modo: 'originais' })).toHaveLength(1);
    expect(reunirFrases({ originais, citacoes: cits, modo: 'citacoes' }).map((f) => f.id)).toEqual(['c:x', 'c:y']);
  });

  it('desligar as séries tira só as de séries', () => {
    expect(reunirFrases({ originais, citacoes: cits, series: false }).map((f) => f.id)).toEqual(['o:frase nossa', 'c:x']);
  });

  it('sem citações, o modo só-citações cai nas nossas', () => {
    expect(reunirFrases({ originais, citacoes: [], modo: 'citacoes' })).toHaveLength(1);
  });
});

describe('legendaDaFrase', () => {
  it('cita o autor e a fonte; as nossas não levam legenda', () => {
    expect(legendaDaFrase({ citacao: true, autor: 'Ulpiano', fonte: { nome: 'Digesto 1.1.10' } })).toBe('Ulpiano, Digesto 1.1.10');
    expect(legendaDaFrase({ citacao: false })).toBe('');
  });
});
