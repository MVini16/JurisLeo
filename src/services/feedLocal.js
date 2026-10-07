// o que o feed guarda só neste telemóvel (localStorage): quantas cartas respondeu hoje, a meta do dia e as cartas guardadas.
// a parte das contas é pura (testada); só o fim do ficheiro toca no localStorage
import { META_DIARIA } from './hoje.js';

export const CARTAS_EXTRA = 5;
const CHAVE_DIA = 'jurisleo-feed-hoje';
const CHAVE_GUARDADOS = 'jurisleo-feed-guardados';
const MAX_GUARDADOS = 200;

export function registoDeHoje(registo, hoje) {
  return registo && registo.dia === hoje ? registo : { dia: hoje, respondidas: 0, extra: 0 };
}
export function metaAtual(registo, meta = META_DIARIA) { return meta + (registo.extra || 0); }
export function somarResposta(registo, hoje) {
  const r = registoDeHoje(registo, hoje);
  return { ...r, respondidas: r.respondidas + 1 };
}
// a meta acabou de ser cumprida nesta resposta (e só nela, para o ecrã do fim não repetir)
export function acabouDeCumprirMeta(registo, meta = META_DIARIA) { return registo.respondidas === metaAtual(registo, meta); }
export function maisCartas(registo, hoje, n = CARTAS_EXTRA) {
  const r = registoDeHoje(registo, hoje);
  return { ...r, extra: (r.extra || 0) + n };
}
export function alternarGuardado(lista, chave) {
  return lista.includes(chave) ? lista.filter((c) => c !== chave) : [chave, ...lista].slice(0, MAX_GUARDADOS);
}

function ler(chave, padrao) { try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; } catch { return padrao; } }
function guardar(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem localstorage, esquece */ } }

export function lerRegistoDoFeed(hoje) { return registoDeHoje(ler(CHAVE_DIA, null), hoje); }
export function guardarRegistoDoFeed(registo) { guardar(CHAVE_DIA, registo); }
export function lerGuardados() { return ler(CHAVE_GUARDADOS, []); }
export function guardarGuardados(lista) { guardar(CHAVE_GUARDADOS, lista); }
