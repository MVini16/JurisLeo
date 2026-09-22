// balanço de domingo: horas, cartões, sumários e o que ficou por fazer, na semana corrente —
// função pura, sem firebase nem react. semana começa à segunda-feira, como no resto da app.
import { chaveData } from '../data/feriados.js';

const PERGUNTAS = [
  'O que correu melhor esta semana?',
  'O que deixarias para trás, se pudesses?',
  'Que cadeira precisa de mais atenção na próxima semana?',
  'Houve algum dia em que quase desististe? O que te fez continuar?',
  'O que farias diferente, se a semana recomeçasse hoje?',
];

function paraData(valor) {
  return valor?.toDate?.() ?? (valor instanceof Date ? valor : null);
}

export function segundaDaSemana(data) {
  const d = new Date(data);
  const dia = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - dia);
  d.setHours(0, 0, 0, 0);
  return d;
}

function naSemana(data, segunda) {
  if (!data) return false;
  const chave = chaveData(data);
  const chaveSegunda = chaveData(segunda);
  const domingo = new Date(segunda);
  domingo.setDate(domingo.getDate() + 6);
  return chave >= chaveSegunda && chave <= chaveData(domingo);
}

// número iso-ish da semana (só para escolher a pergunta de forma estável, não precisa de ser exato)
function numeroDaSemana(data) {
  const inicioAno = new Date(data.getFullYear(), 0, 1);
  return Math.floor((data - inicioAno) / (7 * 86400000));
}

export function perguntaDaSemana(hoje = new Date()) {
  return PERGUNTAS[numeroDaSemana(hoje) % PERGUNTAS.length];
}

// { minutos, flashcards, sumarios, tarefasPorFazer, pergunta }
export function balancoDaSemana({ sessoes = [], flashcards = [], sumarios = [], tarefas = [] }, hoje = new Date()) {
  const segunda = segundaDaSemana(hoje);

  const minutos = sessoes
    .filter((s) => naSemana(paraData(s.inicio), segunda))
    .reduce((soma, s) => soma + (s.minutos || 0), 0);

  const flashcardsRevistos = flashcards.filter((f) => naSemana(paraData(f.ultimaRevisaoEm), segunda)).length;
  const sumariosFeitos = sumarios.filter((s) => naSemana(paraData(s.atualizadoEm), segunda)).length;
  const tarefasPorFazer = tarefas.filter((t) => !t.concluida).length;

  return {
    minutos,
    flashcardsRevistos,
    sumariosFeitos,
    tarefasPorFazer,
    pergunta: perguntaDaSemana(hoje),
  };
}
