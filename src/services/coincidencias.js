// deteta choques entre itens do calendário — função pura, sem firebase nem react
// regra de coincidências: regulamento de avaliação da fdul, secção 5.3 da spec
// (na época normal há coincidência com exame no mesmo dia ou em dia consecutivo;
// nas outras épocas, só no mesmo dia)
// avisa sempre, nunca bloqueia: quem decide é a leonor

const DIA_MS = 24 * 60 * 60 * 1000;

const TIPOS_FORTES = ['exame', 'frequencia'];

// texto da regra, tal como está no regulamento, em linguagem simples
export const TEXTO_REGRA_COINCIDENCIAS =
  'Coincidência de exames: na época normal, é quando tens exame no mesmo dia ou em dias seguidos com outra prova. ' +
  'Nas outras épocas, só quando é no mesmo dia. ' +
  'Entre dois escritos ou duas orais, fazes o do ano mais avançado; entre um escrito e uma oral, fazes o escrito.';

// dias de diferença entre duas chaves 'aaaa-mm-dd' (contas em utc, sem problemas de hora de verão)
function diasEntre(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DIA_MS);
}

// aulas canceladas ou dadas pelo stor, e eventos cancelados, não contam para choques
function conta(item) {
  if (item.estadoAula === 'cancelada' || item.estadoAula === 'stotFaltou') return false;
  if (item.estado === 'cancelado') return false;
  return true;
}

function ehAula(item) {
  return item.tipo === 'aula';
}

function ehExame(item) {
  return item.tipo === 'exame';
}

function ehEpocaNormal(dia, epocaNormal) {
  return typeof epocaNormal === 'function' ? !!epocaNormal(dia) : !!epocaNormal;
}

// cada item: { chave, dia: 'aaaa-mm-dd', tipo, titulo, cadeira, estadoAula?, estado? }
// epocaNormal: função (dia) => bool, ou bool
// devolve [{ dia, diaFim, itens: [a, b], forte, coincidencia, motivo }]
export function detetarChoques(itens, { epocaNormal = false } = {}) {
  const validos = itens.filter((i) => i.dia && conta(i));
  const choques = [];

  for (let i = 0; i < validos.length; i++) {
    for (let j = i + 1; j < validos.length; j++) {
      const a = validos[i];
      const b = validos[j];
      // duas aulas do horário nunca chocam entre si
      if (ehAula(a) && ehAula(b)) continue;

      const distancia = Math.abs(diasEntre(a.dia, b.dia));
      const doisExames = ehExame(a) && ehExame(b);
      const [primeiro, segundo] = a.dia <= b.dia ? [a, b] : [b, a];

      // exames em dias consecutivos só contam na época normal
      const consecutivos = doisExames && distancia === 1 && ehEpocaNormal(primeiro.dia, epocaNormal);
      if (distancia !== 0 && !consecutivos) continue;

      const coincidencia = doisExames && (distancia === 0 || consecutivos);
      const forte = coincidencia || TIPOS_FORTES.includes(a.tipo) || TIPOS_FORTES.includes(b.tipo);

      let motivo;
      if (coincidencia) {
        motivo = distancia === 0
          ? 'Tens dois exames no mesmo dia. ' + TEXTO_REGRA_COINCIDENCIAS
          : 'Tens dois exames em dias seguidos na época normal. ' + TEXTO_REGRA_COINCIDENCIAS;
      } else {
        motivo = `${primeiro.titulo || 'Um evento'} e ${segundo.titulo || 'outro evento'} calham no mesmo dia.`;
      }

      choques.push({ dia: primeiro.dia, diaFim: segundo.dia, itens: [primeiro, segundo], forte, coincidencia, motivo });
    }
  }

  return choques;
}

// agrupa os choques pelos dias em que aparecem (um choque em dias seguidos aparece nos dois)
export function choquesPorDia(choques) {
  const porDia = {};
  for (const c of choques) {
    for (const dia of new Set([c.dia, c.diaFim])) {
      (porDia[dia] ||= []).push(c);
    }
  }
  return porDia;
}
