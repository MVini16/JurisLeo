// lógica pura do ecrã de início editável — sem firebase nem react
// um ecrã é { estrutura: 'grelha'|'destaque'|'lista', widgets: [{ id, tamanho }] }
// (objetos e não pares [id, tamanho]: o firestore não guarda arrays dentro de arrays)
import { WIDGETS, ESTRUTURAS, ECRA_INICIAL } from '../data/widgets.js';

const porId = (catalogo) => new Map(catalogo.map((w) => [w.id, w]));

// limpa o que vem do firestore: tira ids desconhecidos, repetidos e tamanhos que o widget não tem
export function normalizarEcra(guardado, catalogo = WIDGETS) {
  const mapa = porId(catalogo);
  const estrutura = ESTRUTURAS.some((e) => e.id === guardado?.estrutura) ? guardado.estrutura : 'grelha';
  const vistos = new Set();
  const widgets = (Array.isArray(guardado?.widgets) ? guardado.widgets : [])
    .filter((w) => w && mapa.has(w.id) && !vistos.has(w.id) && vistos.add(w.id))
    .map((w) => {
      const tamanhos = mapa.get(w.id).tamanhos;
      return { id: w.id, tamanho: tamanhos.includes(w.tamanho) ? w.tamanho : tamanhos[0] };
    });
  return { estrutura, widgets };
}

// o primeiro ecrã de uma conta que já existia: parte do inicial, tira os cartões que ela
// tinha desligado e junta no fim os que ela tinha ligado e o inicial não traz
export function ecraDosModulos(ativos = {}, catalogo = WIDGETS, inicial = ECRA_INICIAL) {
  const mapa = porId(catalogo);
  const desligado = (id) => {
    const modulo = mapa.get(id)?.deModulo;
    return modulo && ativos[modulo] === false;
  };
  const widgets = inicial.widgets.filter((w) => !desligado(w.id));
  const presentes = new Set(widgets.map((w) => w.id));
  const extra = catalogo
    .filter((w) => w.deModulo && ativos[w.deModulo] === true && !presentes.has(w.id))
    .map((w) => ({ id: w.id, tamanho: w.tamanhos[0] }));
  return { estrutura: inicial.estrutura, widgets: [...widgets, ...extra] };
}

export function tirarWidget(ecra, indice) {
  if (indice < 0 || indice >= ecra.widgets.length) return ecra;
  return { ...ecra, widgets: ecra.widgets.filter((_, i) => i !== indice) };
}

// passa ao tamanho seguinte que o widget tem (volta ao primeiro depois do último)
export function mudarTamanho(ecra, indice, catalogo = WIDGETS) {
  const alvo = ecra.widgets[indice];
  const tamanhos = alvo && porId(catalogo).get(alvo.id)?.tamanhos;
  if (!tamanhos || tamanhos.length < 2) return ecra;
  const seguinte = tamanhos[(tamanhos.indexOf(alvo.tamanho) + 1) % tamanhos.length];
  return { ...ecra, widgets: ecra.widgets.map((w, i) => (i === indice ? { ...w, tamanho: seguinte } : w)) };
}

export function moverWidget(ecra, de, para) {
  const n = ecra.widgets.length;
  if (de === para || de < 0 || para < 0 || de >= n || para >= n) return ecra;
  const widgets = [...ecra.widgets];
  const [movido] = widgets.splice(de, 1);
  widgets.splice(para, 0, movido);
  return { ...ecra, widgets };
}

// junta no fim, no primeiro tamanho; um widget que já está no ecrã não se repete
export function juntarWidget(ecra, id, catalogo = WIDGETS) {
  const w = porId(catalogo).get(id);
  if (!w || ecra.widgets.some((x) => x.id === id)) return ecra;
  return { ...ecra, widgets: [...ecra.widgets, { id, tamanho: w.tamanhos[0] }] };
}

export function mudarEstrutura(ecra, estrutura) {
  if (!ESTRUTURAS.some((e) => e.id === estrutura)) return ecra;
  return { ...ecra, estrutura };
}

// os widgets que ainda não estão no ecrã, para a galeria
export function widgetsPorPor(ecra, catalogo = WIDGETS) {
  const postos = new Set(ecra.widgets.map((w) => w.id));
  return catalogo.filter((w) => !postos.has(w.id));
}
