// comparar a resposta dela com os tópicos de correção publicados — função pura, sem firebase
// nem react. o regulamento (art. 29.º) prevê recurso da nota do exame escrito, fundamentado
// questão a questão face aos tópicos de correção, no prazo de 2 dias úteis após a publicitação
// da nota (verificado contra o texto oficial do regulamento em 22-09-2026).

export const PRAZO_RECURSO_DIAS_UTEIS = 2;

// uma linha, um tópico — sem linhas vazias (mesmo padrão de passosDaChecklist em fichas.js)
export function linhasParaTopicos(texto) {
  return String(texto ?? '')
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .map((l) => ({ texto: l, tinha: null })); // null = ainda por marcar
}

export function marcarTopico(topicos, indice, tinha) {
  if (indice < 0 || indice >= topicos.length) return topicos;
  return topicos.map((t, i) => (i === indice ? { ...t, tinha } : t));
}

// { tinha, faltou, porMarcar, total }
export function contarTopicos(topicos) {
  const total = topicos.length;
  const tinha = topicos.filter((t) => t.tinha === true).length;
  const faltou = topicos.filter((t) => t.tinha === false).length;
  return { tinha, faltou, porMarcar: total - tinha - faltou, total };
}

// tópicos que ela diz que tinha na resposta mas a nota não refletiu — o que reclamar no recurso
export function pontosParaReclamar(topicos) {
  return topicos.filter((t) => t.tinha === true).map((t) => t.texto);
}

// tópicos que ela reconhece que não abordou — o que rever antes da próxima prova
export function pontosParaRever(topicos) {
  return topicos.filter((t) => t.tinha === false).map((t) => t.texto);
}
