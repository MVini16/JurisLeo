import { describe, it, expect } from 'vitest';
import { sessoesDeHoje, deveSugerirRegisto } from './horasPorRegistar.js';

const hoje = new Date(2026, 9, 5, 20, 0);
const inicioHoje = (hora) => new Date(2026, 9, 5, hora, 0);
const inicioOntem = new Date(2026, 9, 4, 20, 0);

describe('sessoesDeHoje', () => {
  it('só devolve sessões com início no mesmo dia', () => {
    const sessoes = [{ inicio: inicioHoje(10) }, { inicio: inicioOntem }];
    expect(sessoesDeHoje(sessoes, hoje)).toHaveLength(1);
  });

  it('aceita Timestamp do firestore (com toDate)', () => {
    const sessoes = [{ inicio: { toDate: () => inicioHoje(9) } }];
    expect(sessoesDeHoje(sessoes, hoje)).toHaveLength(1);
  });
});

describe('deveSugerirRegisto', () => {
  it('não sugere antes da hora definida', () => {
    const cedo = new Date(2026, 9, 5, 15, 0);
    expect(deveSugerirRegisto([], cedo)).toBe(false);
  });

  it('sugere depois da hora, sem nenhuma sessão nesse dia', () => {
    expect(deveSugerirRegisto([], hoje)).toBe(true);
  });

  it('não sugere se já houver sessão registada hoje', () => {
    const sessoes = [{ inicio: inicioHoje(16) }];
    expect(deveSugerirRegisto(sessoes, hoje)).toBe(false);
  });
});
