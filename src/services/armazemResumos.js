// onde a consola do vini (/admin) guarda os resumos que a leonor lhe mandou: só neste aparelho, em localstorage
import { juntarResumo, lerResumo, removerResumo } from './resumoParaVini.js';

const CHAVE = 'jurisleo-admin-resumos';

export function lerResumos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(lista) ? lista : [];
  } catch { return []; }
}

function guardar(lista) {
  try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* sem localstorage, esquece */ }
  return lista;
}

// cola o texto que ela mandou; devolve { lista, ok }
export function colarResumo(texto) {
  const resumo = lerResumo(texto);
  if (!resumo) return { lista: lerResumos(), ok: false };
  return { lista: guardar(juntarResumo(lerResumos(), resumo)), ok: true };
}

export function apagarResumo(id) {
  return guardar(removerResumo(lerResumos(), id));
}
