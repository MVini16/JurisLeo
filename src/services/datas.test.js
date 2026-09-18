import { describe, it, expect } from 'vitest';
import { dataDeChave, diasEntre, dataCurta, dataNatural, textoPrazo } from './datas.js';

const hoje = new Date(2026, 8, 16, 10, 0); // quarta, 16 de setembro de 2026

describe('dataDeChave', () => {
  it('lê aaaa-mm-dd em hora local', () => {
    const d = dataDeChave('2026-09-07');
    expect(d.getDate()).toBe(7);
    expect(d.getMonth()).toBe(8);
  });
});

describe('diasEntre', () => {
  it('conta dias de calendário, ignorando a hora', () => {
    expect(diasEntre(new Date(2026, 8, 16, 23, 59), new Date(2026, 8, 17, 0, 1))).toBe(1);
  });
});

describe('dataNatural', () => {
  it('hoje, amanhã e ontem', () => {
    expect(dataNatural(new Date(2026, 8, 16), hoje)).toBe('hoje');
    expect(dataNatural(new Date(2026, 8, 17), hoje)).toBe('amanhã');
    expect(dataNatural(new Date(2026, 8, 15), hoje)).toBe('ontem');
  });
  it('até 7 dias usa o dia da semana', () => {
    expect(dataNatural(new Date(2026, 8, 18), hoje)).toBe('sexta-feira');
  });
  it('a partir daí usa a data', () => {
    expect(dataNatural(new Date(2026, 8, 30), hoje)).toBe('quarta, 30 de setembro');
  });
});

describe('dataCurta', () => {
  it('escreve o dia da semana e o mês por extenso', () => {
    expect(dataCurta(new Date(2026, 8, 14))).toBe('segunda, 14 de setembro');
  });
});

describe('textoPrazo', () => {
  it('prazo amanhã', () => {
    expect(textoPrazo(new Date(2026, 8, 17, 23, 59, 59), hoje)).toBe('até amanhã às 24h');
  });
  it('prazo hoje', () => {
    expect(textoPrazo(new Date(2026, 8, 16, 23, 59, 59), hoje)).toBe('até hoje às 24h');
  });
  it('prazo passado', () => {
    expect(textoPrazo(new Date(2026, 8, 15, 23, 59, 59), hoje)).toBe('o prazo já passou');
  });
});
