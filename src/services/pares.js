// jogo de pares: ligar a frente de um cartão ao seu verso. função pura, sem firebase nem react.
// usa os cartões que ela já tem; nunca inventa conteúdo.

export const PARES_POR_JOGO = 6;
export const MINIMO_DE_CARTOES = 3;
const MAX_CARACTERES = 90; // textos muito longos não cabem num quadrado

// baralha sem alterar a lista original (fisher-yates); `aleatorio` entra por parâmetro para os testes
export function baralhar(lista, aleatorio = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// só cartões com frente e verso curtos e diferentes entre si
export function cartoesJogaveis(flashcards) {
  return flashcards.filter((c) => {
    const frente = String(c.frente ?? '').trim();
    const tras = String(c.tras ?? '').trim();
    return frente && tras && frente !== tras && frente.length <= MAX_CARACTERES && tras.length <= MAX_CARACTERES;
  });
}

export function podeJogar(flashcards) {
  return cartoesJogaveis(flashcards).length >= MINIMO_DE_CARTOES;
}

// escolhe até `n` cartões e devolve as peças baralhadas: uma para a frente e outra para o verso
export function montarJogo(flashcards, n = PARES_POR_JOGO, aleatorio = Math.random) {
  const escolhidos = baralhar(cartoesJogaveis(flashcards), aleatorio).slice(0, n);
  const pecas = escolhidos.flatMap((c) => [
    { id: `${c.id}:f`, par: c.id, lado: 'f', texto: String(c.frente).trim() },
    { id: `${c.id}:t`, par: c.id, lado: 't', texto: String(c.tras).trim() },
  ]);
  return { pares: escolhidos.length, pecas: baralhar(pecas, aleatorio) };
}

// duas peças formam um par se são do mesmo cartão e de lados diferentes
export function ehPar(a, b) {
  return !!a && !!b && a.id !== b.id && a.par === b.par && a.lado !== b.lado;
}

// "1:05" ou "0:42"
export function textoDoTempo(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
