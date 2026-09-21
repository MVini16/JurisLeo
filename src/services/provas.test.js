import { describe, it, expect } from 'vitest';
import { proximaProva, acrescentarTopico, alternarTopico, removerTopico, progressoChecklist, textoDosDias } from './provas.js';

const HOJE = new Date(2026, 8, 23, 12);
const ev = (tipo, dia, extra = {}) => ({ id: `${tipo}-${dia}`, tipo, titulo: `${tipo} ${dia}`, data: new Date(2026, 8, dia, 9), ...extra });

describe('proximaProva', () => {
  it('escolhe a mais próxima que ainda não passou', () => {
    const p = proximaProva([ev('frequencia', 30), ev('exame', 25), ev('frequencia', 10)], HOJE);
    expect(p).toMatchObject({ id: 'exame-25', tipo: 'exame', diasRestantes: 2 });
  });

  it('hoje conta; canceladas e outros tipos não', () => {
    expect(proximaProva([ev('frequencia', 23)], HOJE).diasRestantes).toBe(0);
    expect(proximaProva([ev('frequencia', 25, { estado: 'cancelado' }), ev('aula', 24)], HOJE)).toBeNull();
  });

  it('aceita timestamps do firestore', () => {
    const e = { id: 'x', tipo: 'frequencia', titulo: 't', data: { toDate: () => new Date(2026, 9, 1, 9) } };
    expect(proximaProva([e], HOJE).diasRestantes).toBe(8);
  });

  it('sem provas devolve nulo', () => {
    expect(proximaProva([], HOJE)).toBeNull();
  });
});

describe('checklist da matéria', () => {
  it('acrescenta sem espaços a mais e sem repetir', () => {
    let t = acrescentarTopico([], '  Acto administrativo ');
    expect(t).toEqual([{ texto: 'Acto administrativo', feito: false }]);
    t = acrescentarTopico(t, 'acto administrativo');
    expect(t).toHaveLength(1);
    expect(acrescentarTopico(t, '   ')).toBe(t);
  });

  it('marca e desmarca sem mexer nos outros', () => {
    const t = [{ texto: 'a', feito: false }, { texto: 'b', feito: false }];
    const r = alternarTopico(t, 1);
    expect(r.map((x) => x.feito)).toEqual([false, true]);
    expect(alternarTopico(r, 1)[1].feito).toBe(false);
    expect(alternarTopico(t, 9)).toBe(t);
  });

  it('remove um tópico', () => {
    const t = [{ texto: 'a' }, { texto: 'b' }];
    expect(removerTopico(t, 0)).toEqual([{ texto: 'b' }]);
    expect(removerTopico(t, 5)).toBe(t);
  });

  it('calcula o progresso', () => {
    expect(progressoChecklist([])).toEqual({ feitos: 0, total: 0, percentagem: 0 });
    expect(progressoChecklist([{ feito: true }, { feito: false }, { feito: true }])).toEqual({ feitos: 2, total: 3, percentagem: 67 });
  });
});

describe('textoDosDias', () => {
  it('diz hoje, amanhã ou quantos dias faltam', () => {
    expect(textoDosDias(0)).toBe('É hoje.');
    expect(textoDosDias(1)).toBe('É amanhã.');
    expect(textoDosDias(12)).toBe('Faltam 12 dias.');
  });
});
