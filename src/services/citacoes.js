// escolher frases sem repetir — funções puras, sem localStorage nem react
// método do "saco": cada frase sai uma vez antes de qualquer uma voltar a sair.
// com 400 frases e três aberturas por dia, passa mais de um ano sem repetir.
// por isso não são precisas 10 000 frases para ela não as ver repetidas.

// escolhe uma das que ainda não saíram; quando saíram todas, o saco esvazia-se (menos a última, para não repetir de seguida)
// devolve { escolhida, saidas }
export function escolherSemRepetir(ids, saidas = [], aleatorio = Math.random) {
  if (ids.length === 0) return { escolhida: null, saidas: [] };
  const conhecidas = new Set(ids);
  let jaSaiu = saidas.filter((id) => conhecidas.has(id));
  let disponiveis = ids.filter((id) => !jaSaiu.includes(id));
  if (disponiveis.length === 0) {
    const ultima = jaSaiu[jaSaiu.length - 1];
    jaSaiu = [];
    disponiveis = ids.length > 1 ? ids.filter((id) => id !== ultima) : ids;
  }
  const escolhida = disponiveis[Math.floor(aleatorio() * disponiveis.length)];
  return { escolhida, saidas: [...jaSaiu, escolhida] };
}

// que frases podem entrar, segundo as escolhas dela
// modo: 'misto' (originais e citações) | 'originais' | 'citacoes'
// series: false tira as falas de séries e de filmes (os filósofos e os livros ficam)
export function reunirFrases({ originais = [], citacoes = [], modo = 'misto', series = true } = {}) {
  const daSerie = (c) => c.origem === 'serie' || c.origem === 'filme';
  const citacoesPermitidas = citacoes.filter((c) => c.fonte?.nome && (series || !daSerie(c)));
  const comoFrases = citacoesPermitidas.map((c) => ({ id: `c:${c.id}`, texto: c.texto, pt: c.pt, autor: c.autor, fonte: c.fonte, traducao: !!c.traducao, citacao: true }));
  const nossas = originais.map((texto) => ({ id: `o:${texto}`, texto, citacao: false }));

  if (modo === 'originais') return nossas;
  if (modo === 'citacoes') return comoFrases.length ? comoFrases : nossas;
  return [...nossas, ...comoFrases];
}

// "— Ulpiano, Digesto 1.1.10"
export function legendaDaFrase(frase) {
  if (!frase?.citacao) return '';
  const base = [frase.autor, frase.fonte?.nome].filter(Boolean).join(', ');
  return frase.traducao ? `${base} (tradução livre)` : base;
}
