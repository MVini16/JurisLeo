import { describe, it, expect } from 'vitest';
import { detetarChoques, choquesPorDia, explicarChoque, TIPOS_PROVA } from './coincidencias.js';
import { naEpocaNormal } from '../data/calendarioEscolar.js';

// datas fixas para os testes, fora de qualquer época real, com época normal simulada manualmente
const epocaNormalFalsa = (data) => data >= new Date(2100, 0, 1) && data <= new Date(2100, 0, 31);

describe('detetarChoques', () => {
  it('não deteta nada com uma lista vazia', () => {
    expect(detetarChoques([])).toEqual([]);
  });

  it('deteta duas provas no mesmo dia, fora de época normal', () => {
    const itens = [
      { id: 'a', titulo: 'Frequência DA I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
    ];
    const choques = detetarChoques(itens);
    expect(choques).toHaveLength(1);
    expect(choques[0].tipo).toBe('mesmoDia');
  });

  it('não deteta nada em dias consecutivos fora de época normal', () => {
    const itens = [
      { id: 'a', titulo: 'Frequência DA I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 6) },
    ];
    expect(detetarChoques(itens)).toEqual([]);
  });

  it('deteta dias consecutivos quando ambas as datas estão em época normal', () => {
    const itens = [
      { id: 'a', titulo: 'Exame DA I', tipo: 'exame', data: new Date(2100, 0, 10) },
      { id: 'b', titulo: 'Exame DO I', tipo: 'exame', data: new Date(2100, 0, 11) },
    ];
    const choques = detetarChoques(itens, { epocaNormal: epocaNormalFalsa });
    expect(choques).toHaveLength(1);
    expect(choques[0].tipo).toBe('diaConsecutivo');
  });

  it('não deteta nada com 2 dias de intervalo, mesmo em época normal', () => {
    const itens = [
      { id: 'a', titulo: 'Exame DA I', tipo: 'exame', data: new Date(2100, 0, 10) },
      { id: 'b', titulo: 'Exame DO I', tipo: 'exame', data: new Date(2100, 0, 12) },
    ];
    expect(detetarChoques(itens, { epocaNormal: epocaNormalFalsa })).toEqual([]);
  });

  it('não conta se só uma das datas está em época normal', () => {
    const itens = [
      { id: 'a', titulo: 'Exame DA I', tipo: 'exame', data: new Date(2100, 0, 31) },
      { id: 'b', titulo: 'Exame DO I', tipo: 'exame', data: new Date(2100, 1, 1) },
    ];
    expect(detetarChoques(itens, { epocaNormal: epocaNormalFalsa })).toEqual([]);
  });

  it('ignora aulas do horário (repetido: true), mesmo no mesmo dia', () => {
    const itens = [
      { id: 'a', titulo: 'Aula DA I', tipo: 'aula', repetido: true, data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
    ];
    expect(detetarChoques(itens)).toEqual([]);
  });

  it('ignora eventos cancelados', () => {
    const itens = [
      { id: 'a', titulo: 'Frequência DA I', tipo: 'frequencia', estado: 'cancelado', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
    ];
    expect(detetarChoques(itens)).toEqual([]);
  });

  it('ignora aulas canceladas ou dadas pelo stor (estadoAula)', () => {
    const itens = [
      { id: 'a', titulo: 'Aula DA I', tipo: 'frequencia', estadoAula: 'cancelada', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Aula DO I', tipo: 'frequencia', estadoAula: 'stotFaltou', data: new Date(2026, 10, 5) },
      { id: 'c', titulo: 'Frequência DF', tipo: 'frequencia', data: new Date(2026, 10, 5) },
    ];
    expect(detetarChoques(itens)).toEqual([]);
  });

  it('ignora tipos que não são prova (entrega, outro, aula)', () => {
    const itens = [
      { id: 'a', titulo: 'Entrega de trabalho', tipo: 'entrega', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Aniversário', tipo: 'outro', data: new Date(2026, 10, 5) },
    ];
    expect(detetarChoques(itens)).toEqual([]);
  });

  it('deteta várias coincidências independentes numa lista maior', () => {
    const itens = [
      { id: 'a', titulo: 'Frequência DA I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
      { id: 'c', titulo: 'Oral DIP I', tipo: 'oral', data: new Date(2026, 11, 1) },
      { id: 'd', titulo: 'Frequência DF', tipo: 'frequencia', data: new Date(2026, 11, 20) },
    ];
    expect(detetarChoques(itens)).toHaveLength(1);
  });
});

describe('choquesPorDia', () => {
  it('agrupa os ids em coincidência pelo dia', () => {
    const itens = [
      { id: 'a', titulo: 'Frequência DA I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
      { id: 'b', titulo: 'Frequência DO I', tipo: 'frequencia', data: new Date(2026, 10, 5) },
    ];
    const porDia = choquesPorDia(itens);
    const chave = new Date(2026, 10, 5).toDateString();
    expect(porDia[chave]).toEqual(['a', 'b']);
  });

  it('fica vazio quando não há choques', () => {
    expect(choquesPorDia([])).toEqual({});
  });
});

describe('explicarChoque', () => {
  it('entre dois exames, cita o direito a mudar de data do art. 39.º', () => {
    const choque = { a: { titulo: 'Exame DA I', tipo: 'exame' }, b: { titulo: 'Oral DO I', tipo: 'oral' }, tipo: 'mesmoDia' };
    const texto = explicarChoque(choque);
    expect(texto).toContain('Exame DA I');
    expect(texto).toContain('Oral DO I');
    expect(texto).toContain('39.º');
    expect(texto).toMatch(/direito a pedir/i);
  });

  it('com uma frequência envolvida, não afirma o direito automático a mudar de data', () => {
    const choque = { a: { titulo: 'Frequência DA I', tipo: 'frequencia' }, b: { titulo: 'Frequência DO I', tipo: 'frequencia' }, tipo: 'mesmoDia' };
    const texto = explicarChoque(choque);
    expect(texto).toContain('Frequência DA I');
    expect(texto).toContain('Frequência DO I');
    expect(texto).not.toMatch(/direito a pedir/i);
  });
});

describe('integração com naEpocaNormal real', () => {
  it('deteta dias consecutivos usando a época normal real do 1.º semestre', () => {
    const itens = [
      { id: 'a', titulo: 'Exame DA I', tipo: 'exame', data: new Date(2027, 0, 10) },
      { id: 'b', titulo: 'Exame DO I', tipo: 'exame', data: new Date(2027, 0, 11) },
    ];
    const choques = detetarChoques(itens, { epocaNormal: naEpocaNormal });
    expect(choques).toHaveLength(1);
  });

  it('TIPOS_PROVA inclui frequencia, oral e exame', () => {
    expect(TIPOS_PROVA).toEqual(['frequencia', 'oral', 'exame']);
  });
});
