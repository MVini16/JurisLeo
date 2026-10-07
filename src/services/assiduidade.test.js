import { describe, it, expect } from 'vitest';
import { historicoDeMarcas, comprovativosEmFalta, situacaoDaCadeira, simularFaltas, faltasAteExclusao, percentagemPresenca } from './assiduidade.js';

const cadeira = { aulasPraticasPrevistas: 26 };
const marcas = {
  a: { estado: 'presente', contaFalta: true, data: '2026-09-14' },
  b: { estado: 'faltei-justificada', contaFalta: true, data: '2026-09-21', comprovativo: false },
  c: { estado: 'faltei-justificada', contaFalta: true, data: '2026-09-28', comprovativo: true },
  d: { estado: 'xpto', data: '2026-10-05' },
};

describe('historicoDeMarcas', () => {
  it('ordena da mais recente para a mais antiga e ignora estados desconhecidos', () => {
    expect(historicoDeMarcas(marcas).map((m) => m.chave)).toEqual(['c', 'b', 'a']);
  });
});

describe('comprovativosEmFalta', () => {
  it('só lista as justificadas sem comprovativo', () => {
    expect(comprovativosEmFalta(marcas).map((m) => m.chave)).toEqual(['b']);
  });
});

describe('situacaoDaCadeira', () => {
  it('soma as marcas ao que estava escrito à mão', () => {
    const { efetivas, resultado } = situacaoDaCadeira(cadeira, { aulasPraticasLecionadas: 2 }, marcas);
    expect(efetivas.aulasPraticasLecionadas).toBe(5);
    expect(efetivas.faltasJustificadas).toBe(2);
    expect(resultado.excluida).toBe(false);
  });
  it('sem aulas previstas não há resultado', () => {
    expect(situacaoDaCadeira({}, null, {}).resultado).toBeNull();
  });
});

describe('simularFaltas', () => {
  const efetivas = { aulasPraticasLecionadas: 8, faltasInjustificadas: 0, faltasJustificadas: 0 };
  it('faltar a 3 das 11 primeiras aulas exclui', () => {
    expect(simularFaltas(cadeira, efetivas, 2).excluida).toBe(false);
    expect(simularFaltas(cadeira, efetivas, 3).excluida).toBe(true);
  });
  it('zero faltas extra devolve o estado atual', () => {
    expect(simularFaltas(cadeira, efetivas, 0).excluida).toBe(false);
  });
  it('faltasAteExclusao conta as faltas que aguenta', () => {
    const n = faltasAteExclusao(cadeira, { aulasPraticasLecionadas: 20, faltasInjustificadas: 0, faltasJustificadas: 0 });
    expect(simularFaltas(cadeira, { aulasPraticasLecionadas: 20, faltasInjustificadas: 0, faltasJustificadas: 0 }, n).excluida).toBe(false);
    expect(simularFaltas(cadeira, { aulasPraticasLecionadas: 20, faltasInjustificadas: 0, faltasJustificadas: 0 }, n + 1).excluida).toBe(true);
  });
  it('faltasAteExclusao dá 0 se já está excluída', () => {
    expect(faltasAteExclusao(cadeira, { aulasPraticasLecionadas: 8, faltasInjustificadas: 3, faltasJustificadas: 0 })).toBe(0);
  });
});

describe('percentagemPresenca', () => {
  it('null sem aulas dadas, arredonda com aulas', () => {
    expect(percentagemPresenca({ lecionadas: 0, presentes: 0 })).toBeNull();
    expect(percentagemPresenca({ lecionadas: 3, presentes: 2 })).toBe(67);
  });
});
