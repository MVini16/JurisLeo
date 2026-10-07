// o cartão "Hoje" do dashboard: as contas todas, puras (sem react nem firebase), para testar com vitest.
// os dados vêm dos flashcards e das tarefas que a app já lê; o que se conta no dia fica só em localStorage
import { estaPronto } from './repeticaoEspacada.js';

export const META_DIARIA = 10;

export const VARIANTES_HOJE = [
  { id: 'serie', nome: 'Série e meta diária', descricao: 'Um anel que enche com os flashcards de hoje e os dias seguidos.' },
  { id: 'stories', nome: 'Stories por cadeira', descricao: 'Círculos por cadeira com os flashcards prontos.' },
  { id: 'desafio', nome: 'Desafio do dia', descricao: 'Uma pergunta que vira ao toque.' },
  { id: 'barra', nome: 'Barra de hoje', descricao: 'Três números simples, bem compactos.' },
  { id: 'nenhum', nome: 'Sem cartão', descricao: 'O dashboard fica como era.' },
];
export const VARIANTE_HOJE_INICIAL = 'stories';

export function varianteHojeValida(id) {
  return VARIANTES_HOJE.some((v) => v.id === id) ? id : VARIANTE_HOJE_INICIAL;
}

// quantos flashcards prontos há por cadeira: { cadeiraId: n }
export function prontosPorCadeira(flashcards, agora = new Date()) {
  const contas = {};
  flashcards.forEach((f) => {
    if (!estaPronto(f, agora)) return;
    contas[f.cadeiraId] = (contas[f.cadeiraId] || 0) + 1;
  });
  return contas;
}

export function totalProntos(flashcards, agora = new Date()) {
  return flashcards.filter((f) => estaPronto(f, agora)).length;
}

// tarefas por fazer com prazo até daqui a `dias` dias (as atrasadas contam). `hoje` é YYYY-MM-DD
export function tarefasAVencer(tarefas, hoje, dias = 3) {
  const [a, m, d] = hoje.split('-').map(Number);
  const limite = new Date(a, m - 1, d + dias);
  const limiteTexto = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, '0')}-${String(limite.getDate()).padStart(2, '0')}`;
  return tarefas.filter((t) => !t.concluida && t.prazo && t.prazo <= limiteTexto);
}

// o mesmo flashcard durante o dia todo (para o desafio não mudar a cada visita); muda de dia para dia
export function desafioDoDia(flashcards, hoje) {
  if (flashcards.length === 0) return null;
  const prontos = flashcards.filter((f) => estaPronto(f));
  const base = (prontos.length > 0 ? prontos : flashcards).slice().sort((x, y) => String(x.id).localeCompare(String(y.id)));
  let soma = 0;
  for (const letra of hoje) soma = (soma * 31 + letra.charCodeAt(0)) % 100003;
  return base[soma % base.length];
}

// ---------- o que ela respondeu hoje ----------

export function respondidasHoje(registo, hoje) {
  return registo && registo.dia === hoje ? registo.n : 0;
}

export function somarRespostas(registo, hoje, n = 1) {
  return { dia: hoje, n: respondidasHoje(registo, hoje) + n };
}

export function progressoDaMeta(respondidas, meta = META_DIARIA) {
  return Math.min(1, Math.max(0, respondidas / meta));
}
