// onde as frases extra do vini ficam guardadas: localStorage deste aparelho (nada vai para o firebase)
import { extraVazio, normalizarExtra } from './frasesExtra.js';

const CHAVE = 'jurisleo-boneco-extra';

export function lerExtras() {
  try { return normalizarExtra(JSON.parse(localStorage.getItem(CHAVE))); } catch { return extraVazio(); }
}

export function guardarExtras(extra) {
  try { localStorage.setItem(CHAVE, JSON.stringify(extra)); } catch { /* sem localstorage, perde-se ao fechar */ }
}
