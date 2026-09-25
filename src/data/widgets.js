// catálogo dos widgets do ecrã de início — o que ela pode pôr, tirar e mudar de tamanho
// tamanhos: o primeiro é o tamanho com que o widget entra; 'largo' ocupa a linha toda
// deModulo: o cartão antigo (data/modulos.js) que este widget substitui, para respeitar o que ela já tinha escolhido
// novo: mostra a etiqueta "novo" na galeria

export const WIDGETS = [
  { id: 'aula', nome: 'Aula agora', icone: '🎓', descricao: 'A aula a decorrer e a seguinte, com sala.', tamanhos: ['largo', 'pequeno'], deModulo: 'aulaAgora' },
  { id: 'frequencias', nome: 'Frequências', icone: '⚖️', descricao: 'Dias até à próxima prova ou à janela de frequências.', tamanhos: ['pequeno', 'largo'], deModulo: 'proximaFrequencia' },
  { id: 'tempo', nome: 'Tempo em Lisboa', icone: '☀️', descricao: 'A previsão do IPMA e os avisos de mau tempo.', tamanhos: ['pequeno', 'largo'], deModulo: 'tempo' },
  { id: 'aquecimento', nome: 'Aquecimento', icone: '🏃', descricao: 'Antes de uma prática: cartões e perguntas dessa cadeira.', tamanhos: ['largo', 'pequeno'], novo: true },
  { id: 'carteira', nome: 'Hoje na faculdade', icone: '🗂️', descricao: 'As aulas de hoje como cartões da Wallet.', tamanhos: ['largo', 'pequeno'], deModulo: 'aulasHoje' },
  { id: 'tarefas', nome: 'Tarefas', icone: '✅', descricao: 'As mais urgentes, com o progresso do dia.', tamanhos: ['largo', 'pequeno'], deModulo: 'tarefasPendentes' },
  { id: 'oQueJaFiz', nome: 'O que já fiz', icone: '🏆', descricao: 'A tua semana, para os dias em que parece que não fizeste nada.', tamanhos: ['pequeno', 'largo'], novo: true },
  { id: 'flashcards', nome: 'Flashcards', icone: '🃏', descricao: 'Cartões por rever hoje.', tamanhos: ['pequeno'] },
  { id: 'sequencia', nome: 'Sequência', icone: '🔥', descricao: 'Dias seguidos a estudar.', tamanhos: ['pequeno'] },
  { id: 'dominio', nome: 'Quanto domino', icone: '📊', descricao: 'Pela confiança dos teus cartões, por cadeira. Um guia, não uma nota.', tamanhos: ['largo', 'pequeno'], novo: true },
  { id: 'janelas', nome: 'Janelas livres', icone: '🕒', descricao: 'O teu dia numa linha, com os furos entre aulas.', tamanhos: ['largo'], novo: true },
  { id: 'caixa', nome: 'Caixa de entrada', icone: '📥', descricao: 'Escreve e esquece; arrumas depois.', tamanhos: ['largo'], novo: true },
  { id: 'nesteDia', nome: 'Neste dia', icone: '📅', descricao: 'O que estavas a escrever há um mês.', tamanhos: ['pequeno'], novo: true },
  { id: 'leituras', nome: 'A ler', icone: '📖', descricao: 'O manual em que vais e a página.', tamanhos: ['pequeno'] },
  { id: 'ferramentas', nome: 'Ferramentas', icone: '🧰', descricao: 'As tuas ferramentas como ícones de app.', tamanhos: ['largo'], deModulo: 'ferramentas' },
  { id: 'bemEstar', nome: 'Como estás hoje', icone: '🌿', descricao: 'Uma pergunta curta de manhã e à noite. O Vini vê as respostas.', tamanhos: ['largo'], deModulo: 'bemEstar' },
  { id: 'missoes', nome: 'Missões do dia', icone: '🎯', descricao: '25 minutos, 10 cartões, 1 sumário.', tamanhos: ['largo'], deModulo: 'missoesDoDia' },
  { id: 'horasPorRegistar', nome: 'Horas por registar', icone: '⏱️', descricao: 'Ao fim do dia, se não estudaste, pergunta uma vez.', tamanhos: ['largo'], deModulo: 'horasPorRegistar' },
  { id: 'balancoDomingo', nome: 'Balanço de domingo', icone: '🗓️', descricao: 'Ao domingo: horas, cartões e uma pergunta para a semana.', tamanhos: ['largo'], deModulo: 'balancoDomingo' },
];

// como a página se arruma: grelha de dois, o primeiro em destaque, ou tudo numa coluna
export const ESTRUTURAS = [
  { id: 'grelha', nome: 'Grelha' },
  { id: 'destaque', nome: 'Destaque' },
  { id: 'lista', nome: 'Lista' },
];

// o ecrã de uma conta que nunca o editou
export const ECRA_INICIAL = {
  estrutura: 'grelha',
  widgets: [
    { id: 'aula', tamanho: 'largo' },
    { id: 'frequencias', tamanho: 'pequeno' },
    { id: 'tempo', tamanho: 'pequeno' },
    { id: 'aquecimento', tamanho: 'largo' },
    { id: 'carteira', tamanho: 'largo' },
    { id: 'tarefas', tamanho: 'largo' },
    { id: 'oQueJaFiz', tamanho: 'pequeno' },
    { id: 'flashcards', tamanho: 'pequeno' },
    { id: 'ferramentas', tamanho: 'largo' },
  ],
};

// ícone de cada ferramenta no widget "ferramentas" (os ids vêm de data/modulos.js)
export const ICONES_FERRAMENTAS = {
  ferrFlashcards: '🗂️', ferrEstudo: '⏱️', ferrLeituras: '📚', ferrPerguntas: '🙋', ferrChecklists: '☑️', ferrPares: '🧩',
  ferrFrequencia: '🎯', ferrPrazos: '📆', ferrPlanoEstudo: '🗺️', ferrCasos: '⚖️', ferrModoExame: '📝', ferrTopicosCorrecao: '🔍',
  ferrJurisprudencia: '🏛️', ferrArtigos: '📜', ferrGlossario: '🔤', ferrErros: '🩹', ferrPesquisa: '🔎', ferrMapasMentais: '🕸️',
  ferrPortfolio: '💼', ferrEstagio: '👩‍⚖️', ferrContactos: '📇', ferrRespirar: '🫧',
};
