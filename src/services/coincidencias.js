// detetor de coincidências de exames — função pura, sem firebase nem react
// regra (art. 39.º, secção 5.3 da spec): na época normal há coincidência se houver exame
// no mesmo dia OU em dia consecutivo com outra prova de qualquer época; nas outras épocas
// só conta o mesmo dia. só avisa, nunca bloqueia nada.

// tipos de evento que contam como "prova" para este efeito
export const TIPOS_PROVA = ['frequencia', 'oral', 'exame'];

function ehProva(item) {
  // aulas do horário (repetidas a partir de aulasSemanais) nunca entram nesta conta
  if (item.repetido) return false;
  // eventos cancelados, ou aulas cujo estado é "cancelada"/"o stor faltou", não contam
  if (item.estado === 'cancelado') return false;
  if (item.estadoAula === 'cancelada' || item.estadoAula === 'stotFaltou') return false;
  return TIPOS_PROVA.includes(item.tipo);
}

function paraData(item) {
  return item.data instanceof Date ? item.data : item.data?.toDate?.();
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
    .map((item) => ({ ...item, data: paraData(item) }))
    .filter((item) => item.data);

  const emEpocaNormal = typeof epocaNormal === 'function' ? epocaNormal : () => false;

  const choques = [];
  for (let i = 0; i < provas.length; i++) {
    for (let j = i + 1; j < provas.length; j++) {
      const a = provas[i];
      const b = provas[j];
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

// frase em linguagem simples para explicar um choque encontrado, citando a regra oficial
export function explicarChoque({ a, b, tipo }) {
  const quando = tipo === 'mesmoDia' ? 'no mesmo dia' : 'em dias consecutivos';
  return `"${a.titulo}" e "${b.titulo}" caem ${quando}. Pela regra das coincidências (art. 39.º), tens direito a pedir para uma delas mudar de data — mas isto é só um aviso, nada aqui fica bloqueado.`;
}
