// o guia completo da app: tudo o que a leonor pode fazer, por zonas. cada função diz o que faz e onde está.
// quando acrescentares uma função à app, acrescenta-a aqui também (e na entrada de novidades)

export const GUIA = [
  {
    zona: 'O teu dia',
    rota: '/dashboard',
    funcoes: [
      { nome: 'Dashboard', texto: 'É a página de entrada: mostra a aula de agora ou a seguinte, a contagem para a próxima frequência, as tarefas pendentes e o bloco "Hoje" com a tua série de estudo.' },
      { nome: 'Aulas de hoje', texto: 'No Dashboard, cada aula do dia tem os botões Fui e Faltei. "Mais" abre o calendário para escolheres outras opções, como o professor ter faltado.' },
      { nome: 'Horário', texto: 'A semana toda numa grelha, com a cor de cada cadeira. A aula que está a acontecer agora fica realçada.' },
      { nome: 'Tarefas', texto: 'Cria tarefas com prazo e cadeira, marca-as como feitas e filtra por cadeira. As atrasadas ficam destacadas.' },
    ],
  },
  {
    zona: 'Calendário e presenças',
    rota: '/calendario',
    funcoes: [
      { nome: 'Quatro vistas', texto: 'Dia, Semana, Mês e Lista. O botão + cria eventos (frequências, orais, entregas) e tocar num evento deixa-te ver, editar ou apagar.' },
      { nome: 'Práticas e teóricas', texto: 'As aulas práticas aparecem cheias e realçadas, porque são as que contam para as faltas. As teóricas têm o contorno tracejado. A aula que está a decorrer pisca com um contorno dourado.' },
      { nome: 'Marcar a presença', texto: 'Abre uma aula e diz como correu: Fui, Faltei, Faltei com justificação (escolhes o motivo e se já entregaste o comprovativo), O professor faltou, Não houve aula, ou o atalho Estive doente. As aulas em que o professor faltou ou não houve aula não contam como falta nem como aula dada.' },
      { nome: 'Sumário e notas da aula', texto: 'Na mesma aula escreves o sumário em tópicos (o que se deu), uma nota, o trabalho para casa e uma dúvida para o docente. Fica tudo guardado na tua conta.' },
      { nome: 'Lembrete de aulas por marcar', texto: 'No topo do Calendário aparece quantas aulas práticas já passadas ainda não marcaste. "Fui a todas" marca-as de uma vez, com confirmação, e corriges depois as exceções.' },
    ],
  },
  {
    zona: 'Cadeiras e faltas',
    rota: '/cadeiras',
    funcoes: [
      { nome: 'Cadeiras', texto: 'As cinco cadeiras do semestre, com o estado de avaliação (aprovada, vai a escrito, vai a oral, excluída...) e o semáforo de faltas calculados sozinhos segundo o regulamento da faculdade.' },
      { nome: 'Notas e avaliação', texto: 'Dentro de cada cadeira lanças a prova escrita, os outros elementos e os exames. A app diz o que significa e qual é o passo seguinte.' },
      { nome: 'Faltas', texto: 'Uma página só para as faltas: o estado de cada cadeira, quantas faltas ainda podes dar, um simulador "e se faltasse a mais N aulas", os comprovativos por entregar e o histórico aula a aula. Está em Cadeiras, em Recursos.' },
      { nome: 'Soma automática', texto: 'As faltas de cada cadeira somam sozinhas o que marcaste no calendário ao "ajuste manual" que já tinhas escrito.' },
    ],
  },
  {
    zona: 'Cadernos e notas',
    rota: '/anotacoes',
    funcoes: [
      { nome: 'Estante de cadernos', texto: 'Um caderno por cadeira, mais o Caderno Livre. Cada caderno tem secções (teóricas, práticas, perguntas para frequência, resumos, dúvidas) e podes criar as tuas.' },
      { nome: 'Editor das páginas', texto: 'Escreves com texto formatado, marcas como favorita ou rascunho, pões tags, procuras dentro da página e vês o índice automático.' },
      { nome: 'Modelos de página', texto: 'Começa uma nota já estruturada: resumo de aula, caso prático, ficha de acórdão, Notas Cornell, revisão para a frequência, comparação de conceitos.' },
      { nome: 'Desenhar à mão', texto: 'No separador Desenhar riscas por cima do texto, com o dedo ou a Apple Pencil. "Só Apple Pencil" deixa o dedo para fazer scroll.' },
      { nome: 'Flashcard a partir da seleção', texto: 'Seleciona texto numa nota e cria logo um flashcard com ele.' },
      { nome: 'Exportar e imprimir', texto: 'Levas uma página, uma secção ou o caderno inteiro para partilhar, PDF ou Word. A impressão sai limpa, sem botões.' },
    ],
  },
  {
    zona: 'Estudar',
    rota: '/flashcards',
    funcoes: [
      { nome: 'Flashcards', texto: 'Cria cartões e revê-os com repetição espaçada: o que acertas volta mais tarde, o que erras volta mais cedo. Há vários aspetos de revisão (story, feed, pilha e processo), que escolhes nas Definições.' },
      { nome: 'Estudo', texto: 'Uma página para estudar por cadeira, com cronómetro de sessões.' },
      { nome: 'Casos práticos', texto: 'Resolves casos com a estrutura de sempre (factos, questão, enquadramento, subsunção, conclusão) e juntas as dúvidas de todos os casos num só sítio.' },
      { nome: 'Glossário, Artigos e Leituras', texto: 'O teu glossário de termos jurídicos (com "dominado"), os artigos de lei que queres ter à mão e as leituras de cada cadeira.' },
      { nome: 'Pesquisa', texto: 'Procura em tudo de uma vez: notas, casos, glossário, artigos, leituras e flashcards.' },
      { nome: 'Jogos', texto: 'Verdadeiro ou Falso, Quem Quer Ser Jurista, Caso Prático e Liga os Pares, com níveis, XP, selos para colecionar e uma audiência do dia. Cada pergunta traz a fonte, para confirmares no código ou no manual.' },
    ],
  },
  {
    zona: 'Modo Feed',
    rota: '/feed',
    funcoes: [
      { nome: 'O que é', texto: 'Uma forma diferente de usar a app: um feed vertical em ecrã inteiro, em que deslizas para cima e cada carta é uma coisa para estudar ou fazer. Tu decides se o usas.' },
      { nome: 'Alternar', texto: 'O botão "Modo Feed" está no Dashboard, na barra lateral do computador e em "Mais" no telemóvel. Para voltar, carrega em "App normal". A app normal fica sempre como estava.' },
      { nome: 'As cartas', texto: 'Flashcards (toca para virar e diz se sabias), verdadeiro ou falso, escolha múltipla, termos do glossário, aulas por marcar e avisos de faltas, frequência e tarefas a vencer. O que está em atraso aparece com mais peso.' },
      { nome: 'Guardar e abrir', texto: 'Guarda uma carta no coração (ou com duplo toque) e usa "Abrir" para ir à página de onde ela veio.' },
      { nome: 'Meta do dia', texto: 'O anel no topo conta as cartas de hoje. Quando chegas à meta aparece "Já chegaste": podes pedir mais cinco cartas, ver o teu dia ou ficar por aqui.' },
    ],
  },
  {
    zona: 'Eu e as definições',
    rota: '/perfil',
    funcoes: [
      { nome: 'Aparência', texto: 'Tema claro, escuro ou do aparelho, e a folha com que as notas novas começam.' },
      { nome: 'Brincadeiras', texto: 'Ligas ou desligas o Barney, as mensagens do Vini e o boneco do Vini (aspeto, sítio, quando puxa conversa).' },
      { nome: 'Os meus dados', texto: 'Cópia de segurança e restauro, avisos de versão nova e "Partilhar com o Vini": está tudo desligado e só mandas o que escolheres, quando quiseres.' },
      { nome: 'Nada se perde', texto: 'As tuas notas, presenças, faltas, flashcards e tarefas ficam na tua conta. As tuas escolhas e o teu progresso (série, recordes, selos, cartas guardadas) são copiados sozinhos para lá, por isso mudam contigo para uma versão nova ou um telemóvel novo.' },
      { nome: 'Ajuda', texto: 'Esta página, e o botão "?" em cada ecrã, que explica o que podes fazer ali.' },
    ],
  },
];
