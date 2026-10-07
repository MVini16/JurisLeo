// presenças às aulas — função pura, sem firebase, sem react
//
// cada aula marcada fica numa chave 'aulaId_aaaa-mm-dd' (aulas semanais) ou 'ev_idDoEvento' (eventos únicos).
// as marcas de uma cadeira ficam todas num só documento (cadeiras/{id}/presencas/dados, campo 'marcas').
// só contam para o motor de faltas as aulas com contaFalta (as práticas).

import { ESTADOS_POR_ID } from '../data/estadosAula.js';

export function dataParaChave(data) {
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${m}-${d}`;
}

// chave estável de uma ocorrência do calendário (null se não der para marcar)
export function chaveAula(ev) {
  if (!ev || ev.tipo !== 'aula' || !ev.cadeira) return null;
  if (ev.aulaId) {
    const data = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
    return data ? `${ev.aulaId}_${dataParaChave(data)}` : null;
  }
  return ev.id ? `ev_${ev.id}` : null;
}

// só se marca o que já começou: hoje (a partir da hora de início) ou dias passados
export function jaPodeMarcar(ev, agora = new Date()) {
  const data = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
  if (!data) return false;
  const [h, min] = (ev.horaInicio || '00:00').split(':').map(Number);
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate(), h || 0, min || 0);
  return inicio <= agora;
}

// limpa e valida uma marca antes de ir para o firestore
export function normalizarMarca({ estado, motivo = '', comprovativo = false, nota = '', contaFalta = false, data = '', titulo = '' }) {
  if (!ESTADOS_POR_ID[estado]) return null;
  const justificada = estado === 'faltei-justificada';
  return {
    estado,
    contaFalta: !!contaFalta,
    motivo: justificada ? String(motivo || '').trim() : '',
    comprovativo: justificada ? !!comprovativo : false,
    nota: String(nota || '').trim().slice(0, 300),
    // para o histórico: a data (AAAA-MM-DD) e o nome da aula no momento da marcação
    data: /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : '',
    titulo: String(titulo || '').slice(0, 80),
  };
}

// conta o que as marcas de uma cadeira valem para o motor de faltas
export function contarMarcas(marcas = {}) {
  const r = { lecionadas: 0, injustificadas: 0, justificadas: 0, presentes: 0, profFaltou: 0, semAula: 0, semComprovativo: 0 };
  for (const marca of Object.values(marcas)) {
    const estado = ESTADOS_POR_ID[marca?.estado];
    if (!estado) continue;
    if (estado.id === 'presente') r.presentes++;
    if (estado.id === 'prof-faltou') r.profFaltou++;
    if (estado.id === 'sem-aula') r.semAula++;
    if (!marca.contaFalta) continue; // teóricas: ficam registadas mas não entram na conta
    if (estado.lecionada) r.lecionadas++;
    if (estado.falta === 'injustificada') r.injustificadas++;
    if (estado.falta === 'justificada') {
      r.justificadas++;
      if (!marca.comprovativo) r.semComprovativo++;
    }
  }
  return r;
}

// números que vão para o motor: o que ela já tinha escrito à mão + o que vem das marcas do calendário
export function faltasEfetivas(faltasDados, marcas) {
  const c = contarMarcas(marcas);
  return {
    aulasPraticasLecionadas: (faltasDados?.aulasPraticasLecionadas || 0) + c.lecionadas,
    faltasInjustificadas: (faltasDados?.faltasInjustificadas || 0) + c.injustificadas,
    faltasJustificadas: (faltasDados?.faltasJustificadas || 0) + c.justificadas,
    marcas: c,
  };
}

// aulas práticas já passadas e ainda sem marca (para lembrar a leonor)
export function aulasPorMarcar(eventos, marcasPorChave, agora = new Date()) {
  return eventos
    .filter((ev) => ev.tipo === 'aula' && ev.contaFalta && ev.cadeira && jaPodeMarcar(ev, agora))
    .filter((ev) => !marcasPorChave[chaveAula(ev)])
    .sort((a, b) => (a.data - b.data) || (a.horaInicio || '').localeCompare(b.horaInicio || ''));
}

// o que ela escreve sobre cada aula, à parte da presença: sumário, nota, trabalho para casa e dúvida
export const CAMPOS_NOTAS_AULA = ['sumario', 'nota', 'tpc', 'duvida'];
export function normalizarNotasAula(campos = {}) {
  const limpo = {};
  CAMPOS_NOTAS_AULA.forEach((c) => { limpo[c] = String(campos[c] ?? '').trim().slice(0, 1500); });
  return CAMPOS_NOTAS_AULA.some((c) => limpo[c]) ? limpo : null;
}

// se a aula está a decorrer agora (hoje, entre a hora de início e a de fim)
export function aulaEmCurso(ev, agora = new Date()) {
  const data = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
  if (!data || ev.tipo !== 'aula' || !ev.horaInicio || !ev.horaFim) return false;
  if (data.getDate() !== agora.getDate() || data.getMonth() !== agora.getMonth() || data.getFullYear() !== agora.getFullYear()) return false;
  const minutos = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  return agoraMin >= minutos(ev.horaInicio) && agoraMin < minutos(ev.horaFim);
}
