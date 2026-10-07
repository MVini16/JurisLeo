// o boneco do vini: tudo o que ele diz e como se parece. é aqui que o vini edita, corta e acrescenta
// frases — cada lista pode crescer à vontade (o boneco nunca repete a última que disse).
// duas vozes: "carinhosa" (quente) e "brincalhona" (tribunais, despachos e humor); a conversa mistura as duas

// como o boneco "Vini de toga" se parece (escolhido pelo vini). muda aqui, é só ficheiro:
// estiloCabelo: 'curto' | 'cacheado' | 'rapado'; oculos: false | 'redondos' | 'quadrados'; barba: false | 'curta' | 'cheia'
export const APARENCIA_DO_VINI = {
  pele: '#7A4A2E',
  cabelo: '#241810',
  estiloCabelo: 'cacheado',
  oculos: 'quadrados',
  barba: false,
  toga: '#1E1A1C',
};

export const ASPETOS = [
  { id: 'A', nome: 'Vini de toga' },
  { id: 'B', nome: 'Balança simpática' },
  { id: 'C', nome: 'Balão com um V' },
];

// como ela está
export const ESTADOS = [
  { id: 'cansada', rotulo: 'Cansada' },
  { id: 'triste', rotulo: 'Triste' },
  { id: 'aborrecida', rotulo: 'Aborrecida' },
  { id: 'stressada', rotulo: 'Stressada' },
  { id: 'motivada', rotulo: 'Motivada' },
  { id: 'mal', rotulo: 'Estou mesmo mal' },
];

// o que o boneco oferece depois de responder (ver ACOES)
export const ACOES = {
  pausa5: 'Pausa de 5 minutos',
  tarefasHoje: 'Ver as tarefas',
  tresFlashcards: 'Fazer flashcards',
  urgentes: 'Só as 3 coisas mais urgentes',
  piada: 'Uma piada',
  barney: 'Legen... dary',
  estudar25: 'Estudar 25 minutos',
  elogio: 'Uma coisa boa que ele escreveu',
  viniSerio: 'Falar com o Vini a sério',
  linhasApoio: 'Ver linhas de apoio',
};

// quanto do tempo a voz brincalhona entra (0 a 1). nos estados tristes, quase só a carinhosa
export const PESO_DA_VOZ_BRINCALHONA = { cansada: 0.5, aborrecida: 0.5, stressada: 0.5, motivada: 0.5, triste: 0.25, mal: 0 };

export const ABERTURAS = [
  'Alô, Necas. Sou o boneco do Vini, o Vini a sério anda por aí. Falo com as frases que ele me deixou para ti. Como é que andas, minha princesa?',
  'Alô Necas, como é que andas, minha princesa?',
  'Olá outra vez, Necas. Como estás agora?',
  'Estou aqui. Diz-me como te sentes, meu bem.',
];

export const RESPOSTAS = {
  cansada: {
    acoes: ['pausa5', 'tarefasHoje'],
    carinhosa: [
      'Hoje já fizeste bastante, mesmo que não pareça. Descansar também faz parte de estudar.',
      'O cansaço é só o corpo a dizer que trabalhaste a sério. Cinco minutos de pausa não te tiram nada.',
      'O Vini diz que és das pessoas que mais se esforçam que ele conhece. Deixa o corpo respirar um bocadinho.',
      'Fecha os olhos meio minuto e solta os ombros. A matéria não foge.',
      'Beber água e esticar as costas conta como estudar. Pelo menos nesta app.',
      'Beijinho na testa, meu bem. Descansa um bocadinho, que o resto espera.',
    ],
    brincalhona: [
      'Despacho: a requerente está cansada e fica autorizada a uma pausa de cinco minutos. Cumpra-se.',
      'Objeção, Meritíssima! Continuar assim cansada é prejudicial à causa. Sustenta-se a objeção. Pausa.',
      'Acórdão: a arguida é condenada a esticar as pernas e a beber um copo de água. Sem direito a recurso.',
      'O Tribunal decreta o recesso. Volta quando os olhos já não estiverem a pedir clemência.',
      'Queixa apresentada pelo teu pescoço contra a tua postura. Procedente. Levanta-te.',
      'Necas, até o Tribunal sabe que precisas de descansar. Cinco minutos, e eu fico aqui a fazer-te companhia.',
      'Despacho: a requerente é condenada a um beijinho na testa e a uma pausa de cinco minutos. Sem direito a recurso.',
      'Cansada, princesa? O Vini autoriza a pausa e fica a vigiar a porta.',
    ],
  },
  triste: {
    acoes: ['viniSerio', 'elogio', 'piada'],
    carinhosa: [
      'Lamento que o dia esteja pesado. Não tens de estar bem, nem de fazer nada agora.',
      'Obrigado por me dizeres. Os dias maus passam, e não passas por eles sozinha.',
      'O Vini pediu-me para te lembrar que gosta de ti nos dias bons e nos dias maus. Se te apetecer, fala com ele.',
      'Se hoje não apetece estudar, está tudo bem. Ser gentil contigo também conta.',
      'Vem cá, princesa. Hoje fica tudo em pausa, só tu e um beijinho na testa.',
      'O Vini está contigo, Necas, mesmo quando não está ao lado.',
    ],
    brincalhona: [
      'O Tribunal está de luto pelo teu dia. Sem objeções, sem despachos, só companhia.',
      'Hoje não há prazos nem recursos. Há só uma bebida quentinha e eu aqui contigo.',
    ],
  },
  aborrecida: {
    acoes: ['tresFlashcards', 'piada', 'barney'],
    carinhosa: [
      'Vamos animar isto. Que tal três flashcards rápidos, só para mexer a cabeça?',
      'O aborrecimento é só energia sem destino. Dá-lhe um: três flashcards ou uma piada.',
      'Quando nada apetece, começar por cinco minutos costuma resolver o resto.',
    ],
    brincalhona: [
      'Há um caso prático a pedir atenção e três flashcards a olhar para ti com ar de súplica. Escolhe o teu veneno.',
      'Aborrecimento é crime sem vítima. Mas a sebenta ainda te quer ouvir.',
      'Escolha rápida: flashcards, piada ou Barney. O Tribunal aguarda.',
      'Aborrecida, Necas? Três flashcards e o dia melhora. E talvez haja um beijinho no fim...',
      'Eu sei que isto não é o mais emocionante, princesa, mas tu fazes tudo parecer fácil. Começa por um.',
    ],
  },
  stressada: {
    acoes: ['urgentes', 'pausa5'],
    carinhosa: [
      'Respira. Não precisas de fazer tudo hoje, só a próxima coisa. Vamos ver só o que é mesmo para já.',
      'Uma lista grande não é uma lista impossível. Uma coisa de cada vez, a começar pela mais curta.',
      'O Vini acredita que consegues. Mas primeiro, ombros para baixo e uma respiração funda.',
      'Respira, princesa. Uma coisa de cada vez, e depois o Vini diz-te o quão orgulhoso está.',
    ],
    brincalhona: [
      'Calma, Meritíssima: ninguém foi condenado por ter uma lista grande. Vamos só ao prazo mais curto.',
      'Despacho: fica suspensa a angústia até ao fim da próxima tarefa. Cumpra-se.',
      'Princípio da economia processual: faz só o que tem o prazo mais curto e deixa o resto para depois.',
      'Necas, ninguém aguenta tudo de uma vez, nem tu. Faz a primeira e vem buscar o teu miminho.',
    ],
  },
  motivada: {
    acoes: ['estudar25', 'elogio'],
    carinhosa: [
      'Adoro ver-te assim. Aproveita a maré: vinte e cinco minutos sem telemóvel e depois uma pausa.',
      'Boa! Quem começa com vontade acaba com menos esforço. Escolhe uma coisa e vai.',
      'Continua o bom trabalho, bebé. O Vini vê-te a brilhar mesmo à distância.',
    ],
    brincalhona: [
      'Acórdão: a arguida está inspirada e fica condenada a estudar vinte e cinco minutos seguidos.',
      'Os autos registam um entusiasmo raro. O Tribunal manda aproveitar enquanto dura.',
      'Trabalha def, e talvez ganhes um beijinho...',
      'Essa energia, Necas! Vinte e cinco minutos a sério e depois ganhas um miminho.',
    ],
  },
  mal: {
    acoes: ['viniSerio', 'linhasApoio'],
    // aqui não há voz brincalhona: o assunto é sério
    carinhosa: [
      'Obrigado por me dizeres. Não tens de passar por isto sozinha. Fala já com o Vini a sério, ou com alguém de confiança.',
    ],
    brincalhona: [],
    cuidado: 'Se estiveres em sofrimento a sério, ou a pensar em magoar-te, procura ajuda profissional agora. Há linhas de apoio gratuitas e pessoas a quem podes ligar. Em perigo imediato, liga 112.',
  },
};

// quando é ele a puxar conversa
export const PROATIVAS = {
  noite: {
    carinhosa: ['Já é tarde, Necas. O Vini diz que descansar também é estudar. Queres falar um bocadinho?', 'Já passa da hora de descansar. Beijinho na testa e cama, meu bem. Como estás?'],
    brincalhona: ['Tribunal em recesso. O Vini pede que a requerente se digne a descansar. Conversamos?', 'Despacho noturno: a arguida é convidada a largar o ecrã e a sonhar com o Vini. Falamos primeiro?'],
  },
  manha: {
    carinhosa: ['Bom dia, Necas. Como acordou a minha princesa?', 'Olá! Antes de começares o dia, como estás?'],
    brincalhona: ['Bom dia, Meritíssima. A sessão vai abrir e o Vini manda um beijinho. Como estás?', 'O Tribunal pergunta: hoje estamos para quê?'],
  },
  tarde: {
    carinhosa: ['Alô Necas, como é que andas, minha princesa?', 'Como vai o dia?'],
    brincalhona: ['Audiência a meio do dia: como corre a causa? E já sorriste hoje?', 'O Tribunal pede um ponto de situação. Tudo bem por aí?'],
  },
};

// "uma coisa boa que ele escreveu". o vini escreve as dele aqui
export const ELOGIOS = [
  'O Vini acha que és das pessoas mais determinadas que conhece.',
  'O Vini diz que quando te põem um problema à frente, tu resolves. Sempre foi assim.',
  'O Vini escreveu isto: tens uma cabeça que consegue aprender tudo o que quiser. Só precisas de tempo.',
  'O Vini tem orgulho em ti, e não é só quando tiras boas notas.',
  'O Vini diz que o teu esforço de hoje é o que vai fazer a diferença quando for a sério.',
  'O Vini escreveu: és boa a estudar e és ainda melhor a ser tu.',
  'O Vini lembra-te que já superaste dias piores do que este.',
  'O Vini acha que vais ser uma jurista excelente, e que as pessoas vão ter sorte em ter-te.',
  'Continua o bom trabalho, bebé.',
  'Beijinho na testa, meu bem. Estás a fazer um trabalhão.',
  'Trabalha def, e talvez ganhes um beijinho...',
  'O Vini diz que és a princesa dele e a melhor estudante que conhece.',
];

// piadas simples de juristas. o vini troca por as que fizerem rir a leonor
export const PIADAS = [
  'Porque é que o jurista levou uma escada para o tribunal? Porque ouviu dizer que ia haver um recurso.',
  'O que é um jurista a dormir? Um processo suspenso.',
  'Porque é que o advogado levou o telemóvel para a audiência? Para ter sempre uma boa prova de vida.',
  'Qual é a refeição preferida dos juristas? A entrada, que é onde se faz o requerimento.',
  'Porque é que o código civil tem tantos artigos? Porque nunca ninguém lhe disse que menos era mais.',
  'O que disse o estudante de Direito ao café? "Sem ti, não há prazo que se cumpra."',
];

// linhas de apoio. SÓ números confirmados em fontes oficiais; nunca acrescentar de memória.
// confirmado: SNS 24 (sns24.gov.pt) e 112. SOS Voz Amiga: o fixo é consistente nas fontes; o horário
// não foi confirmado, por isso fica por dizer (ver sosvozamiga.org)
export const LINHAS_DE_APOIO = [
  { id: 'sns24', nome: 'SNS 24, aconselhamento psicológico', numero: '808 24 24 24', nota: 'Marca 4. Todos os dias, a qualquer hora, com psicólogos.' },
  { id: 'voz-amiga', nome: 'SOS Voz Amiga', numero: '213 544 545', nota: 'Apoio emocional por voluntários. Horário em sosvozamiga.org.' },
  { id: '112', nome: 'Emergência', numero: '112', nota: 'Se estás em perigo imediato.' },
];
