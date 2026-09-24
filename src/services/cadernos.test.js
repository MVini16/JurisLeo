import { describe, it, expect } from 'vitest';
import {
  DIVISORIAS_BASE, divisoriasDaCadeira, divisoriaDaAnotacao, paginasDaDivisoria, contarPaginas,
  ultimaEditada, criarDivisoria, moverPagina, ordemNova,
} from './cadernos.js';

// timestamp falso com toMillis, como o do firestore
const ts = (ms) => ({ toMillis: () => ms });

const ANOTACOES = [
  { id: 'a', cadeiraId: 'do', tipo: 'teorica', criadoEm: ts(3), atualizadoEm: ts(30) },
  { id: 'b', cadeiraId: 'do', tipo: 'pratica', criadoEm: ts(1), atualizadoEm: ts(10) },
  { id: 'c', cadeiraId: 'do', divisoria: 'cap-1', ordem: 0, criadoEm: ts(5), atualizadoEm: ts(50) },
  { id: 'd', cadeiraId: 'do', tipo: 'teorica', ordem: 0, criadoEm: ts(9), atualizadoEm: ts(20) },
  { id: 'e', cadeiraId: 'da', tipo: 'teorica', criadoEm: ts(2), atualizadoEm: ts(5) },
  { id: 'f', cadeiraId: 'do', divisoria: 'apagada', criadoEm: ts(0), atualizadoEm: ts(1) },
];

describe('divisórias', () => {
  it('as de base vêm sempre primeiro, depois as dela, sem repetidos nem lixo', () => {
    const guardadas = { do: [{ id: 'cap-1', nome: 'Cap. 1' }, { id: 'teoricas', nome: 'duplicada' }, { nome: 'sem id' }] };
    expect(divisoriasDaCadeira(guardadas, 'do').map((d) => d.id)).toEqual(['teoricas', 'praticas', 'cap-1']);
    expect(divisoriasDaCadeira(undefined, 'do')).toEqual(DIVISORIAS_BASE);
  });

  it('anotação antiga cai pelo tipo', () => {
    expect(divisoriaDaAnotacao({ tipo: 'pratica' })).toBe('praticas');
    expect(divisoriaDaAnotacao({ tipo: 'teorica' })).toBe('teoricas');
    expect(divisoriaDaAnotacao({})).toBe('teoricas');
    expect(divisoriaDaAnotacao({ divisoria: 'cap-1', tipo: 'pratica' })).toBe('cap-1');
  });
});

describe('paginasDaDivisoria', () => {
  const divs = [...DIVISORIAS_BASE, { id: 'cap-1', nome: 'Cap. 1' }];

  it('ordem escolhida primeiro, depois data de criação; página de divisória apagada vai para as teóricas', () => {
    expect(paginasDaDivisoria(ANOTACOES, 'do', 'teoricas', divs).map((a) => a.id)).toEqual(['d', 'f', 'a']);
    expect(paginasDaDivisoria(ANOTACOES, 'do', 'praticas', divs).map((a) => a.id)).toEqual(['b']);
    expect(paginasDaDivisoria(ANOTACOES, 'do', 'cap-1', divs).map((a) => a.id)).toEqual(['c']);
  });

  it('só as páginas dessa cadeira', () => {
    expect(paginasDaDivisoria(ANOTACOES, 'da', 'teoricas', divs).map((a) => a.id)).toEqual(['e']);
  });
});

describe('contagens e última editada', () => {
  it('conta páginas por caderno', () => {
    expect(contarPaginas(ANOTACOES)).toEqual({ do: 5, da: 1 });
  });

  it('a última editada é a de atualizadoEm maior', () => {
    expect(ultimaEditada(ANOTACOES).id).toBe('c');
    expect(ultimaEditada([])).toBeNull();
  });
});

describe('criarDivisoria', () => {
  it('id a partir do nome, sem acentos, e único', () => {
    const existentes = [...DIVISORIAS_BASE, { id: 'cap-1-fontes', nome: 'x' }];
    expect(criarDivisoria('  Cap. 1 · Fontes ', existentes).id).toBe('cap-1-fontes-2');
    expect(criarDivisoria('Revisões', DIVISORIAS_BASE)).toMatchObject({ id: 'revisoes', nome: 'Revisões' });
  });

  it('nome vazio dá null, nome só com símbolos ainda tem id, nome comprido é cortado', () => {
    expect(criarDivisoria('   ', [])).toBeNull();
    expect(criarDivisoria('§§', []).id).toBe('divisoria');
    expect(criarDivisoria('x'.repeat(50), []).nome).toHaveLength(30);
  });

  it('as cores rodam pelas divisórias dela', () => {
    const primeira = criarDivisoria('Um', DIVISORIAS_BASE);
    const segunda = criarDivisoria('Dois', [...DIVISORIAS_BASE, primeira]);
    expect(primeira.cor).not.toBe(segunda.cor);
  });
});

describe('ordem das páginas', () => {
  const paginas = [{ id: 'x' }, { id: 'y', ordem: 5 }, { id: 'z' }];

  it('mover troca com a vizinha e renumera tudo', () => {
    expect(moverPagina(paginas, 'y', -1)).toEqual([{ id: 'y', ordem: 0 }, { id: 'x', ordem: 1 }, { id: 'z', ordem: 2 }]);
    expect(moverPagina(paginas, 'x', -1)).toBeNull();
    expect(moverPagina(paginas, 'nada', 1)).toBeNull();
  });

  it('página nova vai para o fim', () => {
    expect(ordemNova(paginas)).toBe(6);
    expect(ordemNova([{ id: 'a' }, { id: 'b' }])).toBe(2);
    expect(ordemNova([])).toBe(0);
  });
});
