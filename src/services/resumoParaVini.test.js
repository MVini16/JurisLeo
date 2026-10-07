import { describe, it, expect } from 'vitest';
import { montarResumo, lerResumo, juntarResumo, removerResumo, formatarQuando, estudoDaSemana, melhorSerie, contarTarefas } from './resumoParaVini.js';

const quando = new Date(2026, 9, 7, 9, 40);
const dados = { serie: 4, cartoesHoje: 12, perfilJogos: { xp: 0, selos: ['a', 'b'], jogadas: 7 }, estado: 'cansada' };

describe('o resumo que ela manda ao Vini', () => {
  it('formata a data em DD-MM-AAAA', () => {
    expect(formatarQuando(quando)).toBe('07-10-2026 09:40');
  });

  it('só inclui o que ela deixou ligado', () => {
    const nada = montarResumo({ quando, escolhas: { estudo: false, jogos: false, estado: false }, dados });
    expect(nada).not.toMatch(/Estudo|Jogos|Como estou/);
    const tudo = montarResumo({ quando, escolhas: { estudo: true, jogos: true, estado: true }, dados });
    expect(tudo).toContain('Estudo: 4 dias seguidos, 12 flashcards hoje');
    expect(tudo).toContain('2 selos, 7 jogadas');
    expect(tudo).toContain('Como estou: cansada');
  });

  it('não diz como está se ela não escolheu nenhum estado', () => {
    const t = montarResumo({ quando, escolhas: { estudo: false, jogos: false, estado: true }, dados: { ...dados, estado: '' } });
    expect(t).not.toContain('Como estou');
  });

  it('lê de volta o que montou, mesmo com texto à volta', () => {
    const t = montarResumo({ quando, escolhas: { estudo: true, jogos: true, estado: true }, dados });
    const r = lerResumo(`Olá Vini!\n${t}\nbeijinho`);
    expect(r).toMatchObject({ quando: '07-10-2026 09:40', estado: 'cansada' });
    expect(r.estudo).toContain('4 dias');
  });

  it('texto que não é um resumo não entra', () => {
    expect(lerResumo('boa noite')).toBeNull();
    expect(lerResumo('')).toBeNull();
    expect(lerResumo(null)).toBeNull();
  });

  it('não repete o mesmo resumo e consegue apagar', () => {
    const r = lerResumo(montarResumo({ quando, escolhas: { estudo: true, jogos: false, estado: false }, dados }));
    const um = juntarResumo([], r);
    expect(juntarResumo(um, r)).toHaveLength(1);
    expect(removerResumo(um, um[0].id)).toEqual([]);
  });
});

describe('mais detalhe, sempre por escolha dela', () => {
  it('conta os dias da semana e a melhor série', () => {
    const dias = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06', '2026-10-07', '2026-09-01'];
    expect(estudoDaSemana(dias, '2026-10-07')).toBe(6);
    expect(melhorSerie(dias)).toBe(3);
    expect(melhorSerie([])).toBe(0);
  });

  it('conta as tarefas por fazer, atrasadas e feitas', () => {
    const t = [{ concluida: true }, { concluida: false, prazo: '2026-10-01' }, { concluida: false, prazo: '2026-10-20' }, { concluida: false }];
    expect(contarTarefas(t, '2026-10-07')).toEqual({ porFazer: 3, atrasadas: 1, feitas: 1 });
  });

  it('só põe tarefas, recordes e detalhe de estudo se ela ligou', () => {
    const dados = { serie: 2, diasNaSemana: 5, melhorSerie: 9, cartoesHoje: 3, perfilJogos: { xp: 10, selos: [], jogadas: 1, perfeitas: 0, audiencias: 0 }, recordes: { vf: 12, caso: 0 }, tarefas: { porFazer: 2, atrasadas: 1, feitas: 4 } };
    const tudo = montarResumo({ quando, escolhas: { estudo: true, jogos: true, estado: false, tarefas: true }, dados });
    expect(tudo).toContain('estudou 5 dos últimos 7 dias');
    expect(tudo).toContain('melhor série 9 dias');
    expect(tudo).toContain('Recordes: Verdadeiro ou Falso 12');
    expect(tudo).not.toContain('Caso Prático');
    expect(tudo).toContain('Tarefas: 2 por fazer, 1 atrasadas, 4 feitas');
    const nada = montarResumo({ quando, escolhas: { estudo: false, jogos: false, estado: false, tarefas: false }, dados });
    expect(nada).not.toMatch(/Tarefas|Recordes|Estudo|Jogos/);
    expect(lerResumo(tudo)).toMatchObject({ tarefas: '2 por fazer, 1 atrasadas, 4 feitas' });
  });
});
