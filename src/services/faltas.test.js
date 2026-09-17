import { describe, it, expect } from 'vitest';
import { estadoFaltas } from './faltas.js';

// tabela de casos de teste da especificação (secção 7.5)
describe('estadoFaltas', () => {
  const casos = [
    { n: 1, previstas: 26, lecionadas: 8, inj: 0, just: 0, excluida: false, restantes: 1 },
    { n: 2, previstas: 26, lecionadas: 8, inj: 1, just: 0, excluida: false, restantes: 0 },
    { n: 3, previstas: 26, lecionadas: 8, inj: 2, just: 0, excluida: true, motivo: 'injustificadas', restantes: 0 },
    { n: 4, previstas: 26, lecionadas: 24, inj: 5, just: 0, excluida: false, restantes: 0 },
    { n: 5, previstas: 26, lecionadas: 24, inj: 6, just: 0, excluida: true, motivo: 'injustificadas', restantes: 0 },
    { n: 6, previstas: 26, lecionadas: 26, inj: 0, just: 13, excluida: true, motivo: 'totalPrevistas', restantes: 0 },
    { n: 7, previstas: 26, lecionadas: 26, inj: 0, just: 12, excluida: false, restantes: 0 },
    { n: 8, previstas: 26, lecionadas: 20, inj: 2, just: 3, excluida: false, restantes: 2 },
  ];

  for (const caso of casos) {
    it(`caso ${caso.n}: previstas=${caso.previstas} lecionadas=${caso.lecionadas} inj=${caso.inj} just=${caso.just}`, () => {
      const resultado = estadoFaltas({
        aulasPraticasPrevistas: caso.previstas,
        aulasPraticasLecionadas: caso.lecionadas,
        faltasInjustificadas: caso.inj,
        faltasJustificadas: caso.just,
      });
      expect(resultado.excluida).toBe(caso.excluida);
      expect(resultado.faltasRestantes).toBe(caso.restantes);
      if (caso.motivo) {
        expect(resultado.motivoExclusao).toBe(caso.motivo);
      }
    });
  }

  it('dá semáforo vermelho quando excluída ou sem faltas restantes', () => {
    expect(estadoFaltas({ aulasPraticasPrevistas: 26, aulasPraticasLecionadas: 8, faltasInjustificadas: 2, faltasJustificadas: 0 }).semaforo).toBe('vermelho');
  });

  it('dá semáforo vermelho logo no início do semestre — cada falta pesa mais cedo', () => {
    // com só 4 aulas lecionadas, o limite de um quarto é muito apertado (secção 7.4)
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 4, faltasInjustificadas: 0, faltasJustificadas: 0 }).semaforo).toBe('vermelho');
  });

  it('dá semáforo verde com folga confortável, mais a meio do semestre', () => {
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 16, faltasInjustificadas: 0, faltasJustificadas: 0 }).semaforo).toBe('verde');
  });
});
