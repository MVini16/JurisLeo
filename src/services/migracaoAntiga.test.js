import { describe, it, expect } from 'vitest';
import { migrarDaVersaoAntiga } from './migracaoAntiga.js';

const estado = (over) => ({ id: 'aula1_2026-10-06', aulaId: 'aula1', cadeiraId: 'familia', data: '2026-10-06', tipoAula: 'pratica', estado: 'fui', ...over });

describe('migrarDaVersaoAntiga', () => {
  it('converte os estados antigos nas marcas atuais, com a mesma chave', () => {
    const r = migrarDaVersaoAntiga({ estados: [estado(), estado({ id: 'aula2_2026-10-07', aulaId: 'aula2', estado: 'stotFaltou', tipoAula: 'teorica' })] });
    expect(r.marcas).toBe(2);
    expect(r.porCadeira.familia.marcas['aula1_2026-10-06']).toMatchObject({ estado: 'presente', contaFalta: true, data: '2026-10-06' });
    expect(r.porCadeira.familia.marcas['aula2_2026-10-07']).toMatchObject({ estado: 'prof-faltou', contaFalta: false });
  });

  it('faltei e cancelada também passam', () => {
    const r = migrarDaVersaoAntiga({ estados: [estado({ estado: 'faltei' }), estado({ id: 'x_2026-10-01', estado: 'cancelada' })] });
    expect(r.porCadeira.familia.marcas['aula1_2026-10-06'].estado).toBe('faltei');
    expect(r.porCadeira.familia.marcas['x_2026-10-01'].estado).toBe('sem-aula');
  });

  it('nunca pisa uma marca feita na versão atual', () => {
    const atuais = { familia: { marcas: { 'aula1_2026-10-06': { estado: 'faltei-justificada' } } } };
    const r = migrarDaVersaoAntiga({ estados: [estado()], atuais });
    expect(r.marcas).toBe(0);
    expect(r.porCadeira.familia).toBeUndefined();
  });

  it('ignora estados desconhecidos ou sem cadeira', () => {
    const r = migrarDaVersaoAntiga({ estados: [estado({ estado: 'porMarcar' }), estado({ cadeiraId: '' })] });
    expect(r.marcas).toBe(0);
  });

  it('passa os sumários (pontos) para o sumário da aula', () => {
    const r = migrarDaVersaoAntiga({ sumarios: [{ id: 'aula1_2026-10-06', cadeiraId: 'hri', data: '2026-10-06', bullets: [' Tratado de Vestefália ', '', 'Soberania'], atualizadoEm: { toMillis: () => 123 } }] });
    expect(r.sumarios).toBe(1);
    expect(r.porCadeira.hri.notasAulas['aula1_2026-10-06']).toEqual({
      sumario: '• Tratado de Vestefália\n• Soberania', nota: '', tpc: '', duvida: '', em: 123, data: '2026-10-06', titulo: '', cadeiraId: 'hri',
    });
  });

  it('sumários vazios ou já existentes ficam como estão', () => {
    const atuais = { hri: { notasAulas: { 'a_2026-10-06': { sumario: 'novo' } } } };
    const r = migrarDaVersaoAntiga({ sumarios: [{ id: 'a_2026-10-06', cadeiraId: 'hri', bullets: ['x'] }, { id: 'b_2026-10-06', cadeiraId: 'hri', bullets: [] }], atuais });
    expect(r.sumarios).toBe(0);
  });
});
