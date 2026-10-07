import { describe, it, expect } from 'vitest';
import { PACOTES_ANIMACAO, pacoteValido } from './animacoes.js';

describe('pacotes de animação', () => {
  it('um pacote desconhecido volta ao inicial', () => {
    expect(pacoteValido('vivo')).toBe('vivo');
    expect(pacoteValido('xpto')).toBe('elegante');
    expect(pacoteValido(undefined)).toBe('elegante');
  });
  it('tem a opção de desligar tudo', () => {
    expect(PACOTES_ANIMACAO.map((p) => p.id)).toContain('nenhum');
  });
  it('os textos não usam travessões nem emojis', () => {
    PACOTES_ANIMACAO.forEach((p) => {
      expect(`${p.nome}${p.descricao}`).not.toMatch(/[–—]|\p{Extended_Pictographic}/u);
    });
  });
});
