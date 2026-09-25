import { describe, it, expect } from 'vitest';
import { escaparTexto, dobrarLinha, itensDeEventos, itensDeTarefas, itensDeAulas, gerarIcs } from './ics.js';

const AGORA = new Date(Date.UTC(2026, 8, 25, 14, 30, 0));

describe('escaparTexto e dobrarLinha', () => {
  it('escapa vírgulas, pontos e vírgulas, barras e mudanças de linha', () => {
    expect(escaparTexto('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });

  it('parte linhas com mais de 75 bytes, com espaço no início da continuação', () => {
    const longa = `SUMMARY:${'Obrigações '.repeat(12)}`;
    const dobrada = dobrarLinha(longa);
    const partes = dobrada.split('\r\n');
    expect(partes.length).toBeGreaterThan(1);
    partes.forEach((p, i) => {
      expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
      if (i > 0) expect(p.startsWith(' ')).toBe(true);
    });
    expect(partes.map((p, i) => (i ? p.slice(1) : p)).join('')).toBe(longa);
  });
});

describe('itens', () => {
  const eventos = [
    { id: 'f1', tipo: 'frequencia', titulo: 'Freq. DO', data: new Date(2026, 11, 3), horaInicio: '14:00', horaFim: '15:30', sala: 'Anf. 1' },
    { id: 'c1', tipo: 'exame', titulo: 'Cancelado', data: new Date(2026, 11, 4), estado: 'cancelado' },
    { id: 'e1', tipo: 'entrega', titulo: 'Trabalho HRI', data: new Date(2026, 10, 20) },
    { id: 'v1', tipo: 'ferias', titulo: 'Natal', data: new Date(2026, 11, 21), dataFim: new Date(2026, 11, 23), dataOriginal: new Date(2026, 11, 21) },
    { id: 'v1', tipo: 'ferias', titulo: 'Natal', data: new Date(2026, 11, 22), dataFim: new Date(2026, 11, 23), dataOriginal: new Date(2026, 11, 21) },
    { id: 'a1', tipo: 'aula', titulo: 'Aula' },
  ];

  it('as provas levam hora, sala e aviso na véspera; as canceladas ficam de fora', () => {
    const provas = itensDeEventos(eventos, { soProvas: true });
    expect(provas).toHaveLength(1);
    expect(provas[0]).toMatchObject({ uid: 'evento-f1', local: 'Anf. 1', alarme: '-P1D', diaInteiro: false });
  });

  it('os outros eventos saem uma vez só, mesmo sendo de vários dias', () => {
    const outros = itensDeEventos(eventos, { soProvas: false });
    expect(outros.map((o) => o.uid)).toEqual(['evento-e1', 'evento-v1']);
    expect(outros[1]).toMatchObject({ diaInteiro: true });
  });

  it('prazos só das tarefas por fazer com prazo', () => {
    const t = itensDeTarefas([{ id: 't1', titulo: 'Resumo', prazo: '2026-10-02' }, { id: 't2', titulo: 'Feita', prazo: '2026-10-01', concluida: true }, { id: 't3', titulo: 'Sem prazo' }]);
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ titulo: 'Prazo: Resumo', diaInteiro: true, alarme: 'PT9H' });
  });

  it('aulas sem as canceladas', () => {
    const a = itensDeAulas([
      { tipo: 'aula', ocorrenciaId: 'o1', titulo: 'Direito das Obrigações I', tipoAula: 'pratica', data: new Date(2026, 8, 25), horaInicio: '16:10', horaFim: '17:00', sala: '12.02' },
      { tipo: 'aula', ocorrenciaId: 'o2', titulo: 'X', data: new Date(2026, 8, 25), horaInicio: '14:00', estadoAula: 'cancelada' },
    ]);
    expect(a).toHaveLength(1);
    expect(a[0].titulo).toBe('Direito das Obrigações I (prática)');
  });
});

describe('gerarIcs', () => {
  it('gera um calendário válido, com linhas CRLF, horas flutuantes e dia inteiro com fim exclusivo', () => {
    const texto = gerarIcs([
      ...itensDeEventos([{ id: 'f1', tipo: 'frequencia', titulo: 'Freq. DO, teórica', data: new Date(2026, 11, 3), horaInicio: '14:00', horaFim: '15:30' }], { soProvas: true }),
      ...itensDeTarefas([{ id: 't1', titulo: 'Resumo', prazo: '2026-10-02' }]),
    ], AGORA);
    expect(texto.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(texto.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(texto).toContain('DTSTAMP:20260925T143000Z');
    expect(texto).toContain('DTSTART:20261203T140000');
    expect(texto).toContain('DTEND:20261203T153000');
    expect(texto).toContain('SUMMARY:Freq. DO\\, teórica');
    expect(texto).toContain('TRIGGER:-P1D');
    expect(texto).toContain('DTSTART;VALUE=DATE:20261002');
    expect(texto).toContain('DTEND;VALUE=DATE:20261003');
    expect(texto.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(texto.match(/END:VEVENT/g)).toHaveLength(2);
  });
});
