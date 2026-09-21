import { describe, it, expect } from 'vitest';
import { contarPalavras, resumirCadeira, resumirDados, triagem } from './consola.js';

const HOJE = new Date(2026, 8, 23, 12); // quarta, 23 de setembro de 2026
const cadeira = { id: 'administrativo-1', abrev: 'DA I', nome: 'Direito Administrativo I', metodo: 'A', aulasPraticasPrevistas: 30 };
const sessao = (dia, minutos) => ({ inicio: new Date(2026, 8, dia, 10), minutos, cadeiraId: 'administrativo-1' });

describe('contarPalavras', () => {
  it('conta palavras e ignora espaços a mais', () => {
    expect(contarPalavras('  o contrato   é um negócio  ')).toBe(5);
    expect(contarPalavras('')).toBe(0);
    expect(contarPalavras(undefined)).toBe(0);
  });
});

describe('resumirCadeira', () => {
  it('sem dados devolve a cadeira sem avaliação nem faltas', () => {
    const r = resumirCadeira({ cadeira });
    expect(r).toMatchObject({ id: 'administrativo-1', abrev: 'DA I', avaliacao: null, faltas: null });
  });

  it('calcula as faltas com o mesmo motor da app', () => {
    const r = resumirCadeira({ cadeira, faltasDados: { aulasPraticasLecionadas: 14, faltasInjustificadas: 7, faltasJustificadas: 0 } });
    expect(r.faltas.faltasRestantesSemestre).toBe(0);
    expect(r.faltas.semaforo).toBe('vermelho');
  });

  it('calcula a avaliação quando há elementos', () => {
    const r = resumirCadeira({ cadeira, avaliacaoDados: { provaEscrita: 14, outrosElementos: 14 } });
    expect(r.avaliacao).not.toBeNull();
    expect(r.avaliacao.explicacao).toBeTruthy();
  });

  it('usa os dados fixos da cadeira quando o documento não os traz', () => {
    const r = resumirCadeira({ cadeira: { id: 'administrativo-1' }, faltasDados: { aulasPraticasLecionadas: 2, faltasInjustificadas: 0, faltasJustificadas: 0 } });
    expect(r.abrev).toBe('DA I');
    expect(r.faltas).not.toBeNull();
  });
});

describe('resumirDados', () => {
  const dados = {
    cadeiras: [cadeira],
    faltas: { 'administrativo-1': { aulasPraticasLecionadas: 6, faltasInjustificadas: 1, faltasJustificadas: 0 } },
    tarefas: [
      { titulo: 'Trabalho', concluida: false, prazo: '2026-09-20' },
      { titulo: 'Leitura', concluida: false, prazo: '2026-09-30' },
      { titulo: 'Feita', concluida: true, prazo: '2026-09-01' },
      { titulo: 'Sem prazo', concluida: false },
    ],
    sessoes: [sessao(23, 60), sessao(22, 30), sessao(21, 45)],
    anotacoes: [{ conteudo: 'um dois três' }, { conteudo: 'quatro cinco' }],
    casos: [{ estado: 'porResolver' }, { estado: 'duvida' }, { estado: 'corrigido' }],
    flashcards: [{ proximaRevisao: new Date(2026, 8, 1) }, { proximaRevisao: new Date(2026, 9, 30) }, {}],
    eventos: [
      { tipo: 'frequencia', titulo: 'Freq. TGDC', data: new Date(2026, 8, 25, 9), cadeira: 'x' },
      { tipo: 'frequencia', titulo: 'Passada', data: new Date(2026, 8, 1, 9) },
      { tipo: 'frequencia', titulo: 'Cancelada', data: new Date(2026, 8, 24, 9), estado: 'cancelado' },
    ],
  };
  const r = resumirDados(dados, HOJE);

  it('conta as tarefas pendentes e as atrasadas', () => {
    expect(r.tarefas).toMatchObject({ pendentes: 3, atrasadas: 1, titulosAtrasadas: ['Trabalho'] });
  });

  it('resume o estudo: minutos da semana e sequência', () => {
    expect(r.estudo.minutosSemana).toBe(135);
    expect(r.estudo.sequencia).toBe(3);
    expect(r.estudo.sessoes).toBe(3);
  });

  it('só conta números da produção, nunca o texto', () => {
    expect(r.producao).toMatchObject({ anotacoes: 2, palavras: 5, casosTotal: 3, casosPorResolver: 2, flashcardsTotal: 3, flashcardsProntos: 2 });
    expect(JSON.stringify(r)).not.toContain('quatro cinco');
  });

  it('encontra a próxima prova, ignorando as passadas e as canceladas', () => {
    expect(r.proximaProva).toMatchObject({ titulo: 'Freq. TGDC', diasRestantes: 2 });
  });

  it('sem eventos não há próxima prova', () => {
    expect(resumirDados({}, HOJE).proximaProva).toBeNull();
  });
});

describe('triagem', () => {
  const base = { cadeiras: [], tarefas: { pendentes: 0, atrasadas: 0, titulosAtrasadas: [] }, proximaProva: null };

  it('está tudo bem quando não há nada a assinalar', () => {
    expect(triagem(base)).toEqual([]);
  });

  it('faltas no limite é urgente; a chegar ao limite é aviso', () => {
    const r = triagem({
      ...base,
      cadeiras: [
        { id: 'a', abrev: 'A', faltas: { faltasRestantesSemestre: 0, explicacao: 'sem margem' } },
        { id: 'b', abrev: 'B', faltas: { faltasRestantesSemestre: 2, quaseNoLimite: true, explicacao: 'duas' } },
      ],
    });
    expect(r.map((i) => [i.id, i.severidade])).toEqual([['faltas-a', 'urgente'], ['faltas-b', 'aviso']]);
  });

  it('cadeira excluída da avaliação é urgente', () => {
    const r = triagem({ ...base, cadeiras: [{ id: 'a', abrev: 'A', avaliacao: { estado: 'excluida', explicacao: 'x' } }] });
    expect(r[0]).toMatchObject({ severidade: 'urgente', titulo: 'A: excluída da avaliação' });
  });

  it('tarefas atrasadas são um aviso, com os títulos', () => {
    const r = triagem({ ...base, tarefas: { pendentes: 2, atrasadas: 2, titulosAtrasadas: ['x', 'y'] } });
    expect(r[0]).toMatchObject({ severidade: 'aviso', titulo: '2 tarefas atrasadas', detalhe: 'x, y' });
  });

  it('uma prova nos próximos 7 dias é informação; mais longe não aparece', () => {
    expect(triagem({ ...base, proximaProva: { titulo: 'Freq.', diasRestantes: 1 } })[0].titulo).toBe('Freq. amanhã');
    expect(triagem({ ...base, proximaProva: { titulo: 'Freq.', diasRestantes: 30 } })).toEqual([]);
  });

  it('ordena do mais urgente para o menos', () => {
    const r = triagem({
      cadeiras: [{ id: 'a', abrev: 'A', faltas: { faltasRestantesSemestre: 0, explicacao: '' } }],
      tarefas: { pendentes: 1, atrasadas: 1, titulosAtrasadas: ['t'] },
      proximaProva: { titulo: 'F', diasRestantes: 0 },
    });
    expect(r.map((i) => i.severidade)).toEqual(['urgente', 'aviso', 'info']);
  });
});
