// a frase por baixo do nome dela: as do Vini e, se ela quiser, citações com fonte
// nunca repete uma frase antes de todas terem saído; contextos sensíveis (madrugada, notas más...) ficam só com as nossas
import { useState } from 'react';
import { frasesPorContexto } from '../data/frases.js';
import { citacoes } from '../data/citacoes.js';
import { lerPreferencias } from '../services/preferencias.js';
import { reunirFrases, escolherSemRepetir, legendaDaFrase } from '../services/citacoes.js';

const CONTEXTOS_COM_CITACOES = ['geral'];

function lerSaidas(chave) {
  try {
    const guardado = JSON.parse(localStorage.getItem(chave) || '[]');
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function escolher(contexto) {
  const prefs = lerPreferencias();
  const originais = frasesPorContexto[contexto] || frasesPorContexto.geral;
  const comCitacoes = CONTEXTOS_COM_CITACOES.includes(contexto);
  const pool = reunirFrases({
    originais,
    citacoes: comCitacoes ? citacoes : [],
    modo: comCitacoes ? prefs.frases : 'originais',
    series: prefs.series === 'on',
  });
  if (pool.length === 0) return null;

  const chave = `jurisleo-frases-saidas-${contexto}`;
  const { escolhida, saidas } = escolherSemRepetir(pool.map((f) => f.id), lerSaidas(chave));
  try { localStorage.setItem(chave, JSON.stringify(saidas)); } catch { /* sem localStorage, sem problema */ }
  const frase = pool.find((f) => f.id === escolhida);
  return { texto: frase.texto, pt: frase.pt || '', legenda: legendaDaFrase(frase) };
}

export function useFraseDoDia(contexto = 'geral') {
  const [frase] = useState(() => escolher(contexto));
  return frase;
}
