// onde é que um artigo, caso ou anotação aparece nos outros — mesma pesquisa simples
// (substring, sem acentos) já usada na pesquisa global. função pura, sem firebase nem react.
import { normalizar } from './fichas.js';

function contemTermo(texto, termo) {
  if (!termo || !String(termo).trim()) return false;
  return normalizar(texto).includes(normalizar(termo));
}

function textoDoCaso(caso) {
  return [caso.titulo, caso.enunciado, caso.estrutura?.factos, caso.estrutura?.questao, caso.estrutura?.enquadramento, caso.estrutura?.subsuncao, caso.estrutura?.conclusao]
    .filter(Boolean)
    .join(' ');
}

// [{ tipo: 'anotacoes' | 'casos', id, titulo }] — nunca inclui o próprio item (excluirTipo + excluirId)
export function ondeAparece(termo, { anotacoes = [], casos = [] } = {}, excluir = {}) {
  const resultados = [];

  for (const a of anotacoes) {
    if (excluir.tipo === 'anotacoes' && excluir.id === a.id) continue;
    if (contemTermo(a.titulo, termo) || contemTermo(a.conteudo, termo)) {
      resultados.push({ tipo: 'anotacoes', id: a.id, titulo: a.titulo || 'Sem título' });
    }
  }

  for (const c of casos) {
    if (excluir.tipo === 'casos' && excluir.id === c.id) continue;
    if (contemTermo(textoDoCaso(c), termo)) {
      resultados.push({ tipo: 'casos', id: c.id, titulo: c.titulo || 'Sem título' });
    }
  }

  return resultados;
}
