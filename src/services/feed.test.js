import { describe, it, expect } from 'vitest';
import { gerador, baralhar, sementeDoDia, cartasDeAbertura, misturarEstudo, montarFeed, faltamParaMeta, precisaDeMais, LIMIAR_ATRASO } from './feed.js';

const fc = (n, extra = {}) => ({ id: `f${n}`, cadeiraId: 'familia', nivel: 0, proximaRevisao: null, ...extra });
const vf = (n) => ({ id: `vf${n}`, cadeiraId: 'dip-1' });
const em = (n) => ({ id: `em${n}`, cadeiraId: 'hri' });
const gl = (n, extra = {}) => ({ id: `g${n}`, cadeiraId: 'familia', dominado: false, ...extra });

describe('gerador e baralhar', () => {
  it('a mesma semente dá a mesma ordem', () => {
    const lista = [1, 2, 3, 4, 5, 6];
    expect(baralhar(lista, gerador(5))).toEqual(baralhar(lista, gerador(5)));
  });
  it('não perde nem repete elementos', () => {
    expect(baralhar([1, 2, 3, 4], gerador(9)).sort()).toEqual([1, 2, 3, 4]);
  });
  it('sementes de dias e lotes diferentes são diferentes', () => {
    expect(sementeDoDia('2026-10-07', 0)).not.toBe(sementeDoDia('2026-10-08', 0));
    expect(sementeDoDia('2026-10-07', 0)).not.toBe(sementeDoDia('2026-10-07', 1));
  });
});

describe('cartasDeAbertura', () => {
  it('põe aulas por marcar, alertas, frequência e tarefas, por esta ordem', () => {
    const cartas = cartasDeAbertura({
      aulasPorMarcar: [{ id: 'a1', cadeira: 'familia' }],
      alertasFaltas: [{ cadeiraId: 'hri', semaforo: 'vermelho' }, { cadeiraId: 'dip-1', semaforo: 'verde' }],
      frequencia: { dias: 5, titulo: 'DA I', cadeiraId: 'administrativo-1' },
      tarefas: [{ id: 't1', prazo: '2026-10-08', concluida: false }],
      hoje: '2026-10-07',
    });
    expect(cartas.map((c) => c.tipo)).toEqual(['aula', 'faltas', 'frequencia', 'tarefa']);
  });
  it('ignora frequência longe e alertas verdes', () => {
    const cartas = cartasDeAbertura({ alertasFaltas: [{ cadeiraId: 'x', semaforo: 'verde' }], frequencia: { dias: 40 }, hoje: '2026-10-07' });
    expect(cartas).toEqual([]);
  });
});

describe('misturarEstudo', () => {
  const base = { vf: [1, 2, 3].map(vf), em: [1, 2, 3].map(em), termos: [1, 2, 3].map((n) => gl(n)), hoje: '2026-10-07' };
  it('intercala tipos e respeita o tamanho', () => {
    const { cartas } = misturarEstudo({ ...base, flashcards: [1, 2, 3, 4].map((n) => fc(n)), tamanho: 8 });
    expect(cartas).toHaveLength(8);
    expect(new Set(cartas.map((c) => c.tipo)).size).toBe(4);
  });
  it('dá mais peso aos flashcards quando há muitos prontos', () => {
    const muitos = Array.from({ length: LIMIAR_ATRASO + 2 }, (_, n) => fc(n));
    const r = misturarEstudo({ ...base, flashcards: muitos, tamanho: 8 });
    expect(r.emAtraso).toBe(true);
    expect(r.cartas.filter((c) => c.tipo === 'flashcard').length).toBeGreaterThanOrEqual(5);
  });
  it('sem flashcards usa o resto e não fica preso', () => {
    const r = misturarEstudo({ ...base, flashcards: [], tamanho: 20 });
    expect(r.cartas.length).toBe(9);
    expect(r.cartas.some((c) => c.tipo === 'flashcard')).toBe(false);
  });
  it('não mostra termos já dominados', () => {
    const r = misturarEstudo({ ...base, termos: [gl(1, { dominado: true })], flashcards: [], vf: [], em: [] });
    expect(r.cartas).toEqual([]);
  });
  it('as chaves são únicas e mudam de lote para lote', () => {
    const dados = { ...base, flashcards: [1, 2, 3].map((n) => fc(n)), tamanho: 12 };
    const a = misturarEstudo({ ...dados, lote: 0 }).cartas.map((c) => c.chave);
    const b = misturarEstudo({ ...dados, lote: 1 }).cartas.map((c) => c.chave);
    expect(new Set(a).size).toBe(a.length);
    expect(a.some((k) => b.includes(k))).toBe(false);
  });
  it('flashcards ainda não prontos ficam de fora quando há prontos', () => {
    const futuro = new Date(Date.now() + 5 * 86400000).toISOString();
    const r = misturarEstudo({ ...base, flashcards: [fc(1), fc(2, { proximaRevisao: futuro })], vf: [], em: [], termos: [] });
    expect(r.cartas.map((c) => c.item.id)).toEqual(['f1']);
  });
});

describe('montarFeed', () => {
  it('a abertura só vem no primeiro lote', () => {
    const dados = { flashcards: [fc(1)], aulasPorMarcar: [{ id: 'a1', cadeira: 'familia' }], hoje: '2026-10-07' };
    expect(montarFeed({ ...dados, lote: 0 }).cartas[0].tipo).toBe('aula');
    expect(montarFeed({ ...dados, lote: 1 }).cartas.some((c) => c.tipo === 'aula')).toBe(false);
  });
});

describe('ajudas', () => {
  it('faltamParaMeta nunca é negativo', () => {
    expect(faltamParaMeta(3, 10)).toBe(7);
    expect(faltamParaMeta(12, 10)).toBe(0);
  });
  it('precisaDeMais perto do fim', () => {
    expect(precisaDeMais(10, 12)).toBe(true);
    expect(precisaDeMais(2, 12)).toBe(false);
    expect(precisaDeMais(0, 0)).toBe(false);
  });
});
