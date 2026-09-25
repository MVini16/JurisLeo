// detetor de coincidências e outros choques de provas — função pura, sem firebase nem react
import { paraData } from './datas.js';
// regra (art. 39.º do regulamento, verificado contra o texto oficial em 22-09-2026): na época
// normal há coincidência se houver "prova de exame" no mesmo dia OU em dia consecutivo com
// outra prova de exame de qualquer época; nas outras épocas só conta o mesmo dia. o artigo só
// fala de "provas de exame" (exame escrito/oral, recurso, melhoria) — nunca menciona a prova
// escrita de avaliação contínua (frequência), que é uma figura à parte (título II, não título
// IV do regulamento). por isso frequências continuam a ser detetadas aqui (é informação útil
// avisar de dois choques no mesmo dia), mas explicarChoque() só invoca o art. 39.º e o direito
// a mudar de data quando as duas provas em causa são mesmo exames — nunca para frequências.
// só avisa, nunca bloqueia nada.

// tipos de evento que contam como "prova" para este efeito
export const TIPOS_PROVA = ['frequencia', 'oral', 'exame'];

// tipos que são mesmo "prova de exame" no sentido do art. 39.º — frequência fica de fora
const TIPOS_EXAME = ['oral', 'exame'];

function ehProva(item) {
  // aulas do horário (repetidas a partir de aulasSemanais) nunca entram nesta conta
  if (item.repetido) return false;
  // eventos cancelados, ou aulas cujo estado é "cancelada"/"o stor faltou", não contam
  if (item.estado === 'cancelado') return false;
  if (item.estadoAula === 'cancelada' || item.estadoAula === 'stotFaltou') return false;
  return TIPOS_PROVA.includes(item.tipo);
}

// a data de um evento (Date ou Timestamp)
function dataDoEvento(item) {
  return paraData(item?.data);
}

// diferença em dias de calendário entre duas datas (ignora a hora)
function diferencaDias(a, b) {
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((B - A) / 86400000);
}

// deteta todos os pares de provas em coincidência.
// epocaNormal: função (data) => boolean, tipicamente naEpocaNormal de calendarioEscolar.js.
// a tolerância de um dia consecutivo só se aplica quando as duas datas caem em época normal —
// fora dela (recurso, coincidências, avaliação contínua) só conta o mesmo dia.
export function detetarChoques(itens, { epocaNormal } = {}) {
  const provas = itens
    .filter(ehProva)
    .map((item) => ({ ...item, data: dataDoEvento(item) }))
    .filter((item) => item.data);

  const emEpocaNormal = typeof epocaNormal === 'function' ? epocaNormal : () => false;

  const choques = [];
  for (let i = 0; i < provas.length; i++) {
    for (let j = i + 1; j < provas.length; j++) {
      const a = provas[i];
      const b = provas[j];
      // duas cópias do mesmo evento de vários dias (useCalendario.expandirMultiDia dá-lhes
      // o mesmo id, um por dia) nunca "chocam" consigo próprias
      if (a.id && a.id === b.id) continue;
      const dias = Math.abs(diferencaDias(a.data, b.data));
      const toleranciaDiaConsecutivo = emEpocaNormal(a.data) && emEpocaNormal(b.data);
      const limite = toleranciaDiaConsecutivo ? 1 : 0;
      if (dias <= limite) {
        choques.push({ a, b, dias, tipo: dias === 0 ? 'mesmoDia' : 'diaConsecutivo' });
      }
    }
  }
  return choques;
}

// agrupa os ids em coincidência por dia (chave = toDateString da data de cada item),
// útil para pintar um aviso na célula do calendário sem repetir a deteção por dia
export function choquesPorDia(itens, opcoes) {
  const porDia = {};
  for (const { a, b } of detetarChoques(itens, opcoes)) {
    for (const item of [a, b]) {
      const chave = item.data.toDateString();
      if (!porDia[chave]) porDia[chave] = [];
      if (!porDia[chave].includes(item.id)) porDia[chave].push(item.id);
    }
  }
  return porDia;
}

// frase em linguagem simples para explicar um choque encontrado. só cita o art. 39.º e o
// direito a mudar de data quando as duas provas são mesmo exames — para uma frequência
// envolvida, o regulamento não dá esse direito, por isso é só um aviso de agenda
export function explicarChoque({ a, b, tipo }) {
  const quando = tipo === 'mesmoDia' ? 'no mesmo dia' : 'em dias consecutivos';
  const saoAmbosExame = TIPOS_EXAME.includes(a.tipo) && TIPOS_EXAME.includes(b.tipo);
  if (saoAmbosExame) {
    return `"${a.titulo}" e "${b.titulo}" caem ${quando}. Pela regra das coincidências (art. 39.º), tens direito a pedir para uma delas mudar de data — mas isto é só um aviso, nada aqui fica bloqueado.`;
  }
  return `"${a.titulo}" e "${b.titulo}" caem ${quando}. O art. 39.º não cobre frequências, por isso não há aqui um direito automático a mudar de data — mas vale a pena teres isto em atenção.`;
}
