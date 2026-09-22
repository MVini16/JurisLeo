// mapas mentais: caixas e setas por cadeira — função pura, sem firebase nem react.
// o id de cada nó vem de fora (quem chama gera-o, ex. crypto.randomUUID()), para estas
// funções continuarem previsíveis e fáceis de testar.

export function noVazio(id, x, y, texto = 'Novo') {
  return { id, texto, x, y };
}

export function adicionarNo(nos, id, x, y, texto = 'Novo') {
  return [...nos, noVazio(id, x, y, texto)];
}

export function moverNo(nos, id, x, y) {
  return nos.map((n) => (n.id === id ? { ...n, x, y } : n));
}

export function editarTextoNo(nos, id, texto) {
  return nos.map((n) => (n.id === id ? { ...n, texto } : n));
}

// remove o nó e todas as ligações que o envolvem
export function removerNo(nos, ligacoes, id) {
  return {
    nos: nos.filter((n) => n.id !== id),
    ligacoes: ligacoes.filter((l) => l.de !== id && l.para !== id),
  };
}

// nunca duplica a mesma ligação (em qualquer sentido) nem liga um nó a si próprio
export function ligarNos(ligacoes, deId, paraId) {
  if (deId === paraId) return ligacoes;
  const jaExiste = ligacoes.some((l) => (l.de === deId && l.para === paraId) || (l.de === paraId && l.para === deId));
  if (jaExiste) return ligacoes;
  return [...ligacoes, { de: deId, para: paraId }];
}

export function removerLigacao(ligacoes, deId, paraId) {
  return ligacoes.filter((l) => !((l.de === deId && l.para === paraId) || (l.de === paraId && l.para === deId)));
}
