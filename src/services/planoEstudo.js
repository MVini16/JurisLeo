// plano de estudo da semana: a partir das próximas provas, propõe uma cadeira por dia até
// domingo — mais provas próximas, mais vezes aparecem. função pura, sem firebase nem react.
import { chaveData } from '../data/feriados.js';
import { diasEntre, paraData } from './datas.js';

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

// a data de um evento (Date ou Timestamp)
function dataDoEvento(item) {
  return paraData(item?.data);
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
  const hojeChave = chaveData(hoje);
  const porCadeira = {};
  for (const ev of eventos) {
    if (ev.tipo !== 'frequencia' && ev.tipo !== 'exame') continue;
    if (ev.estado === 'cancelado' || !ev.cadeira) continue;
    const data = dataDoEvento(ev);
    // hoje conta, tal como em proximaProva (provas.js) — mesma convenção em toda a app
    if (!data || chaveData(data) < hojeChave) continue;
    const atual = porCadeira[ev.cadeira];
    if (!atual || data < atual.data) porCadeira[ev.cadeira] = { cadeiraId: ev.cadeira, titulo: ev.titulo, data };
  }
  return Object.values(porCadeira)
    .map((p) => ({ ...p, diasRestantes: diasEntre(hoje, p.data) }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// escolha ponderada e intercalada (round-robin suave, como um load balancer): cada cadeira
// tem um peso — quanto mais perto a prova, maior o peso — e a que tem mais "crédito"
// acumulado é escolhida a cada dia. dá a frequência proporcional ao peso, mas espalhada
// pela semana em vez de em blocos consecutivos.
function escolherPorDia(provas, numDias) {
  const pesos = provas.map((p) => 1 / (p.diasRestantes + 1));
  const totalPeso = pesos.reduce((soma, p) => soma + p, 0);
  const credito = provas.map(() => 0);
  const escolhas = [];
  for (let dia = 0; dia < numDias; dia++) {
    for (let i = 0; i < provas.length; i++) credito[i] += pesos[i];
    let indiceEscolhido = 0;
    for (let i = 1; i < provas.length; i++) {
      if (credito[i] > credito[indiceEscolhido]) indiceEscolhido = i;
    }
    credito[indiceEscolhido] -= totalPeso;
    escolhas.push(provas[indiceEscolhido]);
  }
  return escolhas;
}

// [{ chave, diaSemana, cadeiraId, motivo }] — um por dia até domingo, sem provas dá lista vazia.
// as provas mais próximas aparecem mais vezes (ver escolherPorDia).
export function propostaDaSemana(eventos, hoje = new Date()) {
  const provas = provasPorUrgencia(eventos, hoje);
  if (provas.length === 0) return [];

  const dias = diasAteDomingo(hoje);
  const escolhidas = escolherPorDia(provas, dias.length);

  return dias.map((dia, i) => {
    const prova = escolhidas[i];
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
