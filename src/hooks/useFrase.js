// escolhe frases do banco (src/data/frases.js), sem repetir a última do mesmo contexto
import { useState } from 'react';
import { frasesPorContexto } from '../data/frases.js';

export function escolherFrase(contexto) {
  const lista = frasesPorContexto[contexto] || frasesPorContexto.geral;
  if (lista.length === 0) return '';

  const chave = `jurisleo-ultima-frase-${contexto}`;
  let ultima = null;
  try { ultima = localStorage.getItem(chave); } catch { /* sem localstorage, sem problema */ }

  const candidatas = (lista.length > 1 && ultima) ? lista.filter((f) => f !== ultima) : lista;
  const escolhida = candidatas[Math.floor(Math.random() * candidatas.length)];

  try { localStorage.setItem(chave, escolhida); } catch { /* ignora */ }
  return escolhida;
}

// hook de conveniência — escolhe uma frase do contexto quando o componente monta,
// sem repetir a anterior desse mesmo contexto. só escolhe de novo se o componente
// remontar (ex: com uma key diferente) — não reage a mudanças de contexto in-place
export function useFrase(contexto = 'geral') {
  const [frase] = useState(() => escolherFrase(contexto));
  return frase;
}
