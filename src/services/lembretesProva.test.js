import { describe, it, expect } from 'vitest';
import { tarefasEmCadeia, pedeLembretes, PASSOS_EM_CADEIA } from './lembretesProva.js';

const HOJE = new Date(2026, 8, 23, 12); // quarta, 23 de setembro de 2026

describe('pedeLembretes', () => {
  it('só frequências e exames', () => {
    expect(pedeLembretes('frequencia')).toBe(true);
    expect(pedeLembretes('exame')).toBe(true);
    for (const t of ['aula', 'oral', 'entrega', 'outro', undefined]) expect(pedeLembretes(t)).toBe(false);
  });
});

describe('tarefasEmCadeia', () => {
  it('cria três lembretes a 14, 7 e 2 dias da prova', () => {
    const t = tarefasEmCadeia({ titulo: 'Freq. de DA I', cadeira: 'administrativo-1', dataProva: new Date(2026, 9, 30, 9), hoje: HOJE });
    expect(t.map((x) => x.prazo)).toEqual(['2026-10-16', '2026-10-23', '2026-10-28']);
    expect(t.map((x) => x.titulo)).toEqual(['Começar a estudar para Freq. de DA I', 'Fechar o resumo de Freq. de DA I', 'Revisão final de Freq. de DA I']);
    expect(t.every((x) => x.cadeira === 'administrativo-1' && x.concluida === false && x.tipo === 'outro')).toBe(true);
    expect(t[2].prioridade).toBe('alta');
  });

  it('atravessa o fim do mês corretamente', () => {
    const t = tarefasEmCadeia({ titulo: 'x', dataProva: '2026-11-03', hoje: HOJE });
    expect(t.map((x) => x.prazo)).toEqual(['2026-10-20', '2026-10-27', '2026-11-01']);
  });

  it('ignora os passos que já passaram', () => {
    const t = tarefasEmCadeia({ titulo: 'x', dataProva: new Date(2026, 9, 2, 9), hoje: HOJE });
    expect(t.map((x) => x.prazo)).toEqual(['2026-09-25', '2026-09-30']);
  });

  it('uma prova daqui a um dia não tem lembretes', () => {
    expect(tarefasEmCadeia({ titulo: 'x', dataProva: new Date(2026, 8, 24, 9), hoje: HOJE })).toEqual([]);
  });

  it('sem título ou sem data não cria nada', () => {
    expect(tarefasEmCadeia({ titulo: '  ', dataProva: '2026-11-03', hoje: HOJE })).toEqual([]);
    expect(tarefasEmCadeia({ titulo: 'x', dataProva: 'lixo', hoje: HOJE })).toEqual([]);
    expect(tarefasEmCadeia({ titulo: 'x', dataProva: null, hoje: HOJE })).toEqual([]);
  });

  it('os passos são os três combinados', () => {
    expect(PASSOS_EM_CADEIA.map((p) => p.dias)).toEqual([14, 7, 2]);
  });
});
