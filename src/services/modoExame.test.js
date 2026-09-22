import { describe, it, expect } from 'vitest';
import { segundosRestantes, formatarTempo, DURACAO_SEGUNDOS } from './modoExame.js';

describe('segundosRestantes', () => {
  it('começa nos 90 minutos completos', () => {
    expect(segundosRestantes(0, 0)).toBe(DURACAO_SEGUNDOS);
  });

  it('desce com o tempo', () => {
    expect(segundosRestantes(0, 10_000)).toBe(DURACAO_SEGUNDOS - 10);
  });

  it('nunca fica negativo depois do tempo esgotado', () => {
    expect(segundosRestantes(0, (DURACAO_SEGUNDOS + 100) * 1000)).toBe(0);
  });
});

describe('formatarTempo', () => {
  it('formata minutos e segundos com dois dígitos', () => {
    expect(formatarTempo(90 * 60)).toBe('90:00');
    expect(formatarTempo(65)).toBe('1:05');
    expect(formatarTempo(9)).toBe('0:09');
  });

  it('nunca mostra negativo', () => {
    expect(formatarTempo(-5)).toBe('0:00');
  });
});
