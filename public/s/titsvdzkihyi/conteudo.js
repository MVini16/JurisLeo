// tudo o que a página diz está aqui, para ser fácil trocar pelos textos e fotos.
// fotos: ficam na pasta fotos/ e escreve-se o caminho em `foto`.
window.CONTEUDO = {
  nome: 'Leonor',
  subtitulo: 'Para a minha Necas',
  apelidos: ['Necas', 'Nô', 'Def', 'bebé', 'princesa', 'meu bem', 'Leonor'],
  // o genérico de abertura, como num filme
  intro: ['Vini apresenta', 'Um filme que não cabia numa carta', 'Com a Leonor no papel principal'],
  // os cartões de capítulo
  capitulos: { nos: ['Capítulo I', 'Nós'], tu: ['Capítulo II', 'Tu'], frases: ['Capítulo III', 'As nossas frases'], jogo: ['Capítulo IV', 'Os jogos'], codigo: ['Capítulo V', 'O nosso código'], sitios: ['Capítulo VI', 'Os nossos sítios'], carta: ['Capítulo VII', 'A carta'] },
  // o prólogo: a carta que eu tentei escrever, antes do filme começar
  prologo: {
    antes: 'Antes de começarmos',
    saudacao: 'Leonor,',
    pedido: 'Sei que me pediste uma carta.',
    // tentativas que ficam riscadas, cada uma com um comentário meu na margem
    tentativas: [
      { texto: 'Querida Leonor, espero que esta carta te encontre bem.', nota: 'pareço o banco a escrever-te' },
      { texto: 'Desde o primeiro dia em que te vi...', nota: 'muito filme. mereces melhor' },
      { texto: 'Amo-te mais do que todas as estrelas do céu.', nota: 'nem sei quantas são. vou contar' },
    ],
    depois: ['Escrevi e apaguei isto umas vinte vezes.', 'Nenhuma versão chegava para ti.'],
    // a frase grande, no meio do ecrã, quando a folha levanta voo
    grande: ['Sei que me pediste uma carta,', 'mas acho que isto devia ser', 'algo mais especial.'],
    porque: ['Uma carta lê-se em cinco minutos.', 'E eu queria ficar contigo muito mais tempo do que isso.', 'Por isso fiz-te um filme.'],
  },
  // os créditos finais
  creditos: [
    ['Realizado por', 'Vini'],
    ['Protagonista', 'Leonor'],
    ['Também conhecida por', 'Necas, Nô, Def, bebé, princesa, meu bem'],
    ['Local das filmagens', 'Onde nós estivermos'],
    ['Banda sonora', 'O nosso riso'],
    ['Direção de arte', 'O teu sorriso'],
    ['Efeitos especiais', 'Nenhum, é tudo a sério'],
    ['Duração', 'Sempre e para sempre'],
    ['Nenhum coração foi magoado durante as filmagens', ''],
  ],
  fim: ['FIM', '(mas só deste capítulo)'],
  abertura: 'Põe os auscultadores, apaga a luz e fica com tempo. Isto é para ti e não tem pressa.',
  dificil: [
    'Necas, se estás a ler isto num dia mau,',
    'quero que saibas uma coisa antes de tudo o resto.',
    'Não tens de estar bem para mereceres carinho.',
    'Não tens de ser forte o tempo todo.',
    'Há dias em que chega ficar, respirar e deixar que eu pense em ti por ti.',
    'E eu penso. Muito.',
  ],
  tiras: [
    {
      etiqueta: 'Nós',
      momentos: [
        { foto: 'fotos/01.jpg', data: 'Málaga 2026', titulo: 'O desenho que quase se perdeu', texto: 'Perdeste o desenho e andaste o aeroporto inteiro, a chorar, desesperada, a tentar recuperá-lo. Felizmente correu bem: encontraste-o e voltámos felizes para Lisboa. Esta foto é o alívio de nós os dois.' },
        { foto: 'fotos/02.jpg', data: 'Algarve', titulo: 'A FOTO', texto: 'Aquela que toda a gente quer ter: formámos o casal perfeito.' },
        { foto: 'fotos/03.jpg', data: 'Algarve', titulo: 'Um beijo nas escadas da praia', texto: 'Umas escadas de madeira que davam para a praia. Praia, bola, sol e tu. Nem precisava de mais nada.' },
        { foto: 'fotos/05.jpg', data: '', titulo: 'Os dias em que o tempo pára', texto: 'Deitada ao sol, a olhar para mim assim. Esse sorriso é a minha casa.' },
        { foto: 'fotos/07.jpg', data: '', titulo: 'Def, olha para nós', texto: 'Tu a sorrir para a câmara e eu a olhar para o lado como se não fosse nada comigo. És tu quem me dá sorte, sabias?' },
        { foto: 'fotos/08.jpg', data: 'Belém', titulo: 'Nos meus braços em Belém', texto: 'Tu a deitar a língua de fora e eu a pensar que sou o homem mais sortudo do mundo.' },
        { foto: 'fotos/09.jpg', data: '', titulo: 'Tão perto que a foto tremeu', texto: 'Estavas tão perto que até a câmara perdeu o foco. Diz-me tu quem consegue ficar quieto contigo assim.' },
        { foto: 'fotos/11.jpg', data: 'Natal', titulo: 'A terceira vai ser de vez', texto: 'Nesse Natal perdemos o acender das luzes pela segunda vez, mas foi aí que percebi que te amava de verdade. E disse-te: a terceira vai ser de vez.' },
        { foto: 'fotos/12.jpg', data: '', titulo: 'O fim de semana perfeito', texto: 'Um fim de semana maravilhoso no hotel... Apenas inesquecível.' },
        { foto: 'fotos/13.jpg', data: '', titulo: 'Um espelho para nós dois', texto: 'Prefiro mil vezes o reflexo contigo bebé.' },
        { foto: 'fotos/14.jpg', data: '', titulo: 'Tu és o meu porto seguro', texto: 'Quando o dia pesa, é nos teus braços que o mundo volta a fazer sentido. Podes ficar aqui para sempre.' },
      ],
    },
    {
      etiqueta: 'Tu',
      momentos: [
        { foto: 'fotos/04.jpg', data: '', titulo: 'Baila minha princesa', texto: 'As parvoíces que tu fazes fazem-me sempre gostar mais de ti.' },
        { foto: 'fotos/06.jpg', data: '', titulo: 'Tu e a minha irmã', texto: 'Dois bebés a dormir. Uma das minhas fotos preferidas.' },
        { foto: 'fotos/10.jpg', data: '', titulo: 'És o meu presente diário', texto: 'Pois consegues fazer de mim uma pessoa melhor todos os dias.' },
        { foto: 'fotos/15.jpg', data: '', titulo: 'Que coisinha tão CUTEEE', texto: 'Consegues ser tão parvinha e tão fofa ao mesmo tempo, hahaha.' },
        { foto: 'fotos/16.jpg', data: '', titulo: 'Tu e o teu açaí', texto: 'Espero que um dia não me troques por ele... hehe, amo-te.' },
        { foto: 'fotos/17.jpg', data: '', titulo: 'O céu a ficar cor de laranja', texto: 'E tu a fazer caretas à frente dele. Não há pôr do sol mais bonito.' },
        { foto: 'fotos/18.jpg', data: '', titulo: 'Rosas para ti', texto: 'A preto e branco e mesmo assim tudo em ti tem cor.' },
      ],
    },
  ],
  // frases de filmes e séries que dizem o que eu sinto, com o que quer dizer para nós
  frasesTitulo: 'As nossas frases',
  // as palavras gigantes que andam por trás das frases
  marquee: ['ALWAYS AND FOREVER', 'SEMPRE E PARA SEMPRE', 'LEONOR \u2665 VINI'],
  frases: [
    { texto: 'Always and forever.', pt: 'Sempre e para sempre.', fonte: 'The Vampire Diaries', nosso: 'Tinha de entrar. Sempre e para sempre.' },
    { texto: "I'm not sorry that I'm in love with you.", pt: 'Não me arrependo de estar apaixonada por ti.', fonte: 'The Vampire Diaries, Elena', nosso: 'Eu também não. Nem um bocadinho.' },
    { texto: 'I would rather spend every moment in agony than erase the memory of you.', pt: 'Preferia passar cada momento em agonia a apagar a memória de ti.', fonte: 'The Vampire Diaries, Stefan', nosso: 'Prefiro mil vezes as tuas lembranças a qualquer outra coisa.' },
    { texto: "Kids, I'm going to tell you an incredible story.", pt: 'Meninos, vou contar-vos uma história incrível.', fonte: 'How I Met Your Mother', nosso: 'A nossa tem ainda muitos capítulos. E quero escrevê-los todos contigo.' },
    { texto: 'Legen... wait for it... dary!', pt: 'Lende... espera por ele... ário!', fonte: 'How I Met Your Mother, Barney', nosso: 'O melhor de nós ainda vem aí. Espera por ele.' },
    { texto: 'You know you love me. XOXO, Gossip Girl.', pt: 'Sabes que me adoras.', fonte: 'Gossip Girl', nosso: 'Eu sei. E tu sabes que eu também.' },
    { texto: "The next time you forget you're Blair Waldorf, remember I'm Chuck Bass. And I love you.", pt: 'Da próxima vez que te esqueceres de quem és, lembra-te de que eu sou o Chuck Bass. E que te amo.', fonte: 'Gossip Girl, Chuck', nosso: 'Quando duvidares de ti, lembra-te de que eu não me esqueço de quem tu és. Amo-te.' },
    { texto: 'Three words. Eight letters. Say it and I\'m yours.', pt: 'Três palavras. Oito letras. Diz e sou tua.', fonte: 'Gossip Girl, Blair', nosso: 'Eu digo-as as vezes que forem precisas: amo-te.' },
    { texto: "Carrie, you're the one.", pt: 'Carrie, tu és a escolhida.', fonte: 'Sex and the City, Big', nosso: 'E tu és a minha.' },
    { texto: "If you find someone to love the you you love, well... that's just fabulous.", pt: 'Se encontrares alguém que ame a ti que tu amas, bem... isso é simplesmente fabuloso.', fonte: 'Sex and the City, Carrie', nosso: 'Eu encontrei. E é mesmo fabuloso.' },
  ],
  // minijogo da memória com as nossas fotos: cada par que acertares revela uma frase
  jogo: {
    titulo: 'Encontra os nossos momentos',
    sub: 'Vira as cartas e junta os pares. Cada par que acertares guarda uma coisa que quero que saibas.',
    pares: [
      { foto: 'fotos/02.jpg', msg: 'A FOTO. Formámos mesmo o casal perfeito.' },
      { foto: 'fotos/03.jpg', msg: 'Escadas de madeira, praia e tu. Já chegava.' },
      { foto: 'fotos/08.jpg', msg: 'Nos meus braços em Belém é onde tu ficas bem.' },
      { foto: 'fotos/11.jpg', msg: 'A terceira vai ser de vez. E já foi.' },
      { foto: 'fotos/12.jpg', msg: 'Um fim de semana apenas inesquecível.' },
      { foto: 'fotos/14.jpg', msg: 'Tu és o meu porto seguro.' },
    ],
    vitoria: ['Encontraste todos os nossos momentos.', 'E o melhor ainda está por vir.'],
    final: 'Always and forever.',
  },
  // a promessa cumprida: a carta que ela pediu, no fim de tudo
  cartaIntro: ['Prometido é devido.', 'Pediste uma carta e eu não ia deixar de ta dar.', 'Só que vinha com um filme à volta.'],
  cartaTitulo: 'Para leres quando quiseres',
  carta: [
    'Leonor, Necas, Nô, bebé, princesa,',
    'Tenho tantos nomes para ti e nenhum chega. Cada um serve para um bocadinho de ti: a Leonor é a que luta e estuda até tarde, a Necas é a que me faz rir, a Nô é a minha e tu és a minha bebé e a minha princesa, mesmo quando te chateias com isso.',
    'Não sei bem por onde começar, por isso começo pelo mais simples: obrigado. Obrigado por existires na minha vida e por me deixares fazer parte da tua.',
    'Quando penso em nós, não penso só nos dias grandes, nas viagens e nos pores do sol. Penso nos pequenos. Nas mensagens sem motivo, nas conversas que se esticam sem darmos por isso, nos silêncios em que estamos bem sem ter de dizer nada. É aí que percebo o quanto significas para mim.',
    'Tens uma força que muitas vezes não vês. Vejo-te a levantar-te cedo, a estudar até tarde, a preocupares-te com cada frequência e a continuares mesmo quando estás cansada. Isso é coragem. E eu tenho um orgulho enorme em ti, mesmo nos dias em que tu não tens.',
    'Quero que saibas que não tens de ser perfeita para mim. Não preciso da Necas que tem tudo controlado, que sabe todas as respostas, que nunca falha. Gosto da Necas inteira: a que ri, a que se chateia, a que duvida, a que se esquece de comer porque estava a estudar, a que me olha de uma maneira que me desarma.',
    'Há dias que vão ser difíceis. Vão haver notas que não correm como querias, semanas pesadas e dias em que o mundo parece demasiado grande. Nesses dias, lembra-te de uma coisa: não estás sozinha. Mesmo quando não consigo resolver o que te custa, posso ficar contigo enquanto custa. E isso eu faço sempre.',
    'Também quero pedir-te desculpa pelas vezes em que não fui o melhor. Pelas vezes em que fui impaciente, em que não ouvi como devia, em que estava distraído. Estou a aprender e tu fazes-me querer aprender melhor.',
    'Quero-te ver a acabar este curso, a ser a advogada que sempre disseste que querias ser, a entrar numa sala e a deixá-la mais justa só por estares lá. E quero estar do teu lado quando isso acontecer, a aplaudir mais alto do que toda a gente.',
    'Quero as nossas manhãs lentas, os nossos jantares, as nossas viagens, as nossas discussões parvas que acabam em riso. Quero as fotos que já temos e as que ainda não tirámos. Quero envelhecer a descobrir coisas novas sobre ti.',
    'Se um dia duvidares do quanto és amada, volta a esta página. Lê devagar, as vezes que forem precisas. Está aqui sempre para ti.',
    'Eu escolho-te hoje e escolho-te amanhã. E no dia a seguir, outra vez.',
    'Amo-te, Nô. Mais do que consigo escrever.',
  ],
  // ---------- partes novas (mais.js) ----------
  // nível 5: balões com uma palavra cada; rebentados todos, formam a frase
  baloes: {
    titulo: 'Rebenta os balões',
    sub: 'Cada um guarda uma palavra. Rebenta-os todos.',
    palavras: ['És', 'a', 'minha', 'pessoa', 'preferida', 'Def'],
    feito: 'És a minha pessoa preferida, Def.',
  },
  // nível 6: puzzle de uma foto, peças a rodar
  puzzle: {
    titulo: 'Põe a foto direita',
    sub: 'Toca nas peças para as rodar até a foto ficar certa.',
    foto: 'fotos/02.jpg',
    feito: 'Encaixamos sempre. Mesmo quando começamos tortos.',
  },
  // capítulo vi: os nossos sítios (só sítios que já estão nas legendas das fotos)
  mapa: {
    titulo: 'O mapa dos nossos sítios',
    sub: 'Toca em cada ponto.',
    sitios: [
      { nome: 'Lisboa', x: 21, y: 46, foto: 'fotos/11.jpg', texto: 'A nossa casa. Onde a terceira vez das luzes de Natal vai ser de vez.' },
      { nome: 'Belém', x: 12, y: 57, foto: 'fotos/08.jpg', texto: 'Tu nos meus braços e eu a sentir-me o homem mais sortudo do mundo.' },
      { nome: 'Algarve', x: 26, y: 78, foto: 'fotos/03.jpg', texto: 'Escadas de madeira, praia, bola, sol e tu.' },
      { nome: 'Málaga', x: 62, y: 84, foto: 'fotos/01.jpg', texto: 'O desenho que quase se perdeu no aeroporto. E o alívio dos dois.' },
    ],
  },
  // roda dos próximos encontros
  roda: {
    titulo: 'A roda dos próximos encontros',
    sub: 'Gira a roda. O que sair, fazemos.',
    opcoes: ['Jantar onde tu escolheres', 'Piquenique em Belém', 'Pôr do sol num miradouro', 'Maratona de Gossip Girl', 'Açaí e passeio à beira-mar', 'Um dia sem telemóveis', 'Cozinhar juntos (eu lavo a loiça)', 'Ver as luzes de Natal (à terceira é de vez)'],
    botao: 'Girar',
    saiu: 'Saiu:',
    depois: 'Combinado? Eu já disse que sim.',
  },
  // frasco de bilhetinhos
  frasco: {
    titulo: 'O frasco dos bilhetinhos',
    sub: 'Toca no frasco. Sai sempre um bilhete diferente.',
    bilhetes: [
      'Hoje estás bonita. Ontem também. Amanhã vai ser igual.',
      'Lembrei-me de ti agora. E daqui a bocado vou lembrar-me outra vez.',
      'Bebe água e come qualquer coisa. Ordens do namorado.',
      'Se a frequência correr mal a culpa é do professor.',
      'Gosto da tua gargalhada mais do que de futebol. Quase.',
      'Estás a ler isto e eu já estou com saudades.',
      'Ninguém faz caretas tão bem como tu.',
      'Um abraço daqueles que duram mais do que devem.',
      'Tu consegues. Eu sei porque já te vi conseguir.',
      'Vale um beijo. Cobra quando quiseres.',
      'És a minha notificação preferida.',
      'Def. Só isso. Já sabes o resto.',
    ],
    vazio: 'Já leste todos. Volta amanhã que eu ponho mais.',
  },
  // a lanterna: um ecrã escuro onde o dedo é a luz
  lanterna: {
    titulo: 'Acende a luz',
    sub: 'Passa o dedo pelo escuro.',
    texto: 'Nos dias escuros é só procurares. Eu estou cá.',
  },
  // desenhar um coração por cima do tracejado
  desenhar: {
    titulo: 'Desenha um coração',
    sub: 'Segue o tracejado com o dedo.',
    feito: 'Desenhaste-o melhor do que eu. Como sempre.',
  },
  // o índice e os textos dos botões de ajuda
  ui: {
    menu: 'Capítulos',
    continuar: 'Continuar onde ficaste',
    dica: 'continua a deslizar',
    calmo: 'Modo calmo',
    calmoAjuda: 'Menos efeitos, para telemóveis mais lentos',
    ecra: 'Ecrã inteiro',
    guardarCarta: 'Guardar a carta',
    recomecar: 'Voltar ao início',
    anterior: 'Anterior',
    seguinte: 'Seguinte',
    orientacao: 'Vira o telemóvel ao alto. Fica mais bonito assim.',
    inclinar: 'Toca e inclina o telemóvel',
    inclinarFeito: 'Agora o céu segue-te',
    inclinarNao: 'Este telemóvel não deixou',
    inclinarMenu: 'Céu que se inclina',
  },
  // frases minhas, que não vêm de filme nenhum. cada uma entra com uma animação diferente
  minhasTitulo: ['Frases que não vêm de filme nenhum.', 'Vêm de mim.'],
  minhas: [
    { texto: 'Se fores advogada como discutes comigo, coitada da outra parte.', efeito: 'baralhar' },
    { texto: 'Não percebo nada de Direito. Mas de ti percebo e chega-me.', efeito: 'onda' },
    { texto: 'Passo o dia a corrigir bugs. Tu és a única coisa na minha vida que não quero corrigir.', efeito: 'maquina' },
    { texto: 'Podes ter dias maus. Não os podes é ter sozinha.', efeito: 'cair' },
    { texto: 'Gosto mais de ti do que tu gostas de açaí. E tu sabes o que isso quer dizer.', efeito: 'virar' },
    { texto: 'Um dia vais ser a Dra. Leonor. E eu vou continuar a chamar-te Necas.', efeito: 'foco' },
    { texto: 'A sorte é minha, Def.', efeito: 'grande' },
  ],
  // nível 2: perguntas sobre nós (só factos que já estão nas fotos e legendas)
  quiz: {
    titulo: 'Quanto sabes de nós?',
    sub: 'Cinco perguntas. Não vale perguntar a ninguém.',
    perguntas: [
      { p: 'Onde é que quase perdeste o desenho?', opcoes: ['No aeroporto de Málaga', 'Em Belém', 'Na praia, no Algarve'], certa: 0, sim: 'Isso. E eu nunca vi ninguém tão aliviado na vida.', nao: 'Foi em Málaga, no aeroporto. Tu a chorar e eu a correr atrás de ti.' },
      { p: 'Quantas vezes perdemos o acender das luzes de Natal?', opcoes: ['Uma', 'Duas', 'Nenhuma, somos super pontuais'], certa: 1, sim: 'Duas. A terceira vai ser de vez, prometido.', nao: 'Foram duas. Pontuais nós? Nunca.' },
      { p: 'O que é que tu nunca, mas nunca, recusas?', opcoes: ['Acordar cedo', 'Um açaí', 'Mais uma frequência'], certa: 1, sim: 'Óbvio. Às vezes acho que tenho concorrência.', nao: 'Tens a certeza? Eu apostava tudo no açaí.' },
      { p: 'Onde foi o beijo nas escadas de madeira?', opcoes: ['Em Lisboa', 'Em Málaga', 'No Algarve'], certa: 2, sim: 'Praia, bola, sol e tu. Lembras-te bem.', nao: 'No Algarve. Escadas de madeira, praia e nós.' },
      { p: 'Quem é a minha pessoa favorita?', opcoes: ['A Leonor', 'A Necas', 'A Nô'], certa: -1, sim: 'Era impossível errar esta. Fiz batota de propósito.', nao: '' },
    ],
    // {n} e {t} trocam-se pelo número de certas e de perguntas
    resultado: 'Acertaste {n} de {t}.',
    nota: 'Para mim tens 20 valores. Sempre.',
  },
  // nível 3: ligar as estrelas pela ordem, até aparecer o desenho
  constelacao: {
    titulo: 'Liga as estrelas',
    sub: 'Toca nelas pela ordem. Desenhei uma coisa no céu para ti.',
    errado: 'Essa ainda não. Procura a {n}.',
    feito: ['É uma balança.', 'Um dia vais ser tu a segurá-la. E eu vou estar na primeira fila a ver.'],
  },
  // nível 4: raspadinhas com vales verdadeiros
  vales: {
    titulo: 'Raspadinhas',
    sub: 'Raspa com o dedo. Todos os prémios são verdadeiros e não têm validade.',
    lista: [
      'Vale um jantar no sítio que tu escolheres. E eu não me queixo do preço.',
      'Vale uma maratona de Gossip Girl sem eu adormecer a meio.',
      'Vale um açaí. Sem perguntas e sem partilhar.',
      'Vale ganhar uma discussão. Só uma, usa com sabedoria.',
    ],
    tudo: 'Ganhaste tudo. Guarda isto, que eu vou cumprir.',
  },
  // capítulo V: o nosso código, com artigos a sério (a brincar)
  codigo: {
    titulo: 'Código da Leonor e do Vini',
    sub: 'Aprovado por unanimidade. Dos dois.',
    artigos: [
      { n: 'Artigo 1.º', epigrafe: 'Princípio geral', texto: 'A Leonor tem sempre razão.' },
      { n: 'Artigo 2.º', epigrafe: 'Exceções', texto: 'Quando a Leonor não tiver razão, aplica-se o artigo 1.º.' },
      { n: 'Artigo 3.º', epigrafe: 'Do açaí', texto: 'O açaí da Leonor não se partilha, salvo autorização expressa da própria, que até hoje nunca foi dada.' },
      { n: 'Artigo 4.º', epigrafe: 'Dever de abraço', texto: 'No fim de cada frequência é devido um abraço, independentemente da nota.' },
      { n: 'Artigo 5.º', epigrafe: 'Prescrição', texto: 'As saudades prescrevem no exato momento em que nos voltamos a ver.' },
      { n: 'Artigo 6.º', epigrafe: 'In dubio pro beijo', texto: 'Em caso de dúvida, decide-se sempre a favor do beijo.' },
      { n: 'Artigo 7.º', epigrafe: 'Vigência', texto: 'O presente código entra hoje em vigor e não admite revogação.' },
    ],
    assinar: 'Assina aqui com o dedo',
    botao: 'Assinar',
    limpar: 'Apagar',
    carimbo: 'Em vigor',
    feito: 'Contrato celebrado. Sem direito a arrependimento.',
    assinaturaVini: 'Vini',
  },
  // um abraço à distância: carregar e não largar
  abraco: {
    titulo: 'Abraço à distância',
    sub: 'Carrega no coração e não largues.',
    cedo: 'Largaste cedo demais. Os meus abraços são mais compridos.',
    feito: ['Isto foi um abraço à distância.', 'O verdadeiro fico a dever-te. Cobra quando quiseres.'],
  },
  // a promessa da margem do prólogo: contar as estrelas
  contagem: {
    antes: 'Lembras-te de eu ter dito que ia contar as estrelas?',
    depois: ['São as que voaram contigo até aqui.', 'Contei-as todas. E continuas a ganhar tu.'],
  },
  interludio: [
    'Tu fazes o mundo parecer mais pequeno,',
    'e a minha vida muito maior.',
  ],
  cartas: [
    { rotulo: 'Abre quando estiveres triste', texto: 'Respira. Isto passa, mesmo quando parece que não. Eu não sei resolver tudo, mas sei ficar do teu lado até passar. Liga-me, manda-me uma mensagem, ou só diz "estou mal". Não precisas de explicar nada.' },
    { rotulo: 'Abre quando estiveres cansada', texto: 'Já fizeste o suficiente por hoje. A sério. Descansar também é trabalho e tu mereces o descanso tanto quanto mereces o diploma. Amanhã continuamos.' },
    { rotulo: 'Abre quando não conseguires dormir', texto: 'Fecha os olhos e pensa num sítio onde estejas bem. Eu estou lá contigo. Respira devagar, quatro segundos a entrar, quatro a sair. Boa noite.' },
    { rotulo: 'Abre quando duvidares de ti', texto: 'Tu és muito mais capaz do que achas. Quem te vê de fora vê uma pessoa determinada, inteligente e com um coração enorme. Se tiveres de duvidar de alguma coisa, duvida das dúvidas, não de ti.' },
    { rotulo: 'Abre quando tiveres saudades', texto: 'Eu também tenho. Mais do que consigo dizer. Já estou a pensar no próximo dia em que estamos juntos.' },
    { rotulo: 'Abre quando quiseres sorrir', texto: 'Lembra-te daquela foto em que deitas a língua de fora. Já estás a sorrir? Então já ganhei o dia.' },
  ],
  razoes: [
    'Pela forma como te importas comigo.',
    'Pela tua teimosia, que também é a tua força.',
    'Por me ouvires mesmo quando eu falo demais.',
    'Por me fazeres querer ser melhor.',
    'Por seres a minha pessoa favorita.',
    'Por me deixares fazer parte da tua vida.',
  ],
  final: [
    'Obrigado por existires,',
    'por me escolheres',
    'e por me deixares amar-te.',
  ],
  assinatura: 'Com todo o meu amor, o teu Vini.',
  // música: põe um ficheiro nesta pasta e escreve o nome aqui. deixa vazio para não ter música
  musica: '',
};
