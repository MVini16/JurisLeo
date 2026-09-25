// gera um ficheiro de calendário (.ics, rfc 5545) com as provas, os prazos e as aulas dela,
// para o iphone os pôr no calendário nativo com "adicionar todos" — função pura, sem firebase nem react.
// as horas vão "flutuantes" (sem fuso): o iphone lê-as na hora de lisboa em que ela está.
import { chaveData } from '../data/feriados.js';
import { paraData } from './datas.js';

const TIPOS_PROVA = new Set(['frequencia', 'exame', 'oral']);

// texto dentro de um campo: \\ ; , e mudanças de linha têm de ser escapados
export function escaparTexto(texto) {
  return String(texto ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

// linhas com mais de 75 bytes partem-se, e a continuação começa com um espaço
export function dobrarLinha(linha) {
  const bytes = new TextEncoder().encode(linha);
  if (bytes.length <= 75) return linha;
  const partes = [];
  let atual = '';
  let tamanho = 0;
  for (const ch of linha) {
    const t = new TextEncoder().encode(ch).length;
    const limite = partes.length === 0 ? 75 : 74;
    if (tamanho + t > limite) {
      partes.push(atual);
      atual = '';
      tamanho = 0;
    }
    atual += ch;
    tamanho += t;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

const dois = (n) => String(n).padStart(2, '0');
const dataIcs = (d) => `${d.getFullYear()}${dois(d.getMonth() + 1)}${dois(d.getDate())}`;
const dataHoraIcs = (d) => `${dataIcs(d)}T${dois(d.getHours())}${dois(d.getMinutes())}00`;
const carimboUtc = (d) => `${d.getUTCFullYear()}${dois(d.getUTCMonth() + 1)}${dois(d.getUTCDate())}T${dois(d.getUTCHours())}${dois(d.getUTCMinutes())}${dois(d.getUTCSeconds())}Z`;

// junta a hora 'hh:mm' a um dia
function comHora(dia, hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  const d = new Date(dia);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function diaSeguinte(d) {
  const n = new Date(d);
  n.setDate(n.getDate() + 1);
  return n;
}

// um vevent a partir de { uid, titulo, inicio, fim?, diaInteiro?, local?, notas?, alarme? }
function vevent(item, agora) {
  const linhas = ['BEGIN:VEVENT', `UID:${item.uid}@jurisleo`, `DTSTAMP:${carimboUtc(agora)}`];
  if (item.diaInteiro) {
    linhas.push(`DTSTART;VALUE=DATE:${dataIcs(item.inicio)}`, `DTEND;VALUE=DATE:${dataIcs(diaSeguinte(item.fim || item.inicio))}`);
  } else {
    linhas.push(`DTSTART:${dataHoraIcs(item.inicio)}`, `DTEND:${dataHoraIcs(item.fim || new Date(item.inicio.getTime() + 3600000))}`);
  }
  linhas.push(`SUMMARY:${escaparTexto(item.titulo)}`);
  if (item.local) linhas.push(`LOCATION:${escaparTexto(item.local)}`);
  if (item.notas) linhas.push(`DESCRIPTION:${escaparTexto(item.notas)}`);
  if (item.alarme) {
    linhas.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escaparTexto(item.titulo)}`, `TRIGGER:${item.alarme}`, 'END:VALARM');
  }
  linhas.push('END:VEVENT');
  return linhas;
}

// provas e outros eventos do calendário da app (sem aulas, que vêm à parte)
export function itensDeEventos(eventos, { soProvas }) {
  return eventos
    .filter((e) => e.tipo !== 'aula' && e.estado !== 'cancelado')
    .filter((e) => (soProvas ? TIPOS_PROVA.has(e.tipo) : !TIPOS_PROVA.has(e.tipo)))
    .map((e) => {
      const dia = paraData(e.dataOriginal ?? e.data);
      if (!dia) return null;
      const fimDia = paraData(e.dataFim);
      const temHora = !!e.horaInicio;
      return {
        uid: `evento-${e.id}`,
        titulo: e.titulo || 'Evento',
        inicio: temHora ? comHora(dia, e.horaInicio) : dia,
        fim: temHora ? comHora(dia, e.horaFim || e.horaInicio) : fimDia || dia,
        diaInteiro: !temHora,
        local: e.sala || e.local || '',
        notas: e.notas || '',
        // provas avisam na véspera; o resto não
        alarme: TIPOS_PROVA.has(e.tipo) ? '-P1D' : null,
      };
    })
    .filter(Boolean)
    // um evento de vários dias aparece uma vez por dia na app: aqui só uma vez
    .filter((item, i, todos) => todos.findIndex((x) => x.uid === item.uid) === i);
}

// prazos das tarefas por fazer, como eventos de dia inteiro com aviso às 9h desse dia
export function itensDeTarefas(tarefas) {
  return tarefas
    .filter((t) => !t.concluida && t.prazo)
    .map((t) => {
      const [a, m, d] = t.prazo.split('-').map(Number);
      return { uid: `tarefa-${t.id}`, titulo: `Prazo: ${t.titulo}`, inicio: new Date(a, m - 1, d, 12), diaInteiro: true, notas: t.notas || '', alarme: 'PT9H' };
    });
}

// as aulas do semestre (ocorrências já geradas, sem as canceladas)
export function itensDeAulas(ocorrencias) {
  return ocorrencias
    .filter((o) => o.tipo === 'aula' && o.estadoAula !== 'cancelada' && o.horaInicio)
    .map((o) => {
      const dia = paraData(o.data);
      return {
        uid: `aula-${o.ocorrenciaId || `${o.aulaId}-${chaveData(dia)}`}`,
        titulo: `${o.titulo}${o.tipoAula === 'pratica' ? ' (prática)' : ''}`,
        inicio: comHora(dia, o.horaInicio),
        fim: comHora(dia, o.horaFim || o.horaInicio),
        local: o.sala || '',
      };
    });
}

export function gerarIcs(itens, agora = new Date()) {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JurisLeo//Calendario//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:JurisLeo',
    ...itens.flatMap((item) => vevent(item, agora)),
    'END:VCALENDAR',
  ];
  return linhas.map(dobrarLinha).join('\r\n') + '\r\n';
}
