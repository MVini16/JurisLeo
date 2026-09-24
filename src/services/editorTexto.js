// lógica pura do editor do caderno (documentos do tiptap/prosemirror) — sem react
// o texto simples de cada página continua guardado em `conteudo`, para a pesquisa, as ligações,
// a consola, o rever texto e o significado funcionarem como sempre
import { LETRAS, PAPEIS, TAMANHO_MIN, TAMANHO_MAX, ESTILO_PADRAO } from '../data/caderno.js';

// texto simples (anotações antigas) → documento do editor, um parágrafo por linha
export function docDeTextoSimples(texto) {
  const linhas = String(texto ?? '').split('\n');
  return {
    type: 'doc',
    content: linhas.map((linha) => (linha
      ? { type: 'paragraph', content: [{ type: 'text', text: linha }] }
      : { type: 'paragraph' })),
  };
}

// um documento guardado só é aceite se tiver o formato certo; senão usa-se o texto simples
export function docInicial(conteudoRico, conteudo) {
  if (conteudoRico && conteudoRico.type === 'doc' && Array.isArray(conteudoRico.content)) return conteudoRico;
  return docDeTextoSimples(conteudo);
}

// texto do documento e, para cada letra, a posição dela no documento do prosemirror
// blocos separados por '\n' (o mesmo texto que fica em `conteudo`), para o rever texto trocar no sítio certo
export function mapaDeTexto(doc) {
  let texto = '';
  const posicoes = [];
  let primeiro = true;
  doc.descendants((no, pos) => {
    if (!no.isTextblock) return true;
    if (!primeiro) {
      texto += '\n';
      posicoes.push(pos);
    }
    primeiro = false;
    no.forEach((filho, desvio) => {
      const inicio = pos + 1 + desvio;
      if (filho.isText) {
        for (let k = 0; k < filho.text.length; k += 1) posicoes.push(inicio + k);
        texto += filho.text;
      } else if (filho.type.name === 'hardBreak' || filho.type.name === 'hard_break') {
        texto += '\n';
        posicoes.push(inicio);
      }
    });
    return false;
  });
  return { texto, posicoes };
}

// [inicio, fim) no texto → { de, ate } no documento; null se sair fora
export function intervaloNoDoc(mapa, inicio, fim) {
  if (inicio < 0 || fim > mapa.posicoes.length || fim < inicio) return null;
  if (fim === inicio) {
    const pos = inicio < mapa.posicoes.length ? mapa.posicoes[inicio] : (mapa.posicoes.at(-1) ?? 0) + 1;
    return { de: pos, ate: pos };
  }
  return { de: mapa.posicoes[inicio], ate: mapa.posicoes[fim - 1] + 1 };
}

// { de, ate } do documento → [inicio, fim) no texto (a primeira letra na posição ou depois dela)
export function intervaloNoTexto(mapa, de, ate) {
  const achar = (p) => {
    const i = mapa.posicoes.findIndex((x) => x >= p);
    return i === -1 ? mapa.posicoes.length : i;
  };
  return { inicio: achar(de), fim: achar(ate) };
}

// estilo guardado → estilo válido (letra, tamanho e papel conhecidos)
export function normalizarEstilo(estilo) {
  const e = estilo ?? {};
  const letra = LETRAS.some((l) => l.id === e.letra) ? e.letra : ESTILO_PADRAO.letra;
  const papel = PAPEIS.some((p) => p.id === e.papel) ? e.papel : ESTILO_PADRAO.papel;
  const tamanho = Number.isFinite(e.tamanho)
    ? Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, Math.round(e.tamanho)))
    : ESTILO_PADRAO.tamanho;
  return { letra, tamanho, papel };
}

export function contarPalavras(texto) {
  const t = String(texto ?? '').trim();
  return t ? t.split(/\s+/).length : 0;
}
