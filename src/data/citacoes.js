// citações com fonte, à parte das frases originais de data/frases.js (essas são nossas, estas são de outros)
// regra: nenhuma citação entra sem fonte. verificacao diz até onde se confirmou:
//   'primaria'  — o texto está na fonte original (ex: o Digesto de Justiniano), com a referência
//   'tradicao'  — brocardo latino de uso corrente, sem autor certo; o significado é uma tradução nossa
//   'wikiquote' — só confirmada numa página do Wikiquote (fonte secundária); ver o link e, se possível, o episódio
// para acrescentar: seguir docs/CITACOES.md — falas curtas, com personagem, série e link
// o campo pt é sempre uma tradução nossa do significado, nunca uma citação

const DIGESTO = 'https://www.thelatinlibrary.com/justinian/digest1.shtml';
const WIKIQUOTE_SUITS = 'https://en.wikiquote.org/wiki/Suits_(TV_series)';
const WIKIQUOTE_TVD1 = 'https://en.wikiquote.org/wiki/The_Vampire_Diaries_(season_1)';

export const citacoes = [
  // --- do direito romano, com referência ao Digesto ---
  { id: 'dig-1-1-10-a', texto: 'Iustitia est constans et perpetua voluntas ius suum cuique tribuendi.', pt: 'A justiça é a vontade constante e perpétua de dar a cada um o que é seu.', autor: 'Ulpiano', fonte: { nome: 'Digesto 1.1.10', url: DIGESTO }, origem: 'direito', verificacao: 'primaria' },
  { id: 'dig-1-1-10-b', texto: 'Iuris praecepta sunt haec: honeste vivere, alterum non laedere, suum cuique tribuere.', pt: 'Os preceitos do direito são estes: viver honestamente, não prejudicar ninguém, dar a cada um o que é seu.', autor: 'Ulpiano', fonte: { nome: 'Digesto 1.1.10', url: DIGESTO }, origem: 'direito', verificacao: 'primaria' },
  { id: 'dig-1-1-1', texto: 'Ius est ars boni et aequi.', pt: 'O direito é a arte do bom e do justo.', autor: 'Celso', fonte: { nome: 'Digesto 1.1.1', url: DIGESTO }, origem: 'direito', verificacao: 'primaria' },
  { id: 'cic-cluentio', texto: 'Legum servi sumus ut liberi esse possimus.', pt: 'Somos servos das leis para podermos ser livres.', autor: 'Cícero', fonte: { nome: 'Pro Cluentio, 146' }, origem: 'direito', verificacao: 'primaria' },

  // --- brocardos de uso corrente ---
  { id: 'broc-pacta', texto: 'Pacta sunt servanda.', pt: 'Os acordos devem ser cumpridos.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-dubio', texto: 'In dubio pro reo.', pt: 'Na dúvida, a favor do arguido.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-remedium', texto: 'Ubi ius, ibi remedium.', pt: 'Onde há direito, há remédio.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-audiatur', texto: 'Audiatur et altera pars.', pt: 'Que se ouça também a outra parte.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-nulla-poena', texto: 'Nulla poena sine lege.', pt: 'Nenhuma pena sem lei.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-iura-novit', texto: 'Iura novit curia.', pt: 'O tribunal conhece o direito.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-dura-lex', texto: 'Dura lex, sed lex.', pt: 'A lei é dura, mas é a lei.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-ad-impossibilia', texto: 'Ad impossibilia nemo tenetur.', pt: 'Ninguém está obrigado ao impossível.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },
  { id: 'broc-ubi-societas', texto: 'Ubi societas, ibi ius.', pt: 'Onde há sociedade, há direito.', autor: 'Brocardo latino', fonte: { nome: 'Tradição jurídica' }, origem: 'direito', verificacao: 'tradicao' },

  // --- de séries: falas curtas, só as que apareceram de forma consistente na fonte; sem número de episódio ---
  { id: 'suits-harvey-outro-eu', texto: "I'm looking for another me.", autor: 'Harvey Specter', fonte: { nome: 'Suits', url: WIKIQUOTE_SUITS }, origem: 'serie', verificacao: 'wikiquote' },
  { id: 'suits-donna-presente', texto: "There is no gift for Harvey. He gets what he wants and he doesn't want what he doesn't get.", autor: 'Donna Paulsen', fonte: { nome: 'Suits', url: WIKIQUOTE_SUITS }, origem: 'serie', verificacao: 'wikiquote' },
  { id: 'tvd-stefan-caminho', texto: 'We choose our own path. Our values and our actions, they define who we are.', autor: 'Stefan Salvatore', fonte: { nome: 'The Vampire Diaries', url: WIKIQUOTE_TVD1 }, origem: 'serie', verificacao: 'wikiquote' },
];

export const ORIGENS_CITACAO = ['direito', 'serie'];
