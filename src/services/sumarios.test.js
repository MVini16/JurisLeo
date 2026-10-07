import { describe, it, expect } from 'vitest';
import { topicosDe, listarSumarios, filtrarSumarios, contarPorCadeira, cartaoDaAula, cartaoDoTopico, sumariosParaTexto, dataBonita } from './sumarios.js';

const mapa = {
  familia: {
    a_2026_10_05: { sumario: 'Casamento\nEfeitos pessoais', nota: '', tpc: 'Ler o art. 1672.º', duvida: '', data: '2026-10-05', titulo: 'FAM · Prática', cadeiraId: 'familia' },
    vazio: { sumario: '', nota: '', tpc: '', duvida: '' },
  },
  'dip-1': { b: { sumario: 'Fontes do DIP', data: '2026-10-07', titulo: 'DIP I · Prática', cadeiraId: 'dip-1' } },
};

describe('sumarios', () => {
  it('topicosDe ignora linhas vazias', () => {
    expect(topicosDe('a\n\n  b  \n')).toEqual(['a', 'b']);
  });
  it('listarSumarios ordena da mais recente e ignora os vazios', () => {
    const l = listarSumarios(mapa);
    expect(l.map((i) => i.cadeiraId)).toEqual(['dip-1', 'familia']);
  });
  it('filtra por cadeira e pesquisa', () => {
    const l = listarSumarios(mapa);
    expect(filtrarSumarios(l, { cadeiraId: 'familia' })).toHaveLength(1);
    expect(filtrarSumarios(l, { pesquisa: 'fontes' })).toHaveLength(1);
    expect(filtrarSumarios(l, { pesquisa: 'xyz' })).toHaveLength(0);
  });
  it('contarPorCadeira', () => {
    expect(contarPorCadeira(listarSumarios(mapa))).toEqual({ 'dip-1': 1, familia: 1 });
  });
  it('um cartão por aula com os tópicos', () => {
    const c = cartaoDaAula(listarSumarios(mapa)[1]);
    expect(c.frente).toContain('FAM · Prática');
    expect(c.tras).toBe('- Casamento\n- Efeitos pessoais');
    expect(cartaoDaAula({ topicos: [] })).toBeNull();
  });
  it('o cartão de um tópico só existe com resposta', () => {
    const item = listarSumarios(mapa)[0];
    expect(cartaoDoTopico(item, 'Fontes do DIP', '  ')).toBeNull();
    expect(cartaoDoTopico(item, 'Fontes do DIP', 'Tratados, costume...').tras).toBe('Tratados, costume...');
  });
  it('texto para partilhar', () => {
    const t = sumariosParaTexto(listarSumarios(mapa));
    expect(t).toContain('Sumário:\n- Fontes do DIP');
    expect(t).toContain('Trabalho para casa: Ler o art. 1672.º');
  });
  it('dataBonita', () => {
    expect(dataBonita('2026-10-05')).toBe('05-10-2026');
    expect(dataBonita('')).toBe('Sem data');
  });
});
