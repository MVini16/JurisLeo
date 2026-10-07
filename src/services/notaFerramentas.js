// ferramentas de uma nota aberta: procurar texto, índice automático e preparar um flashcard a partir de uma seleção.
// lógica pura (sem react, tiptap nem firebase), para testar com vitest sem mocks

// tira maiúsculas e acentos sem mudar o comprimento do texto, para as posições continuarem a bater certo
export function normalizar(texto) {
  let saida = '';
  for (const letra of String(texto ?? '')) {
    const base = letra.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const simples = base.toLowerCase();
    // se a letra mudou de comprimento (ex. "ß"), fica como estava, para não desalinhar
    saida += simples.length === letra.length ? simples : letra;
  }
  return saida;
}

// onde o termo aparece no texto, sem acentos nem maiúsculas. cada ocorrência é {de, ate} (ate não incluído)
export function encontrarOcorrencias(texto, termo) {
  const procurado = normalizar(String(termo ?? '').trim());
  if (!procurado) return [];
  const alvo = normalizar(texto);
  const achados = [];
  let desde = 0;
  while (desde <= alvo.length - procurado.length) {
    const i = alvo.indexOf(procurado, desde);
    if (i === -1) break;
    achados.push({ de: i, ate: i + procurado.length });
    desde = i + procurado.length;
  }
  return achados;
}

// anda para a frente ou para trás nas ocorrências, voltando ao princípio ou ao fim
export function proximaOcorrencia(atual, total, delta) {
  if (total <= 0) return -1;
  if (atual < 0) return delta >= 0 ? 0 : total - 1;
  return (atual + delta + total) % total;
}

function textoDoNo(no) {
  if (!no) return '';
  if (no.type === 'text') return no.text || '';
  return (no.content || []).map(textoDoNo).join('');
}

// os títulos da nota, por ordem: é o índice automático. ignora títulos vazios
export function indiceDoDocumento(doc) {
  const itens = [];
  const visitar = (no) => {
    if (!no) return;
    if (no.type === 'heading') {
      const texto = textoDoNo(no).trim();
      if (texto) itens.push({ nivel: no.attrs?.level ?? 1, texto });
      return;
    }
    (no.content || []).forEach(visitar);
  };
  visitar(doc);
  return itens;
}

// um flashcard a partir do texto escolhido: a resposta é a seleção (limpa e com limite) e a pergunta fica para ela escrever.
// se a seleção for "termo: explicação", a pergunta já vem sugerida
export function prepararFlashcard(selecao, limite = 600) {
  const limpo = String(selecao ?? '').replace(/\s+/g, ' ').trim().slice(0, limite);
  const separador = limpo.indexOf(':');
  if (separador > 2 && separador < 80 && limpo.length - separador > 8) {
    const termo = limpo.slice(0, separador).trim();
    return { frente: `O que é ${termo}?`, tras: limpo.slice(separador + 1).trim() };
  }
  return { frente: '', tras: limpo };
}
