import { describe, it, expect } from 'vitest';
import { diaDe, serializar, desserializar, partir, copiasAApagar, resumir, pareceVazia, descreverResumo, MANTER_DIAS } from './cofre.js';

describe('descreverResumo', () => {
  it('diz em palavras o que há, no singular e no plural', () => {
    expect(descreverResumo({ presencas: 14, notasAulas: 1, notas: 0 })).toBe('14 aulas marcadas, 1 sumário');
  });
  it('sem nada dela, diz isso', () => {
    expect(descreverResumo({ cadeiras: 5 })).toBe('só as cadeiras, ainda sem nada teu');
  });
});

// um timestamp falso com a mesma forma que o do firestore
function ts(seconds, nanoseconds = 0) {
  return { seconds, nanoseconds, toMillis: () => seconds * 1000 + Math.floor(nanoseconds / 1e6), toDate: () => new Date(seconds * 1000) };
}

describe('diaDe', () => {
  it('dá o dia no formato AAAA-MM-DD com zeros', () => {
    expect(diaDe(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('serializar e desserializar', () => {
  it('guarda as datas do firestore e volta a criá-las', () => {
    const texto = serializar({ a: ts(100, 5), lista: [{ b: ts(7) }], nome: 'Nô' });
    const criadas = [];
    const volta = desserializar(texto, (s, n) => { criadas.push([s, n]); return `TS(${s},${n})`; });
    expect(volta).toEqual({ a: 'TS(100,5)', lista: [{ b: 'TS(7,0)' }], nome: 'Nô' });
    expect(criadas).toHaveLength(2);
  });

  it('guarda datas normais como datas', () => {
    const volta = desserializar(serializar({ d: new Date('2026-10-07T10:00:00Z') }), () => null);
    expect(volta.d).toBeInstanceOf(Date);
    expect(volta.d.toISOString()).toBe('2026-10-07T10:00:00.000Z');
  });

  it('não confunde um objeto normal com uma data', () => {
    const volta = desserializar(serializar({ x: { __ts: [1, 2], outra: 1 } }), () => 'mal');
    expect(volta.x).toEqual({ __ts: [1, 2], outra: 1 });
  });
});

describe('partir', () => {
  it('parte e volta a juntar igual', () => {
    const texto = 'abcdefghij'.repeat(25);
    const partes = partir(texto, 40);
    expect(partes).toHaveLength(7);
    expect(partes.join('')).toBe(texto);
  });
  it('um texto vazio dá uma parte vazia', () => {
    expect(partir('')).toEqual(['']);
  });
});

describe('copiasAApagar', () => {
  it('mantém as mais recentes e apaga as antigas', () => {
    const ids = Array.from({ length: MANTER_DIAS + 3 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
    expect(copiasAApagar(ids)).toEqual(['2026-09-03', '2026-09-02', '2026-09-01']);
  });
  it('com poucas cópias não apaga nada', () => {
    expect(copiasAApagar(['2026-10-01', '2026-10-02'])).toEqual([]);
  });
  it('das cópias especiais guarda no máximo 5', () => {
    const extras = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((l) => `2026-10-01-antes-${l}`);
    expect(copiasAApagar(extras)).toHaveLength(2);
  });
});

describe('resumir e pareceVazia', () => {
  const dados = {
    cadeiras: [{ id: 'familia', presencas: { marcas: { a: 1, b: 2 }, notasAulas: { a: 1 } } }, { id: 'hri' }],
    anotacoes: [{}, {}], tarefas: [{}], flashcards: [], eventos: [{}], casos: [], sessoesEstudo: [{}],
    configuracoes: { copiaLocal: { 'jurisleo-jogos': {} } },
  };
  it('conta tudo', () => {
    expect(resumir(dados)).toEqual({ cadeiras: 2, presencas: 2, notasAulas: 1, notas: 2, tarefas: 1, flashcards: 0, eventos: 1, casos: 0, estudo: 1, definicoes: 1 });
  });
  it('só cadeiras e nada mais é uma cópia vazia', () => {
    expect(pareceVazia(resumir({ cadeiras: [{}, {}] }))).toBe(true);
    expect(pareceVazia(resumir(dados))).toBe(false);
  });
});
