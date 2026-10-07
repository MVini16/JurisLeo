import { describe, it, expect } from 'vitest';
import { FRASES_CARREGAMENTO, frasesDoEstilo, proximaFrase, estiloCarregamentoValido } from './carregamento.js';

describe('carregamento', () => {
  it('tem frases dos dois e ids de autor válidos', () => {
    expect(FRASES_CARREGAMENTO.filter((f) => f.autor === 'barney').length).toBeGreaterThanOrEqual(8);
    expect(FRASES_CARREGAMENTO.filter((f) => f.autor === 'damon').length).toBeGreaterThanOrEqual(8);
    expect(FRASES_CARREGAMENTO.every((f) => ['barney', 'damon'].includes(f.autor) && f.texto.length > 10)).toBe(true);
  });
  it('as frases não usam travessões', () => {
    expect(FRASES_CARREGAMENTO.some((f) => /[–—]/.test(f.texto))).toBe(false);
  });
  it('filtra por estilo', () => {
    expect(frasesDoEstilo('barney').every((f) => f.autor === 'barney')).toBe(true);
    expect(frasesDoEstilo('damon').every((f) => f.autor === 'damon')).toBe(true);
    expect(frasesDoEstilo('simples')).toEqual([]);
    expect(frasesDoEstilo('xpto')).toHaveLength(FRASES_CARREGAMENTO.length);
  });
  it('não repete a frase anterior', () => {
    expect(proximaFrase([1, 2, 3], 1, 0.4)).not.toBe(1);
    expect(proximaFrase([], 0, 0.5)).toBe(-1);
    expect(proximaFrase(['a'], 0, 0.9)).toBe(0);
  });
  it('estilo inválido volta ao misto', () => {
    expect(estiloCarregamentoValido('nada')).toBe('misto');
  });
});
