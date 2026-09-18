import { describe, it, expect } from 'vitest';
import { estadoFaltas, contarFaltas, contaComoLecionada, contaComoFalta, prazoComprovativo } from './faltas.js';

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

  it('sem aulas dadas e sem faltas não está excluída', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 0, faltasInjustificadas: 0, faltasJustificadas: 0 });
    expect(r.excluida).toBe(false);
    expect(r.semaforo).toBe('verde');
  });
});

// secção 7.4 e 5.4.1: número principal sobre as previstas, vermelho só depois de metade do semestre
describe('estadoFaltas — número principal sobre as previstas', () => {
  it('com 30 previstas, o limite prático são 7 faltas injustificadas', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 0, faltasInjustificadas: 0, faltasJustificadas: 0 });
    expect(r.faltasRestantesSemestre).toBe(7);
  });

  it('a oitava falta injustificada já exclui no fim do semestre', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 30, faltasInjustificadas: 8, faltasJustificadas: 0 });
    expect(r.excluidaConfirmada).toBe(true);
  });

  it('o total conta: 15 faltas (justificadas incluídas) excluem', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 30, faltasInjustificadas: 0, faltasJustificadas: 15 });
    expect(r.excluidaConfirmada).toBe(true);
    expect(r.motivoExclusao).toBe('totalPrevistas');
  });

  it('as justificadas gastam o limite total mas não o das injustificadas', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 10, faltasInjustificadas: 2, faltasJustificadas: 12 });
    // total 14 → falta 0 até ao limite de 14 (15 exclui)
    expect(r.faltasRestantesSemestre).toBe(0);
    expect(r.semaforo).toBe('vermelho');
  });
});

describe('estadoFaltas — semáforo', () => {
  it('não dá vermelho no início do semestre só pela proporção corrente', () => {
    // 4 aulas dadas, 1 falta = 25%: a proporção estoura, mas ainda vai em 4 de 30
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 4, faltasInjustificadas: 1, faltasJustificadas: 0 });
    expect(r.excluida).toBe(true); // a regra estrita, sobre as dadas
    expect(r.excluidaConfirmada).toBe(false);
    expect(r.semaforo).not.toBe('vermelho');
    expect(r.faltasRestantesSemestre).toBe(6);
  });

  it('a proporção alta no início dá pelo menos amarelo, para ela saber', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 4, faltasInjustificadas: 1, faltasJustificadas: 0 });
    expect(r.semaforo).toBe('amarelo');
  });

  it('semáforo verde com folga confortável', () => {
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 16, faltasInjustificadas: 1, faltasJustificadas: 0 }).semaforo).toBe('verde');
  });

  it('amarelo quando faltam duas ou menos até ao limite', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 30, faltasInjustificadas: 5, faltasJustificadas: 0 });
    expect(r.faltasRestantesSemestre).toBe(2);
    expect(r.semaforo).toBe('amarelo');
    expect(r.quaseNoLimite).toBe(true);
  });

  it('vermelho quando já não pode faltar mais, ou está excluída depois de metade do semestre', () => {
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 20, faltasInjustificadas: 7, faltasJustificadas: 0 }).semaforo).toBe('vermelho');
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 20, faltasInjustificadas: 8, faltasJustificadas: 0 }).semaforo).toBe('vermelho');
  });

  it('mostra o aviso do início do semestre só antes de metade', () => {
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 8, faltasInjustificadas: 0, faltasJustificadas: 0 }).aviso).toMatch(/início do semestre/);
    expect(estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 20, faltasInjustificadas: 0, faltasJustificadas: 0 }).aviso).toBeNull();
  });

  it('calcula a percentagem atual sobre as lecionadas', () => {
    const r = estadoFaltas({ aulasPraticasPrevistas: 30, aulasPraticasLecionadas: 8, faltasInjustificadas: 1, faltasJustificadas: 0 });
    expect(r.percentagemAtual).toBe(13);
  });
});

describe('estados de aula', () => {
  it('só fui e faltei contam como lecionada', () => {
    expect(contaComoLecionada('fui')).toBe(true);
    expect(contaComoLecionada('faltei')).toBe(true);
    expect(contaComoLecionada('stotFaltou')).toBe(false);
    expect(contaComoLecionada('cancelada')).toBe(false);
    expect(contaComoLecionada('porMarcar')).toBe(false);
  });

  it('só faltei conta como falta', () => {
    expect(contaComoFalta('faltei')).toBe(true);
    expect(contaComoFalta('fui')).toBe(false);
    expect(contaComoFalta('stotFaltou')).toBe(false);
  });
});

describe('contarFaltas', () => {
  it('conta as práticas marcadas fui ou faltei e ignora teóricas, canceladas e por marcar', () => {
    const r = contarFaltas({
      ocorrencias: [
        { tipo: 'pratica', estado: 'fui' },
        { tipo: 'pratica', estado: 'faltei' },
        { tipo: 'pratica', estado: 'stotFaltou' },
        { tipo: 'pratica', estado: 'cancelada' },
        { tipo: 'pratica', estado: 'porMarcar' },
        { tipo: 'teorica', estado: 'fui' },
      ],
      registos: [{ justificada: false, ocorrenciaId: 'a' }],
    });
    expect(r.aulasPraticasLecionadas).toBe(2);
    expect(r.faltasInjustificadas).toBe(1);
    expect(r.faltasJustificadas).toBe(0);
  });

  it('separa justificadas de injustificadas', () => {
    const r = contarFaltas({
      registos: [
        { justificada: true, ocorrenciaId: 'a' },
        { justificada: false, ocorrenciaId: 'b' },
        { justificada: false, ocorrenciaId: 'c' },
      ],
    });
    expect(r.faltasJustificadas).toBe(1);
    expect(r.faltasInjustificadas).toBe(2);
  });

  it('uma falta sem aula no calendário também conta como aula dada', () => {
    const r = contarFaltas({ registos: [{ justificada: false }] });
    expect(r.aulasPraticasLecionadas).toBe(1);
  });

  it('aplica o ajuste manual, sem ficar negativo', () => {
    expect(contarFaltas({ ocorrencias: [{ tipo: 'pratica', estado: 'fui' }], ajusteLecionadas: 3 }).aulasPraticasLecionadas).toBe(4);
    expect(contarFaltas({ ocorrencias: [{ tipo: 'pratica', estado: 'fui' }], ajusteLecionadas: -5 }).aulasPraticasLecionadas).toBe(0);
  });
});

describe('prazoComprovativo', () => {
  it('falta a uma segunda: prazo até às 24h de terça', () => {
    const p = prazoComprovativo(new Date(2026, 8, 14, 10, 0)); // segunda 14/09/2026
    expect(p.getDay()).toBe(2);
    expect(p.getDate()).toBe(15);
    expect(p.getHours()).toBe(23);
  });

  it('falta a uma sexta: passa o fim de semana e cai na segunda', () => {
    const p = prazoComprovativo(new Date(2026, 8, 18, 10, 0)); // sexta 18/09/2026
    expect(p.getDay()).toBe(1);
    expect(p.getDate()).toBe(21);
  });

  it('data inválida devolve null', () => {
    expect(prazoComprovativo('não é data')).toBeNull();
  });
});
