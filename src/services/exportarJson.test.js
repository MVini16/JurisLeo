import { describe, it, expect } from 'vitest';
import { limparParaJson, COLECOES_BACKUP } from './exportarJson.js';

describe('limparParaJson', () => {
  it('converte timestamps (com toDate) e Dates em texto iso, a qualquer profundidade', () => {
    const ts = { seconds: 1, nanoseconds: 0, toDate: () => new Date('2026-09-25T10:00:00Z'), toJSON: () => ({ seconds: 1 }) };
    const r = limparParaJson({ criadoEm: ts, lista: [{ quando: new Date('2026-01-01T00:00:00Z') }], n: 3, vazio: undefined });
    expect(r).toEqual({ criadoEm: '2026-09-25T10:00:00.000Z', lista: [{ quando: '2026-01-01T00:00:00.000Z' }], n: 3, vazio: null });
    expect(JSON.parse(JSON.stringify(r)).criadoEm).toBe('2026-09-25T10:00:00.000Z');
  });

  it('o backup inclui as coleções que antes ficavam de fora', () => {
    for (const c of ['faltasRegisto', 'estadosAula', 'flashcards', 'fichas', 'registosDiarios', 'sumarios', 'topicosCorrecao', 'mapasMentais', 'frequencias', 'caixaEntrada']) {
      expect(COLECOES_BACKUP).toContain(c);
    }
  });
});
