import { describe, it, expect } from 'vitest';
import {
  prontosPorCadeira, totalProntos, tarefasAVencer, desafioDoDia, respondidasHoje, somarRespostas, progressoDaMeta, varianteHojeValida,
} from './hoje.js';

const passado = '2020-01-01';
const futuro = '2999-01-01';
const f = (id, cadeiraId, proximaRevisao = null) => ({ id, cadeiraId, frente: id, tras: id, proximaRevisao });

describe('flashcards prontos', () => {
  const lista = [f('a', 'doi'), f('b', 'doi', passado), f('c', 'df', futuro), f('d', 'df')];
  it('conta por cadeira só os prontos', () => {
    expect(prontosPorCadeira(lista)).toEqual({ doi: 2, df: 1 });
    expect(totalProntos(lista)).toBe(3);
  });
});

describe('tarefasAVencer', () => {
  const t = (prazo, concluida = false) => ({ prazo, concluida });
  it('apanha atrasadas e as dos próximos dias, ignora feitas e sem prazo', () => {
    const r = tarefasAVencer([t('2026-10-05'), t('2026-10-09'), t('2026-10-12'), t('2026-10-08', true), { concluida: false }], '2026-10-07', 3);
    expect(r).toHaveLength(2);
  });
  it('atravessa o fim do mês', () => {
    expect(tarefasAVencer([t('2026-11-01')], '2026-10-30', 3)).toHaveLength(1);
  });
});

describe('desafioDoDia', () => {
  const lista = [f('a', 'doi'), f('b', 'df'), f('c', 'dai')];
  it('é o mesmo durante o dia', () => {
    expect(desafioDoDia(lista, '2026-10-07').id).toBe(desafioDoDia([...lista].reverse(), '2026-10-07').id);
  });
  it('sem flashcards não há desafio', () => {
    expect(desafioDoDia([], '2026-10-07')).toBeNull();
  });
  it('prefere os prontos', () => {
    const l = [f('a', 'x', futuro), f('b', 'x')];
    expect(desafioDoDia(l, '2026-10-07').id).toBe('b');
  });
});

describe('o que ela respondeu hoje', () => {
  it('recomeça a cada dia', () => {
    expect(respondidasHoje({ dia: '2026-10-06', n: 7 }, '2026-10-07')).toBe(0);
    expect(somarRespostas({ dia: '2026-10-06', n: 7 }, '2026-10-07')).toEqual({ dia: '2026-10-07', n: 1 });
    expect(somarRespostas({ dia: '2026-10-07', n: 7 }, '2026-10-07', 3)).toEqual({ dia: '2026-10-07', n: 10 });
    expect(respondidasHoje(null, '2026-10-07')).toBe(0);
  });
  it('progresso da meta fica entre 0 e 1', () => {
    expect(progressoDaMeta(5)).toBe(0.5);
    expect(progressoDaMeta(30)).toBe(1);
    expect(progressoDaMeta(-1)).toBe(0);
  });
});

describe('varianteHojeValida', () => {
  it('cai nos stories se desconhecida', () => {
    expect(varianteHojeValida('barra')).toBe('barra');
    expect(varianteHojeValida('xpto')).toBe('stories');
  });
});
