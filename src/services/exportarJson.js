// prepara os dados do backup para json — função pura, sem firebase nem react
// os timestamps do firestore trazem toJSON(), que o JSON.stringify chama antes de qualquer
// replacer: saíam como { seconds, nanoseconds } em vez de uma data legível. aqui convertem-se antes.
export function limparParaJson(valor) {
  if (valor === null || valor === undefined) return valor ?? null;
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object' && typeof valor.toDate === 'function') return valor.toDate().toISOString();
  if (Array.isArray(valor)) return valor.map(limparParaJson);
  if (typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, limparParaJson(v)]));
  }
  return valor;
}

// todas as coleções da utilizadora que entram no backup (uma por linha, para ser fácil juntar novas)
export const COLECOES_BACKUP = [
  'eventos', 'aulasSemanais', 'estadosAula', 'faltasRegisto', 'tarefas', 'anotacoes', 'casos',
  'artigos', 'glossario', 'leituras', 'sessoesEstudo', 'flashcards', 'fichas', 'sumarios',
  'registosDiarios', 'topicosCorrecao', 'mapasMentais', 'frequencias', 'caixaEntrada',
];
