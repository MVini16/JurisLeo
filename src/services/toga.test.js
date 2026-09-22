import { describe, it, expect } from 'vitest';
import { pecasDesbloqueadas } from './toga.js';

describe('pecasDesbloqueadas', () => {
  it('sem nada feito, nada desbloqueado', () => {
    expect(pecasDesbloqueadas({})).toEqual({ capelo: false, beca: false, fita: false, medalha: false });
  });

  it('capelo desbloqueia com uma sessão', () => {
    expect(pecasDesbloqueadas({ totalSessoes: 1 }).capelo).toBe(true);
  });

  it('beca desbloqueia aos 7 dias seguidos, não antes', () => {
    expect(pecasDesbloqueadas({ sequenciaDias: 6 }).beca).toBe(false);
    expect(pecasDesbloqueadas({ sequenciaDias: 7 }).beca).toBe(true);
  });

  it('fita desbloqueia aos 5 casos', () => {
    expect(pecasDesbloqueadas({ casosResolvidos: 4 }).fita).toBe(false);
    expect(pecasDesbloqueadas({ casosResolvidos: 5 }).fita).toBe(true);
  });

  it('medalha desbloqueia com a primeira cadeira aprovada', () => {
    expect(pecasDesbloqueadas({ cadeirasAprovadas: 1 }).medalha).toBe(true);
  });
});
