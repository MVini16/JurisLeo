// missões do dia: três alvos fixos e pequenos — 25 minutos, 10 cartões, 1 sumário.
// função pura, sem firebase nem react.
import { sessoesDeHoje } from './horasPorRegistar.js';
import { chaveData } from '../data/feriados.js';
import { paraData } from './datas.js';

export const ALVOS = { minutos: 25, flashcards: 10, sumario: 1 };

// quantos flashcards foram revistos hoje (têm ultimaRevisaoEm com a data de hoje)
export function flashcardsRevistosHoje(flashcards, agora = new Date()) {
  const hojeChave = chaveData(agora);
  return flashcards.filter((f) => {
    const d = paraData(f.ultimaRevisaoEm);
    return !!d && chaveData(d) === hojeChave;
  }).length;
}

// quantos sumários foram guardados ou atualizados hoje
export function sumariosHoje(sumarios, agora = new Date()) {
  const hojeChave = chaveData(agora);
  return sumarios.filter((s) => {
    const d = paraData(s.atualizadoEm);
    return !!d && chaveData(d) === hojeChave;
  }).length;
}

// { minutos: {feito, alvo, cumprida}, flashcards: {...}, sumario: {...} }
export function progressoMissoes({ sessoes = [], flashcards = [], sumarios = [] }, agora = new Date()) {
  const minutosFeitos = sessoesDeHoje(sessoes, agora).reduce((soma, s) => soma + (s.minutos || 0), 0);
  const flashcardsFeitos = flashcardsRevistosHoje(flashcards, agora);
  const sumariosFeitos = sumariosHoje(sumarios, agora);

  return {
    minutos: { feito: minutosFeitos, alvo: ALVOS.minutos, cumprida: minutosFeitos >= ALVOS.minutos },
    flashcards: { feito: flashcardsFeitos, alvo: ALVOS.flashcards, cumprida: flashcardsFeitos >= ALVOS.flashcards },
    sumario: { feito: sumariosFeitos, alvo: ALVOS.sumario, cumprida: sumariosFeitos >= ALVOS.sumario },
  };
}
