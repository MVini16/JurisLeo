// repetição espaçada, estilo leitner — 5 níveis (0 a 4), cada um com um
// intervalo maior até à próxima revisão. função pura, sem firebase nem react.

const INTERVALOS_DIAS = [1, 2, 4, 7, 15];

// como ela se sentiu com a resposta, de 1 a 5 (em vez de só certo ou errado)
export const CONFIANCAS = [
  { valor: 1, nome: 'Não sabia' },
  { valor: 2, nome: 'Mal' },
  { valor: 3, nome: 'Mais ou menos' },
  { valor: 4, nome: 'Bem' },
  { valor: 5, nome: 'De cor' },
];

// quantos níveis sobe (ou desce) cada confiança; 1 volta ao início
const SALTO_POR_CONFIANCA = { 2: -1, 3: 0, 4: 1, 5: 2 };

function proximaRevisaoEm(nivel) {
  const data = new Date();
  data.setDate(data.getDate() + INTERVALOS_DIAS[nivel]);
  return data;
}

// calcula o novo nível e a data da próxima revisão, consoante a confiança (1 a 5)
export function calcularProximaRevisaoPorConfianca(nivelAtual, confianca) {
  const c = Math.min(5, Math.max(1, Math.round(Number(confianca) || 1)));
  const novoNivel = c === 1 ? 0 : Math.min(4, Math.max(0, nivelAtual + SALTO_POR_CONFIANCA[c]));
  return { novoNivel, proximaRevisao: proximaRevisaoEm(novoNivel) };
}

// calcula o novo nível e a data da próxima revisão, consoante a resposta (certo ou errado)
export function calcularProximaRevisao(nivelAtual, acertou) {
  const novoNivel = acertou
    ? Math.min(4, nivelAtual + 1)
    : Math.max(0, nivelAtual - 1);

  return { novoNivel, proximaRevisao: proximaRevisaoEm(novoNivel) };
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
