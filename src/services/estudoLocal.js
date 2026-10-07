// o que o estudo guarda só neste telemóvel (localStorage): os dias em que estudou e quantos flashcards respondeu hoje.
// fica fora do firestore de propósito, para não mexer na estrutura de dados
import { somarRespostas, respondidasHoje } from './hoje.js';

const CHAVE_DIAS = 'jurisleo-estudo-dias';
const CHAVE_HOJE = 'jurisleo-estudo-hoje';

function ler(chave, valorPadrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? valorPadrao; } catch { return valorPadrao; }
}
function guardar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem localstorage, esquece */ }
}

export function lerDiasDeEstudo() { return ler(CHAVE_DIAS, []); }
export function guardarDiasDeEstudo(dias) { guardar(CHAVE_DIAS, dias); }

export function lerRespondidasDeHoje(hoje) { return respondidasHoje(ler(CHAVE_HOJE, null), hoje); }
export function contarRespostaDeHoje(hoje) { guardar(CHAVE_HOJE, somarRespostas(ler(CHAVE_HOJE, null), hoje)); }
