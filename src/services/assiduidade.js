// leituras úteis sobre as presenças — lógica pura, sem firebase nem react.
// não inventa regras: usa o motor de faltas (faltas.js) e as marcas que ela fez no calendário

import { estadoFaltas } from './faltas.js';
import { faltasEfetivas } from './presencas.js';
import { ESTADOS_POR_ID, ROTULO_CURTO } from '../data/estadosAula.js';

// a lista das aulas marcadas de uma cadeira, da mais recente para a mais antiga
export function historicoDeMarcas(marcas = {}) {
  return Object.entries(marcas)
    .filter(([, m]) => ESTADOS_POR_ID[m?.estado])
    .map(([chave, m]) => ({ chave, ...m, rotulo: ROTULO_CURTO[m.estado] }))
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

// as faltas justificadas em que ela ainda não disse que entregou o comprovativo
export function comprovativosEmFalta(marcas = {}) {
  return historicoDeMarcas(marcas).filter((m) => m.estado === 'faltei-justificada' && !m.comprovativo);
}

// o estado de uma cadeira: soma o que ela escreveu à mão com as marcas e chama o motor
export function situacaoDaCadeira(cadeira, faltasDados, marcas) {
  const efetivas = faltasEfetivas(faltasDados, marcas);
  const resultado = cadeira?.aulasPraticasPrevistas
    ? estadoFaltas({
      aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
      aulasPraticasLecionadas: efetivas.aulasPraticasLecionadas,
      faltasInjustificadas: efetivas.faltasInjustificadas,
      faltasJustificadas: efetivas.faltasJustificadas,
    })
    : null;
  return { efetivas, resultado };
}

// "e se eu faltar a mais N aulas sem justificação?" — cada aula faltada conta como dada e como falta,
// por isso as aulas dadas sobem tanto como as faltas
export function simularFaltas(cadeira, efetivas, extraInjustificadas) {
  if (!cadeira?.aulasPraticasPrevistas) return null;
  const n = Math.max(0, Math.floor(extraInjustificadas) || 0);
  return estadoFaltas({
    aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
    aulasPraticasLecionadas: efetivas.aulasPraticasLecionadas + n,
    faltasInjustificadas: efetivas.faltasInjustificadas + n,
    faltasJustificadas: efetivas.faltasJustificadas,
  });
}

// quantas faltas injustificadas seguidas ainda aguenta antes de ser excluída (0 se já não aguenta)
export function faltasAteExclusao(cadeira, efetivas) {
  if (!cadeira?.aulasPraticasPrevistas) return null;
  let n = 0;
  while (n < 60 && !simularFaltas(cadeira, efetivas, n + 1).excluida) n++;
  return simularFaltas(cadeira, efetivas, 0).excluida ? 0 : n;
}

// percentagem de presença nas aulas dadas (null se ainda não houve nenhuma)
export function percentagemPresenca(contagem) {
  if (!contagem || contagem.lecionadas === 0) return null;
  return Math.round((contagem.presentes / contagem.lecionadas) * 100);
}
