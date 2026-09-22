import { describe, it, expect } from 'vitest';
import { noVazio, adicionarNo, moverNo, editarTextoNo, removerNo, ligarNos, removerLigacao } from './mapaMental.js';

describe('adicionarNo', () => {
  it('acrescenta um nó com o texto e a posição dadas', () => {
    const nos = adicionarNo([], 'a', 10, 20, 'Culpa');
    expect(nos).toEqual([{ id: 'a', texto: 'Culpa', x: 10, y: 20 }]);
  });

  it('texto por defeito é "Novo"', () => {
    expect(noVazio('a', 0, 0).texto).toBe('Novo');
  });
});

describe('moverNo', () => {
  it('só mexe no nó certo', () => {
    const nos = [noVazio('a', 0, 0), noVazio('b', 5, 5)];
    const movidos = moverNo(nos, 'a', 99, 99);
    expect(movidos[0]).toEqual({ id: 'a', texto: 'Novo', x: 99, y: 99 });
    expect(movidos[1]).toEqual(nos[1]);
  });
});

describe('editarTextoNo', () => {
  it('muda o texto do nó certo', () => {
    const nos = [noVazio('a', 0, 0, 'x')];
    expect(editarTextoNo(nos, 'a', 'Nexo de causalidade')[0].texto).toBe('Nexo de causalidade');
  });
});

describe('removerNo', () => {
  it('remove o nó e as ligações que o envolvem', () => {
    const nos = [noVazio('a', 0, 0), noVazio('b', 0, 0), noVazio('c', 0, 0)];
    const ligacoes = [{ de: 'a', para: 'b' }, { de: 'b', para: 'c' }];
    const r = removerNo(nos, ligacoes, 'b');
    expect(r.nos.map((n) => n.id)).toEqual(['a', 'c']);
    expect(r.ligacoes).toEqual([]);
  });
});

describe('ligarNos', () => {
  it('cria uma ligação nova', () => {
    expect(ligarNos([], 'a', 'b')).toEqual([{ de: 'a', para: 'b' }]);
  });

  it('não duplica a mesma ligação, em qualquer sentido', () => {
    const l1 = ligarNos([], 'a', 'b');
    expect(ligarNos(l1, 'a', 'b')).toEqual(l1);
    expect(ligarNos(l1, 'b', 'a')).toEqual(l1);
  });

  it('não liga um nó a si próprio', () => {
    expect(ligarNos([], 'a', 'a')).toEqual([]);
  });
});

describe('removerLigacao', () => {
  it('remove a ligação em qualquer sentido', () => {
    const ligacoes = [{ de: 'a', para: 'b' }];
    expect(removerLigacao(ligacoes, 'b', 'a')).toEqual([]);
  });
});
