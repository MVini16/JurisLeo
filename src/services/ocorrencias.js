// gera as ocorrências datadas de uma aula semanal — função pura, partilhada por
// calendário, horário e dashboard, para todos verem as mesmas aulas e os mesmos ids
import { chaveData, ehFeriado } from '../data/feriados.js';

function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  return valor.toDate?.() ?? null;
}

// as aulas que contam falta são as práticas
export function tipoDaAula(aula) {
  if (aula.tipoAula) return aula.tipoAula;
  return aula.contaFalta ? 'pratica' : 'teorica';
}

// id estável de uma ocorrência: a mesma aula no mesmo dia dá sempre o mesmo id
export function idOcorrencia(aulaId, data) {
  return `${aulaId}_${chaveData(data)}`;
}

// uma ocorrência por semana entre dataInicio e dataFim, sem feriados nacionais
export function gerarOcorrencias(aula, { comFeriados = false } = {}) {
  const inicio = paraData(aula.dataInicio);
  const fim = paraData(aula.dataFim);
  if (!inicio || !fim) return [];

  const tipoAula = tipoDaAula(aula);
  const ocorrencias = [];
  const atual = new Date(inicio);

  // avança até ao primeiro dia da semana certo
  while (atual.getDay() !== aula.diaSemana) {
    atual.setDate(atual.getDate() + 1);
  }

  while (atual <= fim) {
    // não há aulas nos feriados nacionais
    if (comFeriados || !ehFeriado(atual)) {
      const data = new Date(atual);
      ocorrencias.push({
        id: idOcorrencia(aula.id, data),
        ocorrenciaId: idOcorrencia(aula.id, data),
        aulaId: aula.id,
        titulo: aula.titulo,
        data,
        horaInicio: aula.horaInicio,
        horaFim: aula.horaFim,
        cadeira: aula.cadeira,
        sala: aula.sala,
        docente: aula.docente || '',
        tipo: 'aula',
        tipoAula,
        contaFalta: tipoAula === 'pratica',
        familia: 'faculdade',
        repetido: true,
      });
    }
    atual.setDate(atual.getDate() + 7);
  }

  return ocorrencias;
}

// junta o estado marcado (fui, faltei, ...) a cada ocorrência
export function comEstados(ocorrencias, estados) {
  return ocorrencias.map((o) => ({ ...o, estadoAula: estados[o.ocorrenciaId]?.estado || 'porMarcar' }));
}

// minutos desde a meia-noite, para comparar horas 'hh:mm'
export function paraMinutos(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// aula a decorrer e a seguinte, a partir das ocorrências de hoje já ordenadas por hora
export function aulaAgoraESeguinte(ocorrenciasHoje, agora = new Date()) {
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const ordenadas = [...ocorrenciasHoje]
    .filter((o) => paraMinutos(o.horaInicio) != null)
    .sort((a, b) => paraMinutos(a.horaInicio) - paraMinutos(b.horaInicio));

  const emCurso = ordenadas.find((o) => paraMinutos(o.horaInicio) <= minutos && minutos < paraMinutos(o.horaFim));
  const seguinte = ordenadas.find((o) => paraMinutos(o.horaInicio) > minutos);
  return { emCurso: emCurso || null, seguinte: seguinte || null };
}
