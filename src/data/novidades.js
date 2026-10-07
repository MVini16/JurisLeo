// o que há de novo em cada versão da app, da mais recente para a mais antiga.
// REGRA: sempre que um deploy acrescentar funcionalidades, acrescenta uma entrada nova NO TOPO desta lista antes do `npm run build`.
// a `versao` da primeira entrada é a versão da app: quando muda, quem tiver a versão antiga vê o aviso "há uma versão nova"
// (o build escreve-a em /versao.json). deploys só de correções, sem novidades, não mexem aqui e não fazem aparecer o aviso.
export const NOVIDADES = [
  {
    versao: '2026-10-08',
    titulo: 'Partilhar com o Vini, se quiseres',
    itens: [
      'Nas Definições, em "Os meus dados", há agora "Partilhar com o Vini". Está tudo desligado. Escolhes tu o que o Vini pode ver (o teu estudo, os teus jogos, as tuas tarefas, como estás) e só se carregares em enviar. Podes ver o texto antes de sair.',
      'Endereços que não existem já não deixam o ecrã em branco: voltam ao início.',
    ],
  },
  {
    versao: '2026-10-07',
    titulo: 'Jogos, story e um boneco muito teu',
    itens: [
      'Jogos de estudo: Verdadeiro ou Falso, Quem Quer Ser Jurista, Caso Prático e Liga os Pares, com níveis, selos para colecionar e uma audiência do dia.',
      'Revisão de flashcards ao estilo de um story, com combos, "mais cinco cartões" e a tua série de dias.',
      'O boneco do Vini passou a falar contigo diretamente, com mais de 500 frases novas. Perto de uma frequência, também te anima, e depois de experimentares as novidades pergunta-te como estás hoje.',
      'Nas notas: procurar dentro da nota, índice automático e criar um flashcard só com o texto que selecionas.',
      'Novo cartão "Hoje" no início, com os teus stories por cadeira.',
      'Animações novas em toda a app, que podes escolher ou desligar nas Definições.',
    ],
  },
];

export const VERSAO_ATUAL = NOVIDADES[0].versao;
