// o que há de novo em cada versão da app, da mais recente para a mais antiga.
// REGRA: sempre que um deploy acrescentar funcionalidades, acrescenta uma entrada nova NO TOPO desta lista antes do `npm run build`.
// a `versao` da primeira entrada é a versão da app: quando muda, quem tiver a versão antiga vê o aviso "há uma versão nova"
// (o build escreve-a em /versao.json). deploys só de correções, sem novidades, não mexem aqui e não fazem aparecer o aviso.
export const NOVIDADES = [
  {
    versao: '2026-10-10',
    titulo: 'Marca as tuas aulas no calendário',
    itens: [
      'Abre qualquer aula no Calendário e diz como correu: fui, faltei, faltei com justificação, o professor faltou ou não houve aula. Há também um atalho "Estive doente".',
      'Nas faltas justificadas escolhes o motivo da lista oficial da faculdade e podes dizer se já entregaste o comprovativo (têm de ser entregues até às 24h do dia útil seguinte).',
      'As faltas de cada cadeira passam a contar sozinhas a partir do que marcares. As aulas em que o professor faltou ou não houve aula não contam como falta nem como aula dada.',
      'No topo do Calendário aparece um lembrete quando tens aulas práticas já passadas por marcar.',
      'Corrigido: as cadeiras já não aparecem como "Excluída" quando ainda não há aulas dadas.',
    ],
  },
  {
    versao: '2026-10-09',
    titulo: 'Entras sem escrever o email',
    itens: [
      'Já não precisas de escrever o email e a password sempre que abres a app: ela lembra-se de ti e entra sozinha. Só voltas ao login se saíres da conta.',
      'Avisos de versão nova no telemóvel: nas Definições, em "Os meus dados", liga as notificações e toca em Permitir. No iPhone, abre a app pelo ícone do ecrã principal.',
      'O tutorial para ir buscar a versão nova tem agora passos separados para iPhone, Android e computador, mais detalhados.',
    ],
  },
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
