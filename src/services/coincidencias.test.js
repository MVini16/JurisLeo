import { describe, it, expect } from 'vitest';
import { detetarChoques, choquesPorDia } from './coincidencias.js';

const exame = (dia, titulo = 'Exame') => ({ chave: `${titulo}-${dia}`, dia, tipo: 'exame', titulo });
const freq = (dia, titulo = 'Frequência') => ({ chave: `${titulo}-${dia}`, dia, tipo: 'frequencia', titulo });
const aula = (dia, titulo = 'Aula', extra = {}) => ({ chave: `${titulo}-${dia}`, dia, tipo: 'aula', titulo, ...extra });

describe('detetarChoques', () => {
  it('sem itens no mesmo dia não há choques', () => {
    expect(detetarChoques([exame('2027-01-05'), exame('2027-01-08')], { epocaNormal: true })).toEqual([]);
  });

  it('dois exames no mesmo dia são coincidência forte, em qualquer época', () => {
    const [c] = detetarChoques([exame('2027-02-16'), exame('2027-02-16')]);
    expect(c.coincidencia).toBe(true);
    expect(c.forte).toBe(true);
  });

  it('exames em dias seguidos só são coincidência na época normal', () => {
    const itens = [exame('2027-01-05'), exame('2027-01-06')];
    expect(detetarChoques(itens, { epocaNormal: true })).toHaveLength(1);
    expect(detetarChoques(itens, { epocaNormal: true })[0].coincidencia).toBe(true);
    expect(detetarChoques(itens, { epocaNormal: false })).toEqual([]);
  });

  it('a época normal pode vir como função do dia', () => {
    const itens = [exame('2027-01-05'), exame('2027-01-06')];
    expect(detetarChoques(itens, { epocaNormal: (d) => d === '2027-01-05' })).toHaveLength(1);
    expect(detetarChoques(itens, { epocaNormal: (d) => d === '2027-01-06' })).toEqual([]);
  });

  it('dois exames com dois dias de intervalo não chocam', () => {
    expect(detetarChoques([exame('2027-01-05'), exame('2027-01-07')], { epocaNormal: true })).toEqual([]);
  });

  it('frequência e outro evento no mesmo dia é choque forte, mas não coincidência de exames', () => {
    const [c] = detetarChoques([freq('2026-12-10'), { chave: 'e', dia: '2026-12-10', tipo: 'entrega', titulo: 'Entrega' }]);
    expect(c.forte).toBe(true);
    expect(c.coincidencia).toBe(false);
  });

  it('duas aulas do horário nunca chocam', () => {
    expect(detetarChoques([aula('2026-10-05', 'A'), aula('2026-10-05', 'B')])).toEqual([]);
  });

  it('aula e evento não-forte no mesmo dia é choque fraco', () => {
    const [c] = detetarChoques([aula('2026-10-05'), { chave: 'x', dia: '2026-10-05', tipo: 'outro', titulo: 'Jantar' }]);
    expect(c.forte).toBe(false);
  });

  it('aulas canceladas ou dadas pelo stor não contam', () => {
    expect(detetarChoques([aula('2026-12-10', 'A', { estadoAula: 'cancelada' }), freq('2026-12-10')])).toEqual([]);
    expect(detetarChoques([aula('2026-12-10', 'A', { estadoAula: 'stotFaltou' }), freq('2026-12-10')])).toEqual([]);
  });

  it('eventos cancelados não contam', () => {
    expect(detetarChoques([{ ...freq('2026-12-10'), estado: 'cancelado' }, exame('2026-12-10')])).toEqual([]);
  });

  it('ignora itens sem dia', () => {
    expect(detetarChoques([{ chave: 'a', tipo: 'exame' }, exame('2027-01-05')])).toEqual([]);
  });
});

describe('choquesPorDia', () => {
  it('um choque em dias seguidos aparece nos dois dias', () => {
    const choques = detetarChoques([exame('2027-01-05'), exame('2027-01-06')], { epocaNormal: true });
    const porDia = choquesPorDia(choques);
    expect(porDia['2027-01-05']).toHaveLength(1);
    expect(porDia['2027-01-06']).toHaveLength(1);
  });

  it('um choque no mesmo dia aparece uma só vez', () => {
    const porDia = choquesPorDia(detetarChoques([exame('2027-02-16'), exame('2027-02-16')]));
    expect(porDia['2027-02-16']).toHaveLength(1);
  });
});
