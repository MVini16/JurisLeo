// o feed do modo social — lógica pura, sem firebase nem react.
// junta o que ela tem para estudar e para fazer numa fila de cartas, com mais peso ao que está em atraso.
// nada aqui inventa conteúdo: usa os flashcards dela, o glossário dela e o banco de perguntas que já existe (data/jogos.js)

import { estaPronto, ordenarPorPrioridade } from './repeticaoEspacada.js';
import { tarefasAVencer } from './hoje.js';

export const TAMANHO_LOTE = 24;
// a partir de quantos flashcards prontos o feed passa a dar mais peso à revisão
export const LIMIAR_ATRASO = 6;

const PADRAO_NORMAL = ['fc', 'vf', 'em', 'fc', 'gl', 'vf', 'fc', 'em'];
const PADRAO_ATRASO = ['fc', 'fc', 'fc', 'vf', 'fc', 'em', 'fc', 'gl'];

// gerador pseudoaleatório com semente (o mesmo dia e lote dão a mesma ordem)
export function gerador(semente) {
  let s = (semente >>> 0) || 1;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function baralhar(lista, rnd) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// semente a partir do dia (AAAA-MM-DD) e do número do lote
export function sementeDoDia(hoje, lote = 0) {
  let soma = lote * 7919;
  for (const letra of hoje) soma = (soma * 31 + letra.charCodeAt(0)) % 1000003;
  return soma + 1;
}

// as cartas do início: o que pede atenção hoje, antes do estudo
export function cartasDeAbertura({ aulasPorMarcar = [], alertasFaltas = [], frequencia = null, tarefas = [], hoje }) {
  const cartas = [];
  aulasPorMarcar.slice(0, 3).forEach((ev) => cartas.push({ tipo: 'aula', chave: `aula-${ev.id}`, evento: ev, cadeiraId: ev.cadeira }));
  alertasFaltas.filter((a) => a.semaforo !== 'verde').slice(0, 2).forEach((a) => cartas.push({ tipo: 'faltas', chave: `faltas-${a.cadeiraId}`, alerta: a, cadeiraId: a.cadeiraId }));
  if (frequencia && frequencia.dias != null && frequencia.dias >= 0 && frequencia.dias <= 14) {
    cartas.push({ tipo: 'frequencia', chave: `freq-${frequencia.cadeiraId || frequencia.titulo}`, frequencia, cadeiraId: frequencia.cadeiraId });
  }
  const aVencer = hoje ? tarefasAVencer(tarefas, hoje) : [];
  aVencer.slice(0, 2).forEach((t) => cartas.push({ tipo: 'tarefa', chave: `tarefa-${t.id}`, tarefa: t, cadeiraId: t.cadeira }));
  return cartas;
}

// o miolo do feed: intercala flashcards, verdadeiro ou falso, escolha múltipla e glossário
export function misturarEstudo({ flashcards = [], vf = [], em = [], termos = [], hoje, lote = 0, tamanho = TAMANHO_LOTE, agora = new Date() }) {
  const rnd = gerador(sementeDoDia(hoje || '0', lote));
  const prontos = flashcards.filter((f) => estaPronto(f, agora));
  const emAtraso = prontos.length >= LIMIAR_ATRASO;
  // em atraso: os prontos primeiro (os mais difíceis à frente); senão, os que houver, por prioridade
  const fcs = ordenarPorPrioridade(flashcards).filter((f) => prontos.length === 0 || estaPronto(f, agora));
  const lotes = Math.max(0, lote) * tamanho;
  const pools = {
    fc: lotes && fcs.length ? [...fcs.slice(lotes % fcs.length), ...fcs.slice(0, lotes % fcs.length)] : fcs,
    vf: baralhar(vf, rnd),
    em: baralhar(em, rnd),
    gl: baralhar(termos.filter((t) => !t.dominado), rnd),
  };
  const nomes = { fc: 'flashcard', vf: 'vf', em: 'em', gl: 'glossario' };
  const idx = { fc: 0, vf: 0, em: 0, gl: 0 };
  const padrao = emAtraso ? PADRAO_ATRASO : PADRAO_NORMAL;
  const cartas = [];
  let semProgresso = 0;
  for (let i = 0; cartas.length < tamanho && semProgresso < padrao.length; i++) {
    const slot = padrao[i % padrao.length];
    if (idx[slot] >= pools[slot].length) { semProgresso++; continue; }
    semProgresso = 0;
    const item = pools[slot][idx[slot]++];
    cartas.push({ tipo: nomes[slot], chave: `${nomes[slot]}-${item.id}-${lote}`, item, cadeiraId: item.cadeiraId });
  }
  return { cartas, emAtraso, prontos: prontos.length };
}

// o feed completo de um lote; a abertura só vem no primeiro
export function montarFeed(dados) {
  const lote = dados.lote ?? 0;
  const abertura = lote === 0 ? cartasDeAbertura(dados) : [];
  const { cartas, emAtraso, prontos } = misturarEstudo({ ...dados, lote });
  return { cartas: [...abertura, ...cartas], emAtraso, prontos };
}

// quantas cartas de estudo faltam para a meta do dia (nunca negativo)
export function faltamParaMeta(respondidas, meta) {
  return Math.max(0, meta - respondidas);
}

// o feed pede mais cartas quando ela está a 3 do fim da lista
export function precisaDeMais(indice, total, margem = 3) {
  return total > 0 && indice >= total - margem;
}
