import { describe, it, expect } from 'vitest';
import { montarResumo, lerResumo, juntarResumo, removerResumo, formatarQuando } from './resumoParaVini.js';

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
