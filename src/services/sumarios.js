// os sumários das aulas juntos, por cadeira e por data — lógica pura, sem firebase nem react.
// ligam-se aos flashcards (um cartão por aula) e ao texto para partilhar ou imprimir

import { nomesCadeiras } from '../data/dadosLeonor.js';

export function topicosDe(sumario) {
  return String(sumario || '').split('\n').map((t) => t.trim()).filter(Boolean);
}

// transforma o mapa { chave: notas } de uma ou mais cadeiras numa lista, da mais recente para a mais antiga
export function listarSumarios(notasPorCadeira = {}) {
  const itens = [];
  Object.entries(notasPorCadeira).forEach(([cadeiraId, mapa]) => {
    Object.entries(mapa || {}).forEach(([chave, n]) => {
      if (!n || typeof n !== 'object') return;
      const topicos = topicosDe(n.sumario);
      if (topicos.length === 0 && !n.nota && !n.tpc && !n.duvida) return;
      itens.push({ chave, cadeiraId: n.cadeiraId || cadeiraId, data: n.data || '', titulo: n.titulo || 'Aula', topicos, nota: n.nota || '', tpc: n.tpc || '', duvida: n.duvida || '' });
    });
  });
  return itens.sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo));
}

export function filtrarSumarios(itens, { cadeiraId = 'todas', pesquisa = '' } = {}) {
  const q = pesquisa.trim().toLowerCase();
  return itens.filter((i) => {
    if (cadeiraId !== 'todas' && i.cadeiraId !== cadeiraId) return false;
    if (!q) return true;
    return [i.titulo, i.nota, i.tpc, i.duvida, ...i.topicos].some((t) => t.toLowerCase().includes(q));
  });
}

export function contarPorCadeira(itens) {
  const c = {};
  itens.forEach((i) => { c[i.cadeiraId] = (c[i.cadeiraId] || 0) + 1; });
  return c;
}

export function dataBonita(aaaammdd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(aaaammdd || '')) return 'Sem data';
  const [a, m, d] = aaaammdd.split('-');
  return `${d}-${m}-${a}`;
}

// um cartão por aula: a pergunta é "o que demos nesta aula?" e a resposta são os tópicos que ela própria escreveu
export function cartaoDaAula(item) {
  if (item.topicos.length === 0) return null;
  return {
    frente: `O que demos em ${item.titulo} (${dataBonita(item.data)})?`,
    tras: item.topicos.map((t) => `- ${t}`).join('\n'),
    cadeiraId: item.cadeiraId,
  };
}

// um cartão com um tópico à frente e a resposta que ela escrever (nunca inventamos a resposta)
export function cartaoDoTopico(item, topico, resposta) {
  const tras = String(resposta || '').trim();
  if (!tras) return null;
  return { frente: `${topico} (${item.titulo}, ${dataBonita(item.data)})`, tras, cadeiraId: item.cadeiraId };
}

// texto para partilhar, copiar para o Word ou imprimir
export function sumariosParaTexto(itens) {
  const blocos = itens.map((i) => {
    const linhas = [`${nomesCadeiras[i.cadeiraId] || i.cadeiraId} · ${i.titulo} · ${dataBonita(i.data)}`];
    if (i.topicos.length) linhas.push('Sumário:', ...i.topicos.map((t) => `- ${t}`));
    if (i.nota) linhas.push(`Nota: ${i.nota}`);
    if (i.tpc) linhas.push(`Trabalho para casa: ${i.tpc}`);
    if (i.duvida) linhas.push(`Dúvida: ${i.duvida}`);
    return linhas.join('\n');
  });
  return blocos.join('\n\n');
}
