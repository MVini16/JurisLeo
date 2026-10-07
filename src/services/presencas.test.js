import { describe, it, expect } from 'vitest';
import { chaveAula, jaPodeMarcar, normalizarMarca, contarMarcas, faltasEfetivas, aulasPorMarcar, normalizarNotasAula, aulaEmCurso } from './presencas.js';

const aula = (extra = {}) => ({ id: 'a1-x', aulaId: 'a1', tipo: 'aula', cadeira: 'familia', data: new Date(2026, 9, 5), horaInicio: '16:10', contaFalta: true, ...extra });

describe('chaveAula', () => {
  it('usa aulaId e a data local nas aulas semanais', () => {
    expect(chaveAula(aula())).toBe('a1_2026-10-05');
  });
  it('usa o id nos eventos únicos', () => {
    expect(chaveAula({ id: 'e9', tipo: 'aula', cadeira: 'hri' })).toBe('ev_e9');
  });
  it('devolve null sem cadeira ou se não é aula', () => {
    expect(chaveAula(aula({ cadeira: '' }))).toBeNull();
    expect(chaveAula(aula({ tipo: 'frequencia' }))).toBeNull();
  });
});

describe('jaPodeMarcar', () => {
  it('não deixa marcar aulas que ainda não começaram', () => {
    expect(jaPodeMarcar(aula(), new Date(2026, 9, 5, 15, 0))).toBe(false);
    expect(jaPodeMarcar(aula(), new Date(2026, 9, 5, 16, 10))).toBe(true);
    expect(jaPodeMarcar(aula(), new Date(2026, 9, 6))).toBe(true);
  });
});

describe('normalizarMarca', () => {
  it('rejeita estados desconhecidos', () => {
    expect(normalizarMarca({ estado: 'xpto' })).toBeNull();
  });
  it('só guarda motivo e comprovativo quando a falta é justificada', () => {
    expect(normalizarMarca({ estado: 'faltei', motivo: 'x', comprovativo: true })).toMatchObject({ motivo: '', comprovativo: false });
    expect(normalizarMarca({ estado: 'faltei-justificada', motivo: ' doença ', comprovativo: true })).toMatchObject({ motivo: 'doença', comprovativo: true });
  });
});

describe('contarMarcas', () => {
  const marcas = {
    a: { estado: 'presente', contaFalta: true },
    b: { estado: 'faltei', contaFalta: true },
    c: { estado: 'faltei-justificada', contaFalta: true, comprovativo: false },
    d: { estado: 'faltei-justificada', contaFalta: true, comprovativo: true },
    e: { estado: 'prof-faltou', contaFalta: true },
    f: { estado: 'sem-aula', contaFalta: true },
    g: { estado: 'faltei', contaFalta: false }, // teórica: não conta
  };
  it('aula dada = presente ou falta; prof faltou e sem aula não entram', () => {
    const r = contarMarcas(marcas);
    expect(r.lecionadas).toBe(4);
    expect(r.injustificadas).toBe(1);
    expect(r.justificadas).toBe(2);
    expect(r.semComprovativo).toBe(1);
    expect(r.profFaltou).toBe(1);
    expect(r.semAula).toBe(1);
  });
  it('aguenta marcas vazias', () => {
    expect(contarMarcas(undefined).lecionadas).toBe(0);
  });
});

describe('faltasEfetivas', () => {
  it('soma o que ela escreveu à mão com as marcas', () => {
    const r = faltasEfetivas({ aulasPraticasLecionadas: 3, faltasInjustificadas: 1, faltasJustificadas: 0 }, { a: { estado: 'faltei', contaFalta: true }, b: { estado: 'presente', contaFalta: true } });
    expect(r).toMatchObject({ aulasPraticasLecionadas: 5, faltasInjustificadas: 2, faltasJustificadas: 0 });
  });
});

describe('aulasPorMarcar', () => {
  it('lista só práticas passadas sem marca, por ordem', () => {
    const e1 = aula({ aulaId: 'a1', data: new Date(2026, 9, 5) });
    const e2 = aula({ aulaId: 'a2', data: new Date(2026, 9, 1) });
    const e3 = aula({ aulaId: 'a3', data: new Date(2026, 9, 20) }); // futura
    const e4 = aula({ aulaId: 'a4', contaFalta: false }); // teórica
    const feita = { [chaveAula(e2)]: { estado: 'presente' } };
    const r = aulasPorMarcar([e1, e2, e3, e4], feita, new Date(2026, 9, 7));
    expect(r).toEqual([e1]);
  });
});

describe('normalizarNotasAula', () => {
  it('devolve null se está tudo vazio', () => {
    expect(normalizarNotasAula({ sumario: '  ', nota: '' })).toBeNull();
  });
  it('limpa e guarda só os campos conhecidos', () => {
    expect(normalizarNotasAula({ sumario: ' Ato administrativo ', outro: 'x' })).toEqual({ sumario: 'Ato administrativo', nota: '', tpc: '', duvida: '' });
  });
});

describe('aulaEmCurso', () => {
  const ev = { tipo: 'aula', data: new Date(2026, 9, 7), horaInicio: '16:10', horaFim: '17:00' };
  it('só está em curso entre o início e o fim, no próprio dia', () => {
    expect(aulaEmCurso(ev, new Date(2026, 9, 7, 16, 30))).toBe(true);
    expect(aulaEmCurso(ev, new Date(2026, 9, 7, 17, 0))).toBe(false);
    expect(aulaEmCurso(ev, new Date(2026, 9, 8, 16, 30))).toBe(false);
  });
});
