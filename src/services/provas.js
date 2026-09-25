// a próxima prova (frequência ou exame) e a checklist da matéria — funções puras, sem firebase nem react
import { chaveData } from '../data/feriados.js';
import { diasEntre, paraData } from './datas.js';

// a próxima frequência ou exame que ainda não passou (hoje conta)
export function proximaProva(eventos, hoje = new Date()) {
  const hojeChave = chaveData(hoje);
  const provas = eventos
    .filter((e) => (e.tipo === 'frequencia' || e.tipo === 'exame') && e.estado !== 'cancelado')
    .map((e) => ({ evento: e, data: paraData(e.data) }))
    .filter((p) => p.data && chaveData(p.data) >= hojeChave)
    .sort((a, b) => a.data - b.data);
  if (provas.length === 0) return null;
  const { evento, data } = provas[0];
  return { id: evento.id || null, titulo: evento.titulo, cadeira: evento.cadeira || null, tipo: evento.tipo, data, horaInicio: evento.horaInicio || '', diasRestantes: diasEntre(hoje, data) };
}

// --- checklist da matéria: [{ texto, feito }] ---
export function acrescentarTopico(topicos, texto) {
  const limpo = String(texto ?? '').trim();
  if (!limpo) return topicos;
  if (topicos.some((t) => t.texto.toLowerCase() === limpo.toLowerCase())) return topicos;
  return [...topicos, { texto: limpo, feito: false }];
}

export function alternarTopico(topicos, indice) {
  if (indice < 0 || indice >= topicos.length) return topicos;
  return topicos.map((t, i) => (i === indice ? { ...t, feito: !t.feito } : t));
}

export function removerTopico(topicos, indice) {
  if (indice < 0 || indice >= topicos.length) return topicos;
  return topicos.filter((_, i) => i !== indice);
}

export function progressoChecklist(topicos) {
  const total = topicos.length;
  const feitos = topicos.filter((t) => t.feito).length;
  return { feitos, total, percentagem: total === 0 ? 0 : Math.round((feitos / total) * 100) };
}

// o que dizer sobre os dias que faltam, em linguagem simples
export function textoDosDias(dias) {
  if (dias === 0) return 'É hoje.';
  if (dias === 1) return 'É amanhã.';
  return `Faltam ${dias} dias.`;
}

// continua a sair daqui para quem já o importava
export { paraData };
