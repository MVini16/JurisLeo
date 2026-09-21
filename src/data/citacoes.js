// citações com fonte, à parte das frases originais de data/frases.js (essas são nossas, estas são de outros)
// regra: nenhuma citação entra sem fonte. verificacao diz até onde se confirmou:
//   'primaria'  — o texto está na fonte original (ex: o Digesto de Justiniano), com a referência
//   'tradicao'  — brocardo latino de uso corrente, sem autor certo; o significado é uma tradução nossa
//   'wikiquote' — só confirmada numa página do Wikiquote (fonte secundária); ver o link e, se possível, o episódio
//   'memoria'   — muito conhecida, escrita de memória e NÃO verificada (a pedido do Vini, 21-09-2026); pode haver pequenas diferenças
// traducao: true = o texto é uma tradução livre nossa para português (filósofos)
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

  // --- filósofos e juristas (textos em português: tradução livre) ---
  { id: 'f-socrates-exame', texto: 'Uma vida sem exame não vale a pena ser vivida.', autor: 'Sócrates', fonte: { nome: 'Platão, Apologia (38a)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-aristoteles-lei', texto: 'A lei é a razão livre de paixão.', autor: 'Aristóteles', fonte: { nome: 'Política (III, 16)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-aristoteles-justos', texto: 'Tornamo-nos justos praticando atos justos.', autor: 'Aristóteles', fonte: { nome: 'Ética a Nicómaco (II, 1)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-seneca-ousar', texto: 'Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que elas são difíceis.', autor: 'Séneca', fonte: { nome: 'Cartas a Lucílio' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-seneca-ensinar', texto: 'Enquanto ensinamos, aprendemos.', autor: 'Séneca', fonte: { nome: 'Cartas a Lucílio (7)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-epicteto-opinioes', texto: 'Não são as coisas que perturbam as pessoas, mas as opiniões que têm sobre elas.', autor: 'Epicteto', fonte: { nome: 'Manual (5)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-marco-caminho', texto: 'O que está no caminho torna-se o caminho.', autor: 'Marco Aurélio', fonte: { nome: 'Meditações (V, 20)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-cicero-nascer', texto: 'Não nascemos só para nós.', autor: 'Cícero', fonte: { nome: 'Dos Deveres (I, 22)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-platao-comeco', texto: 'O começo é a parte mais importante do trabalho.', autor: 'Platão', fonte: { nome: 'A República (II)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-descartes', texto: 'Penso, logo existo.', autor: 'Descartes', fonte: { nome: 'Discurso do Método' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-kant-ousa', texto: 'Ousa saber!', autor: 'Kant', fonte: { nome: 'O que é o Iluminismo?' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-nietzsche-porque', texto: 'Quem tem um porquê para viver suporta quase qualquer como.', autor: 'Nietzsche', fonte: { nome: 'Crepúsculo dos Ídolos' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-beauvoir', texto: 'Não se nasce mulher: torna-se mulher.', autor: 'Simone de Beauvoir', fonte: { nome: 'O Segundo Sexo' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-camus-verao', texto: 'No meio do inverno, aprendi finalmente que havia em mim um verão invencível.', autor: 'Albert Camus', fonte: { nome: 'O Verão' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-espinosa', texto: 'Não rir, não lamentar, nem detestar, mas compreender.', autor: 'Espinosa', fonte: { nome: 'Tratado Político' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-locke-tirania', texto: 'Onde acaba a lei, começa a tirania.', autor: 'John Locke', fonte: { nome: 'Segundo Tratado do Governo' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-montesquieu-poder', texto: 'Para que não se possa abusar do poder, é preciso que o poder limite o poder.', autor: 'Montesquieu', fonte: { nome: 'O Espírito das Leis (XI, 4)' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-rawls', texto: 'A justiça é a primeira virtude das instituições sociais, tal como a verdade o é dos sistemas de pensamento.', autor: 'John Rawls', fonte: { nome: 'Uma Teoria da Justiça' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-jhering', texto: 'O fim do direito é a paz; o meio de o alcançar é a luta.', autor: 'Rudolf von Jhering', fonte: { nome: 'A Luta pelo Direito' }, origem: 'filosofia', verificacao: 'memoria', traducao: true },
  { id: 'f-rui-barbosa', texto: 'A justiça tardia não é justiça, senão injustiça qualificada e manifesta.', autor: 'Rui Barbosa', fonte: { nome: 'Oração aos Moços' }, origem: 'filosofia', verificacao: 'memoria' },

  // --- escritores e livros ---
  { id: 'l-pessoa', texto: 'Tudo vale a pena se a alma não é pequena.', autor: 'Fernando Pessoa', fonte: { nome: 'Mensagem' }, origem: 'livro', verificacao: 'memoria' },
  { id: 'l-saramago', texto: 'Se podes olhar, vê. Se podes ver, repara.', autor: 'José Saramago', fonte: { nome: 'Ensaio sobre a Cegueira' }, origem: 'livro', verificacao: 'memoria' },
  { id: 'l-atticus-pele', texto: 'You never really understand a person until you consider things from his point of view.', autor: 'Atticus Finch', fonte: { nome: 'Harper Lee, To Kill a Mockingbird' }, origem: 'livro', verificacao: 'memoria' },
  { id: 'l-atticus-coragem', texto: 'Courage is when you know you\'re licked before you begin, but you begin anyway and you see it through no matter what.', autor: 'Atticus Finch', fonte: { nome: 'Harper Lee, To Kill a Mockingbird' }, origem: 'livro', verificacao: 'memoria' },
  { id: 'l-dumbledore', texto: 'It is our choices, Harry, that show what we truly are, far more than our abilities.', autor: 'Dumbledore', fonte: { nome: 'Harry Potter and the Chamber of Secrets' }, origem: 'livro', verificacao: 'memoria' },

  // --- filmes ---
  { id: 'fi-elle-hard', texto: 'What, like it\'s hard?', autor: 'Elle Woods', fonte: { nome: 'Legally Blonde' }, origem: 'filme', verificacao: 'memoria' },
  { id: 'fi-jessup', texto: 'You can\'t handle the truth!', autor: 'Coronel Jessup', fonte: { nome: 'A Few Good Men' }, origem: 'filme', verificacao: 'memoria' },
  { id: 'fi-yoda', texto: 'Do or do not. There is no try.', autor: 'Yoda', fonte: { nome: 'The Empire Strikes Back' }, origem: 'filme', verificacao: 'memoria' },
  { id: 'fi-dory', texto: 'Just keep swimming.', autor: 'Dory', fonte: { nome: 'Finding Nemo' }, origem: 'filme', verificacao: 'memoria' },

  // --- séries ---
  { id: 's-harvey-metas', texto: 'I don\'t have dreams, I have goals.', autor: 'Harvey Specter', fonte: { nome: 'Suits' }, origem: 'serie', verificacao: 'memoria' },
  { id: 's-gg-xoxo', texto: 'You know you love me. XOXO, Gossip Girl.', autor: 'Gossip Girl', fonte: { nome: 'Gossip Girl' }, origem: 'serie', verificacao: 'memoria' },
  { id: 's-lasso-curioso', texto: 'Be curious, not judgmental.', autor: 'Ted Lasso', fonte: { nome: 'Ted Lasso' }, origem: 'serie', verificacao: 'memoria' },
  { id: 's-michael-tiros', texto: 'You miss 100% of the shots you don\'t take.', autor: 'Michael Scott', fonte: { nome: 'The Office' }, origem: 'serie', verificacao: 'memoria' },
  { id: 's-parks-treat', texto: 'Treat yo self.', autor: 'Tom Haverford e Donna Meagle', fonte: { nome: 'Parks and Recreation' }, origem: 'serie', verificacao: 'memoria' },
];

export const ORIGENS_CITACAO = ['direito', 'filosofia', 'livro', 'filme', 'serie'];
