// sugere registar uma sessão de estudo ao fim do dia, se ainda não houver nenhuma — nunca obriga.
// função pura, sem firebase nem react.
import { chaveData } from '../data/feriados.js';
import { paraData } from './datas.js';

// as sessões cujo início caiu no mesmo dia de "agora"
export function sessoesDeHoje(sessoes, agora = new Date()) {
  const hojeChave = chaveData(agora);
  return sessoes.filter((s) => {
    const d = paraData(s.inicio);
    return !!d && chaveData(d) === hojeChave;
  });
}

// só depois de uma certa hora (por defeito 19h) e só se não houver nenhuma sessão nesse dia
export function deveSugerirRegisto(sessoes, agora = new Date(), horaAPartirDe = 19) {
  if (agora.getHours() < horaAPartirDe) return false;
  return sessoesDeHoje(sessoes, agora).length === 0;
}
