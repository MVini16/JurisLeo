// prazos em cadeia: ao marcar uma frequência ou um exame, criam-se lembretes de estudo antes da data.
// função pura, sem firebase nem react. os passos são hábitos de quem gere prazos, não regras do regulamento.
import { chaveData } from '../data/feriados.js';

export const PASSOS_EM_CADEIA = [
  { dias: 14, texto: 'Começar a estudar para', prioridade: 'media' },
  { dias: 7, texto: 'Fechar o resumo de', prioridade: 'media' },
  { dias: 2, texto: 'Revisão final de', prioridade: 'alta' },
];

// só há lembretes para frequências e exames
export function pedeLembretes(tipo) {
  return tipo === 'frequencia' || tipo === 'exame';
}

// as tarefas a criar; ignora os passos cujo prazo já passou (não faz sentido lembrar do que é para trás)
// dataProva: Date ou 'aaaa-mm-dd'
export function tarefasEmCadeia({ titulo, cadeira = null, dataProva, hoje = new Date() }) {
  const prova = typeof dataProva === 'string' ? new Date(`${dataProva}T12:00:00`) : dataProva;
  if (!prova || Number.isNaN(prova.getTime()) || !String(titulo ?? '').trim()) return [];
  const hojeChave = chaveData(hoje);

  return PASSOS_EM_CADEIA
    .map((p) => {
      const dia = new Date(prova.getFullYear(), prova.getMonth(), prova.getDate() - p.dias, 12);
      return { passo: p, prazo: chaveData(dia) };
    })
    .filter(({ prazo }) => prazo >= hojeChave)
    .map(({ passo, prazo }) => ({
      titulo: `${passo.texto} ${String(titulo).trim()}`,
      cadeira,
      tipo: 'outro',
      prioridade: passo.prioridade,
      prazo,
      notas: 'Lembrete criado ao marcar a prova.',
      concluida: false,
    }));
}
