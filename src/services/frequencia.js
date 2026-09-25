// motor do modo frequência — função pura, sem firebase nem react
// a prova escrita da avaliação contínua só cobre matéria dada até 6 dias
// corridos antes (secção 6 do regulamento), por isso a checklist do modo
// frequência segue o mesmo corte
import { chaveData } from '../data/feriados.js';
import { paraData } from './datas.js';

const DIAS_CORTE_MATERIA = 6;

// a data de um evento (Date ou Timestamp)
function dataDoEvento(item) {
  return paraData(item?.data);
}

// próximo evento do tipo 'frequencia', a partir de hoje (inclusive), o mais próximo primeiro.
// compara por chave de dia, não pela hora exata — uma frequência de hoje sem hora marcada
// (meia-noite) continua "próxima" o dia inteiro, tal como proximaProva em provas.js
export function proximaFrequencia(eventos, hoje = new Date()) {
  const hojeChave = chaveData(hoje);
  const futuras = eventos
    .filter((ev) => ev.tipo === 'frequencia')
    .map((ev) => ({ ...ev, data: dataDoEvento(ev) }))
    .filter((ev) => ev.data && chaveData(ev.data) >= hojeChave)
    .sort((a, b) => a.data - b.data);
  return futuras[0] || null;
}

// dias inteiros que faltam até à data (arredondado para cima — hoje mesmo conta 0)
export function diasRestantes(data, hoje = new Date()) {
  const diff = data - hoje;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// último dia que ainda conta como matéria dada para a prova escrita desta frequência
export function dataLimiteMateria(dataFrequencia) {
  const limite = new Date(dataFrequencia);
  limite.setDate(limite.getDate() - DIAS_CORTE_MATERIA);
  return limite;
}

// achata os sumários de uma cadeira, até à data limite, numa checklist de pontos —
// cada ponto tem uma chave estável (ocorrência + índice), para marcar como revisto
export function materiaAteData(sumarios, cadeiraId, dataLimite) {
  const limiteChave = chaveData(dataLimite);
  return sumarios
    .filter((s) => s.cadeiraId === cadeiraId && s.data <= limiteChave)
    .sort((a, b) => a.data.localeCompare(b.data))
    .flatMap((s) => (s.bullets || []).map((texto, i) => ({
      chave: `${s.id}_${i}`,
      texto,
      data: s.data,
    })));
}
