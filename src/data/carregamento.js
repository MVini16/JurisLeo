// frases dos ecrãs de carregamento, no estilo do Barney Stinson (How I Met Your Mother) e do Damon Salvatore (The Vampire Diaries).
// são frases originais, escritas ao jeito das personagens e ligadas ao estudo; as expressões-assinatura são curtas e conhecidas
export const FRASES_CARREGAMENTO = [
  { autor: 'barney', texto: 'A carregar... espera por isso... espera por isso... lendário.' },
  { autor: 'barney', texto: 'Fato vestido, gravata direita. Suit up, Leonor.' },
  { autor: 'barney', texto: 'Regra do Bro Code: nunca se deixa o resumo para a véspera. Estou a carregar o teu.' },
  { autor: 'barney', texto: 'Desafio aceite. Esta página já vem.' },
  { autor: 'barney', texto: 'O meu plano tem 47 passos e funciona sempre. Quase sempre. Este é o passo 12.' },
  { autor: 'barney', texto: 'Um high five por abrires a app em vez das redes sociais. Please.' },
  { autor: 'barney', texto: 'Prepara-te: o que aí vem é lendário. Ou pelo menos legível.' },
  { autor: 'barney', texto: 'Se isto demorar, é só o tempo de eu ajeitar a gravata.' },
  { autor: 'barney', texto: 'A tua nota vai ser de fato e gravata. Eu garanto. Mais ou menos.' },
  { autor: 'barney', texto: 'Tu e os teus flashcards: a melhor equipa desde o fato e a gravata.' },
  { autor: 'barney', texto: 'Isto vai ser lendário. A sério. Já disse lendário? Lendário.' },
  { autor: 'damon', texto: 'Bourbon, flashcards e eu. A noite promete.' },
  { autor: 'damon', texto: 'Não sou o irmão bom, mas sou rápido a carregar. Quase.' },
  { autor: 'damon', texto: 'Mystic Falls tinha menos drama do que uma tabela de faltas em dezembro. Já vem.' },
  { autor: 'damon', texto: 'Paciência, Leonor. Eu esperei cento e muitos anos por menos.' },
  { autor: 'damon', texto: 'Sorriso torto, olhar de lado, página a chegar.' },
  { autor: 'damon', texto: 'Dizem que sou egoísta. Mesmo assim estou a carregar isto só para ti.' },
  { autor: 'damon', texto: 'Se isto fosse um vampiro, já tinha mordido a página. Calma.' },
  { autor: 'damon', texto: 'Sarcasmo a 100%. Resumos a carregar.' },
  { autor: 'damon', texto: 'Tu tens frequência, eu tenho eternidade. Toma, já vai.' },
  { autor: 'damon', texto: 'Olá, irmão. Ah, és tu, página. Entra.' },
];

export const ESTILOS_CARREGAMENTO = [
  { id: 'misto', nome: 'Misto', descricao: 'Frases do Barney e do Damon, à vez.' },
  { id: 'barney', nome: 'Só Barney', descricao: 'Legen... espera por isso... dary.' },
  { id: 'damon', nome: 'Só Damon', descricao: 'Sarcasmo, bourbon e olhar de lado.' },
  { id: 'simples', nome: 'Simples', descricao: 'Só "A carregar...".' },
];

export function estiloCarregamentoValido(id) {
  return ESTILOS_CARREGAMENTO.some((e) => e.id === id) ? id : 'misto';
}

// as frases possíveis para um estilo
export function frasesDoEstilo(estilo, lista = FRASES_CARREGAMENTO) {
  const e = estiloCarregamentoValido(estilo);
  if (e === 'simples') return [];
  if (e === 'misto') return lista;
  return lista.filter((f) => f.autor === e);
}

// escolhe a frase seguinte sem repetir a anterior; `aleatorio` entre 0 e 1 (para se poder testar)
export function proximaFrase(lista, anterior = -1, aleatorio = Math.random()) {
  if (lista.length === 0) return -1;
  if (lista.length === 1) return 0;
  let i = Math.floor(aleatorio * lista.length) % lista.length;
  if (i === anterior) i = (i + 1) % lista.length;
  return i;
}
