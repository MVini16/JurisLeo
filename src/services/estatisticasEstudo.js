// estatísticas das sessões de estudo — funções puras, sem firebase nem react
// alimentam o perfil: sequência de dias, mapa de calor e horas por cadeira
import { chaveData } from '../data/feriados.js';
import { dataDeChave } from './datas.js';

const NIVEIS_MINUTOS = [1, 30, 60, 120];

// aceita Date ou Timestamp do firestore
function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  return valor.toDate?.() ?? null;
}

// { 'aaaa-mm-dd': minutos } com o dia em hora local
export function minutosPorDia(sessoes) {
  const mapa = {};
  for (const s of sessoes) {
    const inicio = paraData(s.inicio);
    if (!inicio || !(s.minutos > 0)) continue;
    const chave = chaveData(inicio);
    mapa[chave] = (mapa[chave] || 0) + s.minutos;
  }
  return mapa;
}

function somaDias(data, n) {
  const d = new Date(data);
  d.setDate(d.getDate() + n);
  return d;
}

// segunda-feira da semana de uma data, em chave
function segundaDaSemana(data) {
  const d = new Date(data);
  const dia = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - dia);
  return chaveData(d);
}

// dias seguidos a estudar até hoje.
// hoje ainda em curso não quebra a série. Cada semana (de segunda a domingo) tem direito a
// um dia de descanso: esse dia não quebra a série, mas também não soma.
// devolve { dias, descansosUsados } — descansosUsados conta só os descansos dentro da série
export function sequenciaAtual(mapa, hoje = new Date()) {
  let dias = 0;
  let descansosUsados = 0;
  let pendentes = 0; // descansos ainda sem um dia estudado antes deles
  const semanasComDescanso = new Set();
  let dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);
  const hojeChave = chaveData(dia);

  for (let i = 0; i < 3660; i++) {
    const chave = chaveData(dia);
    if (mapa[chave] > 0) {
      dias += 1;
      descansosUsados += pendentes;
      pendentes = 0;
    } else if (chave !== hojeChave) {
      const semana = segundaDaSemana(dia);
      if (semanasComDescanso.has(semana)) break;
      semanasComDescanso.add(semana);
      pendentes += 1;
    }
    dia = somaDias(dia, -1);
  }
  return { dias, descansosUsados };
}

// 0 = nada, 1 a 4 = cada vez mais estudo nesse dia
export function nivelDoDia(minutos) {
  if (!(minutos > 0)) return 0;
  let nivel = 0;
  for (const limite of NIVEIS_MINUTOS) if (minutos >= limite) nivel += 1;
  return nivel;
}

// semanas (colunas) de 7 dias (segunda a domingo), a acabar na semana de hoje
// cada dia: { chave, minutos, nivel, futuro }
export function mapaDeCalor(mapa, hoje = new Date(), semanas = 12) {
  const hojeChave = chaveData(hoje);
  const segundaAtual = dataDeChave(segundaDaSemana(hoje));
  const resultado = [];
  for (let s = semanas - 1; s >= 0; s--) {
    const semana = [];
    for (let d = 0; d < 7; d++) {
      const dia = somaDias(segundaAtual, -7 * s + d);
      const chave = chaveData(dia);
      const minutos = mapa[chave] || 0;
      semana.push({ chave, minutos, nivel: nivelDoDia(minutos), futuro: chave > hojeChave });
    }
    resultado.push(semana);
  }
  return resultado;
}

// minutos desta semana (de segunda a hoje)
export function minutosDaSemana(mapa, hoje = new Date()) {
  const segunda = dataDeChave(segundaDaSemana(hoje));
  const hojeChave = chaveData(hoje);
  let total = 0;
  for (let d = 0; d < 7; d++) {
    const chave = chaveData(somaDias(segunda, d));
    if (chave <= hojeChave) total += mapa[chave] || 0;
  }
  return total;
}

// [{ cadeiraId, minutos }] do que mais estudou para o que menos, só a partir de uma data
export function minutosPorCadeira(sessoes, desde = null) {
  const soma = {};
  for (const s of sessoes) {
    const inicio = paraData(s.inicio);
    if (!inicio || !(s.minutos > 0)) continue;
    if (desde && inicio < desde) continue;
    const id = s.cadeiraId || 'semCadeira';
    soma[id] = (soma[id] || 0) + s.minutos;
  }
  return Object.entries(soma)
    .map(([cadeiraId, minutos]) => ({ cadeiraId, minutos }))
    .sort((a, b) => b.minutos - a.minutos);
}

// "2 h 30", "45 min", "0 min"
export function textoDuracao(minutos) {
  const m = Math.round(minutos);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h} h ${String(resto).padStart(2, '0')}` : `${h} h`;
}
