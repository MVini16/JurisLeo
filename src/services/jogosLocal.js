// recordes e escolhas dos minijogos: só neste telemóvel (localStorage), nada vai para o firebase
import { registarRecorde } from './jogos.js';

const CHAVE = 'jurisleo-jogos';

export function lerRecordes() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
}

// guarda os pontos de uma jogada e devolve se foi recorde
export function guardarJogada(jogo, pontos) {
  const { registo, novoRecorde } = registarRecorde(lerRecordes(), jogo, pontos);
  try { localStorage.setItem(CHAVE, JSON.stringify(registo)); } catch { /* sem localstorage, esquece */ }
  return { novoRecorde, melhor: registo[jogo].melhor };
}
