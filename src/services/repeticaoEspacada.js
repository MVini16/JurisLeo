// repetição espaçada, estilo leitner — 5 níveis (0 a 4), cada um com um
// intervalo maior até à próxima revisão. função pura, sem firebase nem react.
// intervalos definidos na spec (secção 14.7): 1, 3, 7, 16 e 35 dias — o código
// tinha ficado com 1, 2, 4, 7, 15 por engano; corrigido em 22-09-2026.

const INTERVALOS_DIAS = [1, 3, 7, 16, 35];

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

// ideia 3 da lista de 30: "agendamento que aprende" — versão simples, sem fsrs. cada cartão
// tem a sua própria facilidade (começa em 1×), que multiplica o intervalo do nível. cartões
// que ela sabe sempre bem vão-se afastando mais rápido; os difíceis ficam mais perto.
const FACILIDADE_INICIAL = 1;
const FACILIDADE_MIN = 0.5;
const FACILIDADE_MAX = 2.5;
const AJUSTE_FACILIDADE_POR_CONFIANCA = { 1: -0.3, 2: -0.15, 3: 0, 4: 0.1, 5: 0.2 };

export function calcularNovaFacilidade(facilidadeAtual, confianca) {
  const c = Math.min(5, Math.max(1, Math.round(Number(confianca) || 1)));
  const base = typeof facilidadeAtual === 'number' ? facilidadeAtual : FACILIDADE_INICIAL;
  const nova = base + AJUSTE_FACILIDADE_POR_CONFIANCA[c];
  return Math.min(FACILIDADE_MAX, Math.max(FACILIDADE_MIN, Number(nova.toFixed(2))));
}

function proximaRevisaoEm(nivel, facilidade = FACILIDADE_INICIAL) {
  const data = new Date();
  const dias = Math.max(1, Math.round(INTERVALOS_DIAS[nivel] * facilidade));
  data.setDate(data.getDate() + dias);
  return data;
}

// calcula o novo nível, a nova facilidade e a data da próxima revisão, consoante a confiança (1 a 5)
export function calcularProximaRevisaoPorConfianca(nivelAtual, confianca, facilidadeAtual = FACILIDADE_INICIAL) {
  const c = Math.min(5, Math.max(1, Math.round(Number(confianca) || 1)));
  const novoNivel = c === 1 ? 0 : Math.min(4, Math.max(0, nivelAtual + SALTO_POR_CONFIANCA[c]));
  const novaFacilidade = calcularNovaFacilidade(facilidadeAtual, c);
  return { novoNivel, novaFacilidade, proximaRevisao: proximaRevisaoEm(novoNivel, novaFacilidade) };
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
