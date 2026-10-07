import { describe, it, expect } from 'vitest';
import { TODOS_DESTINOS, filtrarDestinos } from './destinos.js';

describe('destinos', () => {
  it('não repete rotas', () => {
    const rotas = TODOS_DESTINOS.map((d) => d.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
  });
  it('filtra sem acentos nem maiúsculas', () => {
    expect(filtrarDestinos('calendario').map((d) => d.rota)).toEqual(['/calendario']);
    expect(filtrarDestinos('SUMARIOS')).toHaveLength(1);
    expect(filtrarDestinos('')).toHaveLength(TODOS_DESTINOS.length);
  });
});
