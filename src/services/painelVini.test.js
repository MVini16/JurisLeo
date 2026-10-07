import { describe, it, expect } from 'vitest';
import { painelDaLeonor } from './painelVini.js';

const dados = {
  perfil: { nome: 'Leonor' },
  configuracoes: {
    copiaLocalEm: 1000,
    copiaLocal: {
      'jurisleo-jogos-perfil': { v: JSON.stringify({ xp: 450, jogadas: 12, selos: ['a', 'b'] }), em: 900 },
      'jurisleo-jogos': { v: JSON.stringify({ vf: { melhor: 80 } }), em: 800 },
    },
  },
  cadeiras: [
    { id: 'familia', faltas: { aulasPraticasPrevistas: 30 }, presencas: { marcas: {
      'a_2026-10-01': { estado: 'presente', contaFalta: true, data: '2026-10-01' },
      'a_2026-10-06': { estado: 'faltei', contaFalta: true, data: '2026-10-06' },
      'b_2026-10-02': { estado: 'presente', contaFalta: false, data: '2026-10-02' },
    }, notasAulas: { 'a_2026-10-01': { sumario: 'x' } } } },
  ],
  tarefas: [{ titulo: 'Ler o manual', concluida: false }, { titulo: 'feita', concluida: true }],
  anotacoes: [{}],
};

describe('painelDaLeonor', () => {
  const p = painelDaLeonor(dados);

  it('resume cada cadeira com as contas do motor de faltas', () => {
    expect(p.cadeiras[0]).toMatchObject({ abrev: 'DF', marcadas: 3, presentes: 2, lecionadas: 2, injustificadas: 1, justificadas: 0, sumarios: 1 });
    expect(p.cadeiras[0].semaforo).toBeDefined();
  });

  it('lista as aulas mais recentes primeiro', () => {
    expect(p.recentes.map((r) => r.data)).toEqual(['2026-10-06', '2026-10-02', '2026-10-01']);
    expect(p.recentes[0]).toMatchObject({ cadeira: 'DF', estado: 'Faltei' });
  });

  it('lê os jogos da cópia do telemóvel', () => {
    expect(p.jogos).toMatchObject({ xp: 450, jogadas: 12, selos: 2, recordes: [{ jogo: 'vf', melhor: 80 }] });
    expect(typeof p.jogos.nivel).toBe('string');
  });

  it('escolhas, contagens e tarefas por fazer', () => {
    expect(p.escolhas[0]).toEqual({ chave: 'jogos-perfil', em: 900 });
    expect(p.ultimaCopiaLocal).toBe(1000);
    expect(p.contagens.notas).toBe(1);
    expect(p.tarefasPorFazer).toEqual(['Ler o manual']);
  });

  it('sem dados não rebenta', () => {
    const vazio = painelDaLeonor({});
    expect(vazio.cadeiras).toEqual([]);
    expect(vazio.jogos).toBeNull();
  });
});
