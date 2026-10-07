// lógica pura do modo estudo vertical: gestos, resumo da sessão e série de dias seguidos.
// sem react nem firebase, para testar com vitest sem mocks. a série fica só em localstorage, no componente

export const VARIANTES_ESTUDO = [
  { id: 'feed', nome: 'Feed', descricao: 'Um cartão por ecrã, sobe para o seguinte.' },
  { id: 'pilha', nome: 'Pilha de cartas', descricao: 'Atira para a direita se acertaste, para a esquerda se erraste.' },
  { id: 'story', nome: 'Story', descricao: 'Barra de progresso no topo e toque nas laterais.' },
  { id: 'processo', nome: 'Processo', descricao: 'Folha pautada com carimbos de procedente e improcedente.' },
];
export const VARIANTE_INICIAL = 'feed';

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
