// repetição espaçada, estilo leitner — 5 níveis (0 a 4), cada um com um
// intervalo maior até à próxima revisão. função pura, sem firebase nem react.

const INTERVALOS_DIAS = [1, 2, 4, 7, 15];

// calcula o novo nível e a data da próxima revisão, consoante a resposta
export function calcularProximaRevisao(nivelAtual, acertou) {
  const novoNivel = acertou
    ? Math.min(4, nivelAtual + 1)
    : Math.max(0, nivelAtual - 1);

  const dias = INTERVALOS_DIAS[novoNivel];
  const proximaRevisao = new Date();
  proximaRevisao.setDate(proximaRevisao.getDate() + dias);

  return { novoNivel, proximaRevisao };
}

// diz se um flashcard já está pronto para ser revisto hoje
export function estaPronto(flashcard, agora = new Date()) {
  if (!flashcard.proximaRevisao) return true;
  const data = flashcard.proximaRevisao?.toDate?.() || new Date(flashcard.proximaRevisao);
  return data <= agora;
}

// ordena: prontos para rever primeiro, depois os de nível mais baixo (mais difíceis)
export function ordenarPorPrioridade(flashcards) {
  return [...flashcards].sort((a, b) => {
    const prontoA = estaPronto(a);
    const prontoB = estaPronto(b);
    if (prontoA !== prontoB) return prontoA ? -1 : 1;
    return (a.nivel ?? 0) - (b.nivel ?? 0);
  });
}
