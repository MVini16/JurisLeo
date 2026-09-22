// plano de estudo da semana: a partir das próximas provas, propõe uma cadeira por dia até
// domingo — mais provas próximas, mais vezes aparecem. função pura, sem firebase nem react.
import { chaveData } from '../data/feriados.js';
import { diasEntre } from './datas.js';

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function paraData(item) {
  return item.data instanceof Date ? item.data : item.data?.toDate?.();
}

// os dias que faltam desta semana, de hoje (inclusive) até domingo
export function diasAteDomingo(hoje = new Date()) {
  const inicio = new Date(hoje);
  inicio.setHours(0, 0, 0, 0);
  const diasAFaltar = (7 - inicio.getDay()) % 7; // se hoje já é domingo, faltam 0
  const dias = [];
  for (let i = 0; i <= diasAFaltar; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    dias.push(d);
  }
  return dias;
}

// próximas provas (frequência/exame), uma por cadeira — só a mais próxima de cada uma,
// ordenadas da mais urgente para a menos urgente
export function provasPorUrgencia(eventos, hoje = new Date()) {
  const porCadeira = {};
  for (const ev of eventos) {
    if (ev.tipo !== 'frequencia' && ev.tipo !== 'exame') continue;
    if (ev.estado === 'cancelado' || !ev.cadeira) continue;
    const data = paraData(ev);
    if (!data || data < hoje) continue;
    const atual = porCadeira[ev.cadeira];
    if (!atual || data < atual.data) porCadeira[ev.cadeira] = { cadeiraId: ev.cadeira, titulo: ev.titulo, data };
  }
  return Object.values(porCadeira)
    .map((p) => ({ ...p, diasRestantes: diasEntre(hoje, p.data) }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// [{ chave, diaSemana, cadeiraId, motivo }] — um por dia até domingo, sem provas dá lista vazia
export function propostaDaSemana(eventos, hoje = new Date()) {
  const provas = provasPorUrgencia(eventos, hoje);
  if (provas.length === 0) return [];

  const dias = diasAteDomingo(hoje);
  return dias.map((dia, i) => {
    const prova = provas[i % provas.length];
    return {
      chave: chaveData(dia),
      diaSemana: DIAS_SEMANA[dia.getDay()],
      cadeiraId: prova.cadeiraId,
      motivo: prova.diasRestantes === 0
        ? `${prova.titulo || 'Prova'} é hoje`
        : `${prova.titulo || 'Prova'} daqui a ${prova.diasRestantes} ${prova.diasRestantes === 1 ? 'dia' : 'dias'}`,
    };
  });
}

// troca a cadeira sugerida num dia por outra (ciclo pelas cadeiras com provas), para "mudar"
export function proximaCadeira(cadeiraAtualId, eventos, hoje = new Date()) {
  const provas = provasPorUrgencia(eventos, hoje);
  if (provas.length <= 1) return cadeiraAtualId;
  const indice = provas.findIndex((p) => p.cadeiraId === cadeiraAtualId);
  const seguinte = provas[(indice + 1) % provas.length];
  return seguinte.cadeiraId;
}
