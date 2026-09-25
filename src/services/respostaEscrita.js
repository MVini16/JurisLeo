// responder por escrito nos flashcards: compara o que ela escreveu com a resposta do cartão
// função pura, sem firebase nem react. compara por palavras, sem acentos nem maiúsculas,
// e ignora palavras de ligação e números (de artigo, "483.º") (não contam para acertar nem falhar)

const PALAVRAS_VAZIAS = new Set([
  'a', 'o', 'as', 'os', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'por', 'para', 'com', 'que', 'se', 'ou', 'ao', 'aos', 'entre', 'art', 'arts', 'cc', 'n', 'nº',
]);

// "Voluntário," → "voluntario"
export function normalizarPalavra(palavra) {
  return String(palavra ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');
}

const contaParaAcertar = (n) => !!n && !PALAVRAS_VAZIAS.has(n) && !/^\d/.test(n);

// devolve as palavras da resposta certa, pela ordem, cada uma com o estado
// ('certa' | 'falta' | 'neutra'), e a percentagem das que contam que ela escreveu
export function compararResposta(escrita, certa) {
  const dela = new Set(String(escrita ?? '').split(/\s+/).map(normalizarPalavra).filter(Boolean));
  const palavras = String(certa ?? '').split(/\s+/).filter(Boolean).map((texto) => {
    const n = normalizarPalavra(texto);
    if (!contaParaAcertar(n)) return { texto, estado: 'neutra' };
    return { texto, estado: dela.has(n) ? 'certa' : 'falta' };
  });
  const importantes = [...new Set(palavras.filter((p) => p.estado !== 'neutra').map((p) => normalizarPalavra(p.texto)))];
  if (importantes.length === 0) return { palavras, percentagem: null };
  const acertou = importantes.filter((n) => dela.has(n)).length;
  return { palavras, percentagem: Math.round((acertou / importantes.length) * 100) };
}

// a confiança (1 a 5) que a percentagem sugere — é só uma sugestão, quem decide é ela
export function confiancaSugerida(percentagem) {
  if (percentagem === null || percentagem === undefined) return null;
  if (percentagem >= 90) return 5;
  if (percentagem >= 70) return 4;
  if (percentagem >= 45) return 3;
  if (percentagem >= 20) return 2;
  return 1;
}
