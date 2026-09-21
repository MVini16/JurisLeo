import { describe, it, expect } from 'vitest';
import { faseDaRespiracao, DURACAO_CICLO, PADRAO_RESPIRACAO } from './respiracao.js';

describe('faseDaRespiracao', () => {
  it('um ciclo dura 12 segundos: 4 a inspirar, 2 a segurar, 6 a expirar', () => {
    expect(PADRAO_RESPIRACAO.map((f) => f.segundos)).toEqual([4, 2, 6]);
    expect(DURACAO_CICLO).toBe(12);
  });

  it('começa a inspirar', () => {
    expect(faseDaRespiracao(0)).toMatchObject({ fase: 'inspira', restante: 4, ciclo: 0 });
  });

  it('passa pelas três fases', () => {
    expect(faseDaRespiracao(3.9).fase).toBe('inspira');
    expect(faseDaRespiracao(4).fase).toBe('segura');
    expect(faseDaRespiracao(5.9).fase).toBe('segura');
    expect(faseDaRespiracao(6).fase).toBe('expira');
    expect(faseDaRespiracao(11.9).fase).toBe('expira');
  });

  it('volta ao início e conta os ciclos', () => {
    expect(faseDaRespiracao(12)).toMatchObject({ fase: 'inspira', ciclo: 1 });
    expect(faseDaRespiracao(30)).toMatchObject({ fase: 'expira', ciclo: 2 });
  });

  it('diz quanto falta para a fase acabar', () => {
    expect(faseDaRespiracao(9).restante).toBe(3);
  });

  it('tempo negativo conta como zero', () => {
    expect(faseDaRespiracao(-5).fase).toBe('inspira');
  });
});
