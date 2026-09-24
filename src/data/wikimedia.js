// dados fixos do wikcionário e da wikipédia em português (apis abertas da wikimedia, sem chave)
// origin=* é o que a wikimedia pede para aceitar pedidos de qualquer site (cors)
// regra de produto: é apoio à leitura, nunca fonte para a frequência — o aviso aparece sempre

export const URL_WIKCIONARIO = (termo) =>
  `https://pt.wiktionary.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&explaintext=1&redirects=1&origin=*&titles=${encodeURIComponent(termo)}`;
export const URL_PAGINA_WIKCIONARIO = (titulo) => `https://pt.wiktionary.org/wiki/${encodeURIComponent(titulo.replace(/ /g, '_'))}`;
export const URL_WIKIPEDIA = (titulo) =>
  `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titulo.replace(/ /g, '_'))}`;

// dicionários mudam pouco; a wikipédia um pouco mais
export const VALIDADE_WIKCIONARIO_MS = 30 * 24 * 60 * 60 * 1000;
export const VALIDADE_WIKIPEDIA_MS = 7 * 24 * 60 * 60 * 1000;

// secções de língua aceites, por ordem de preferência (o latim jurídico vem em "Latim")
export const LINGUAS_WIKCIONARIO = ['Português', 'Latim'];

// secções que não são significados — tudo o resto dentro da língua é tratado como classe (Substantivo, Verbo...)
export const SECCOES_IGNORADAS = [
  'Etimologia', 'Pronúncia', 'Tradução', 'Traduções', 'Ver também', 'Anagramas', 'Referências', 'Fontes',
  'Sinônimos', 'Sinónimos', 'Antônimos', 'Antónimos', 'Formas alternativas', 'Expressões', 'Divisão silábica',
  'Descendentes', 'Nota', 'Notas', 'Termos derivados', 'Conjugação', 'Declinação', 'Flexão', 'Hifenização',
  'Verbetes derivados', 'Palavras derivadas', 'Termos relacionados', 'Homófonos', 'Parónimos', 'Parônimos',
];

// no telemóvel chegam poucas linhas: o link leva à página inteira
export const MAX_DEFINICOES_POR_CLASSE = 4;
export const MAX_CLASSES = 3;

export const AVISO_FONTE = 'Apoio à leitura, escrito por voluntários. Não é fonte para a frequência: confirma no manual.';
export const CREDITO_WIKIMEDIA = 'Textos do Wikcionário e da Wikipédia, licença CC BY-SA';
