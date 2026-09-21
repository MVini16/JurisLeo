import { describe, it, expect } from 'vitest';
import { resumirDados, triagem } from './consola.js';

const HOJE = new Date(2026, 8, 23, 12); // quarta, 23 de setembro de 2026
const noite = (h, e, m, texto = '') => ({ noite: { humor: h, energia: e, motivacao: m, texto } });

describe('consola: bem-estar', () => {
  it('sem registos, avisa que ainda não há nada e não inventa alertas', () => {
    const r = resumirDados({}, HOJE);
    expect(r.bemEstar.temRegistos).toBe(false);
    expect(r.bemEstar.alerta).toBeNull();
    expect(triagem(r, HOJE)).toEqual([]);
  });

  it('resume a série, a sequência e o último texto', () => {
    const r = resumirDados({ registosDiarios: { '2026-09-23': noite(4, 4, 4, 'correu bem'), '2026-09-22': noite(3, 3, 3) } }, HOJE);
    expect(r.bemEstar.temRegistos).toBe(true);
    expect(r.bemEstar.serie).toHaveLength(7);
    expect(r.bemEstar.sequencia).toBe(2);
    expect(r.bemEstar.texto).toEqual({ data: '2026-09-23', texto: 'correu bem' });
  });

  it('três dias em baixo é urgente e diz que ela sabe que ele foi avisado', () => {
    const registosDiarios = { '2026-09-23': noite(2, 3, 3), '2026-09-22': noite(1, 3, 3), '2026-09-21': noite(2, 3, 3) };
    const t = triagem(resumirDados({ registosDiarios }, HOJE), HOJE);
    expect(t[0]).toMatchObject({ id: 'bem-estar-persistente', severidade: 'urgente', titulo: 'O humor está em baixo há 3 dias' });
    expect(t[0].detalhe).toMatch(/sabe que foste avisado/);
  });

  it('um texto recente aparece como mensagem; um texto antigo não', () => {
    const recente = triagem(resumirDados({ registosDiarios: { '2026-09-22': noite(3, 3, 3, 'estou farta') } }, HOJE), HOJE);
    expect(recente).toEqual([expect.objectContaining({ id: 'bem-estar-texto', severidade: 'info', detalhe: 'estou farta' })]);
    const antigo = triagem(resumirDados({ registosDiarios: { '2026-09-10': noite(3, 3, 3, 'antigo') } }, HOJE), HOJE);
    expect(antigo).toEqual([]);
  });

  it('um dia apagado não entra no texto nem na sequência', () => {
    const r = resumirDados({ registosDiarios: { '2026-09-23': { apagado: true, noite: { texto: 'segredo' } } } }, HOJE);
    expect(r.bemEstar.texto).toBeNull();
    expect(r.bemEstar.sequencia).toBe(0);
    expect(JSON.stringify(r)).not.toContain('segredo');
  });
});
