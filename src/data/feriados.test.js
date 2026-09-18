import { describe, it, expect } from 'vitest';
import { pascoa, feriadosDoAno, nomeFeriado, ehFeriado, chaveData } from './feriados.js';

describe('pascoa', () => {
  it('calcula a páscoa dos anos que interessam', () => {
    expect(chaveData(pascoa(2026))).toBe('2026-04-05');
    expect(chaveData(pascoa(2027))).toBe('2027-03-28');
    expect(chaveData(pascoa(2028))).toBe('2028-04-16');
    expect(chaveData(pascoa(2024))).toBe('2024-03-31');
  });
});

describe('feriadosDoAno', () => {
  it('tem os 13 feriados nacionais', () => {
    expect(feriadosDoAno(2026)).toHaveLength(13);
  });

  it('calcula as datas móveis a partir da páscoa', () => {
    const f = feriadosDoAno(2027);
    const chave = (nome) => f.find((x) => x.nome === nome).chave;
    expect(chave('Sexta-feira Santa')).toBe('2027-03-26');
    expect(chave('Páscoa')).toBe('2027-03-28');
    expect(chave('Corpo de Deus')).toBe('2027-05-27');
  });

  it('marca só as datas móveis como móveis', () => {
    const moveis = feriadosDoAno(2026).filter((f) => f.movel).map((f) => f.nome);
    expect(moveis).toEqual(['Sexta-feira Santa', 'Páscoa', 'Corpo de Deus']);
  });
});

describe('nomeFeriado e ehFeriado', () => {
  it('reconhece os feriados do semestre letivo', () => {
    expect(nomeFeriado(new Date(2026, 9, 5))).toBe('Implantação da República');
    expect(nomeFeriado(new Date(2026, 10, 1))).toBe('Todos os Santos');
    expect(nomeFeriado(new Date(2026, 11, 1))).toBe('Restauração da Independência');
    expect(nomeFeriado(new Date(2026, 11, 8))).toBe('Imaculada Conceição');
  });

  it('um dia normal não é feriado', () => {
    expect(ehFeriado(new Date(2026, 8, 7))).toBe(false);
    expect(nomeFeriado(new Date(2026, 8, 7))).toBeNull();
  });

  it('ignora a hora do dia', () => {
    expect(ehFeriado(new Date(2026, 11, 25, 23, 59))).toBe(true);
  });
});
