// lógica pura do modo estudo vertical: gestos, resumo da sessão e série de dias seguidos.
// sem react nem firebase, para testar com vitest sem mocks. a série fica só em localstorage, no componente

import { ordenarPorPrioridade } from './repeticaoEspacada.js';

export const VARIANTES_ESTUDO = [
  { id: 'feed', nome: 'Feed', descricao: 'Um cartão por ecrã, sobe para o seguinte.' },
  { id: 'pilha', nome: 'Pilha de cartas', descricao: 'Atira para a direita se acertaste, para a esquerda se erraste.' },
  { id: 'story', nome: 'Story', descricao: 'Como um story: barras no topo, toque nas laterais e combos.' },
  { id: 'processo', nome: 'Processo', descricao: 'Folha pautada com carimbos de procedente e improcedente.' },
];
export const VARIANTE_INICIAL = 'story';

export function varianteValida(id) {
  return VARIANTES_ESTUDO.some((v) => v.id === id) ? id : VARIANTE_INICIAL;
}

// o que foi um gesto de arrastar: 'cima' | 'baixo' | 'esquerda' | 'direita' | null (se foi curto demais)
export function direcaoDoGesto({ dx, dy }, limiar = 60) {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < limiar) return null;
  if (ax > ay) return dx > 0 ? 'direita' : 'esquerda';
  return dy > 0 ? 'baixo' : 'cima';
}

// o que o gesto significa em cada variante (a resposta só conta depois de o cartão estar virado)
export function acaoDoGesto(variante, direcao, virado) {
  if (!direcao) return null;
  if (variante === 'pilha') {
    if (!virado) return null;
    return direcao === 'direita' ? 'acertei' : direcao === 'esquerda' ? 'errei' : null;
  }
  if (variante === 'story') return null; // o story avança por toque nas laterais
  // feed e processo: deslizar para cima vira o cartão e, depois de virado, passa ao seguinte como "acertei"
  if (direcao === 'cima') return virado ? 'acertei' : 'virar';
  return null;
}

export function resumoDaSessao(respostas) {
  const total = respostas.length;
  const certas = respostas.filter(Boolean).length;
  return { total, certas, erradas: total - certas, percentagem: total === 0 ? 0 : Math.round((certas / total) * 100) };
}

export function mensagemFinal({ total, percentagem }) {
  if (total === 0) return 'Sessão vazia.';
  if (percentagem === 100) return 'Sessão perfeita, Leonor.';
  if (percentagem >= 70) return 'Muito bem, Leonor.';
  if (percentagem >= 40) return 'Está a ir no bom caminho.';
  return 'Amanhã voltas a ver estes, e vai correr melhor.';
}

// ---------- série de dias ----------

export function diaDe(data) {
  const d = new Date(data);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diaAnterior(dia) {
  const [a, m, d] = dia.split('-').map(Number);
  return diaDe(new Date(a, m - 1, d - 1));
}

export function registarDia(dias, hoje) {
  return dias.includes(hoje) ? dias : [...dias, hoje].sort().slice(-400);
}

// dias seguidos a acabar hoje (ou ontem, para a série não "morrer" antes de ela estudar hoje)
export function serieDeDias(dias, hoje) {
  const conjunto = new Set(dias);
  let dia = conjunto.has(hoje) ? hoje : diaAnterior(hoje);
  let serie = 0;
  while (conjunto.has(dia)) {
    serie += 1;
    dia = diaAnterior(dia);
  }
  return serie;
}

// ---------- extras do modo story ----------

// quantas respostas certas seguidas, a contar do fim (o "combo" que aparece no topo)
export function comboAtual(respostasPorOrdem) {
  let combo = 0;
  for (let i = respostasPorOrdem.length - 1; i >= 0 && respostasPorOrdem[i]; i -= 1) combo += 1;
  return combo;
}

// o próximo cartão por responder, a partir de `desde` e dando a volta ao princípio. -1 se já respondeu a todos
export function proximoPorResponder(lista, respostas, desde = 0) {
  for (let passo = 0; passo < lista.length; passo += 1) {
    const i = (desde + passo) % lista.length;
    if (!(lista[i].id in respostas)) return i;
  }
  return -1;
}

// mais `n` cartões para continuar a estudar: os que ainda não saíram, com os prontos e os mais difíceis primeiro
export function maisCartoes(todos, usados, n = 5) {
  const ids = new Set(usados.map((c) => c.id));
  const restantes = todos.filter((c) => !ids.has(c.id));
  return ordenarPorPrioridade(restantes).slice(0, n);
}

// as barras de progresso do topo: uma por cartão, ou uma só (contínua) quando são muitos
export const MAX_SEGMENTOS = 20;
export function barrasDeProgresso(total, indice) {
  if (total <= MAX_SEGMENTOS) {
    return { tipo: 'segmentos', estados: Array.from({ length: total }, (_, i) => (i < indice ? 'feito' : i === indice ? 'agora' : 'falta')) };
  }
  return { tipo: 'continua', fracao: total === 0 ? 0 : Math.min(1, (indice + 1) / total) };
}
