import { describe, it, expect } from 'vitest';
import { SKINS_JOGOS, skinValida } from './jogosSkins.js';

describe('estilos dos jogos', () => {
  it('um estilo desconhecido volta ao tribunal', () => {
    expect(skinValida('arcade')).toBe('arcade');
    expect(skinValida('xpto')).toBe('tribunal');
    expect(skinValida(undefined)).toBe('tribunal');
  });
  it('há quatro estilos sem travessões', () => {
    expect(SKINS_JOGOS).toHaveLength(4);
    SKINS_JOGOS.forEach((s) => expect(`${s.nome}${s.descricao}`).not.toMatch(/[–—]/));
  });
});
