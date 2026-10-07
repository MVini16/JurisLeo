// mensagens do vini que aparecem enquanto a leonor escreve notas e casos.
// são brincadeiras carinhosas com cheiro a tribunal — edita, apaga e acrescenta à vontade.
// cada uma tem: tipo (cabeçalho do despacho), texto e selo (o carimbo que cai no formato "despacho").
// nos formatos "balão" e "post-it" só o texto é usado.
export const PROVOCACOES = [
  { tipo: 'Despacho', texto: 'Verifica-se que a requerente escreve há muito tempo e ainda não bebeu água. Notifica-se para o fazer de imediato.', selo: 'Notificada' },
  { tipo: 'Despacho', texto: 'Indefere-se o pedido de mais cinco minutos de telemóvel. Cumpra-se.', selo: 'Indeferido' },
  { tipo: 'Despacho', texto: 'Admite-se a pausa para café. Fica a requerente dispensada de apresentar justificação.', selo: 'Deferido' },
  { tipo: 'Despacho', texto: 'A cor do marcador foi apreciada e considerada excessiva. Sob reserva de apreciação superior.', selo: 'Em apreciação' },
  { tipo: 'Despacho', texto: 'Ordena-se que a página seja relida uma última vez antes de passar à seguinte.', selo: 'Cumpra-se' },
  { tipo: 'Despacho', texto: 'Considerando que são horas de esticar as costas, determina-se uma pausa de dois minutos.', selo: 'Deferido' },
  { tipo: 'Despacho', texto: 'Junte-se aos autos um sorriso. O processo estava demasiado sério.', selo: 'Junte-se' },
  { tipo: 'Despacho', texto: 'Dispensa-se a produção de prova: o Vini acredita em ti.', selo: 'Dispensada' },
  { tipo: 'Despacho', texto: 'O Tribunal toma conhecimento de que esta nota já vai na terceira versão. Aprecia-se o esforço.', selo: 'Registado' },
  { tipo: 'Despacho', texto: 'Determina-se que a letra seja legível para a requerente do futuro, que vai ter de ler isto na véspera.', selo: 'Cumpra-se' },

  { tipo: 'Objeção', texto: 'Objeção, Meritíssima! Isso foi copiado palavra por palavra da sebenta. O Vini viu.', selo: 'Objeção' },
  { tipo: 'Objeção', texto: 'Protesto! Sublinhar a página inteira não é sublinhar, é pintar.', selo: 'Protesto' },
  { tipo: 'Objeção', texto: 'Objeção! A testemunha diz que já sabe esta matéria e continua a rever. Contradição evidente.', selo: 'Objeção' },
  { tipo: 'Objeção', texto: 'Protesto contra o excesso de setas nesta nota. Parece um mapa de metro.', selo: 'Protesto' },
  { tipo: 'Objeção', texto: 'Objeção! Prometeste estudar mais tarde e ninguém, neste Tribunal, acredita.', selo: 'Objeção' },

  { tipo: 'Acórdão', texto: 'Acordam os juízes em condenar a arguida a beber um copo de água e a esticar as pernas.', selo: 'Condenada' },
  { tipo: 'Acórdão', texto: 'Acordam os juízes em absolver a arguida da acusação de ter estudado demais. Fica ainda assim obrigada a descansar.', selo: 'Absolvida' },
  { tipo: 'Acórdão', texto: 'Acordam em julgar procedente a necessidade de um lanche. Sem custas.', selo: 'Procedente' },
  { tipo: 'Acórdão', texto: 'Acordam em reconhecer que esta nota está bem feita. Unanimidade, sem votos de vencido.', selo: 'Unanimidade' },
  { tipo: 'Acórdão', texto: 'Acordam em negar provimento à ideia de decorar tudo na véspera.', selo: 'Negado' },

  { tipo: 'Recurso', texto: 'Interpõe-se recurso: vais mesmo sublinhar a página toda outra vez?', selo: 'Recurso' },
  { tipo: 'Recurso', texto: 'Recorre-se da decisão de continuar até às quatro da manhã. O recurso tem efeito suspensivo sobre o sono.', selo: 'Recurso' },
  { tipo: 'Recurso', texto: 'Recurso de revista: relê esse parágrafo, o Vini jura que tem uma gralha.', selo: 'Revista' },

  { tipo: 'Sentença', texto: 'Julga-se procedente o pedido de declarar a ré a melhor aluna do ano. Sem custas.', selo: 'Procedente' },
  { tipo: 'Sentença', texto: 'Condena-se a ré a ter sucesso na frequência. Da presente decisão não cabe recurso.', selo: 'Condenada' },
  { tipo: 'Sentença', texto: 'Julga-se improcedente a tese de que não consegues. Está provado o contrário.', selo: 'Improcedente' },
  { tipo: 'Sentença', texto: 'Declara-se que estás a fazer um excelente trabalho. A sentença transita em julgado.', selo: 'Transitada' },
  { tipo: 'Sentença', texto: 'Absolve-se a ré da culpa de não saber ainda tudo. Ninguém sabe.', selo: 'Absolvida' },

  { tipo: 'Notificação', texto: 'Fica a arguida notificada de que o Vini está orgulhoso dela. Da presente decisão não há recurso.', selo: 'Sem recurso' },
  { tipo: 'Notificação', texto: 'Fica notificada de que a hora do jantar já passou. O prazo para comer é perentório.', selo: 'Perentório' },
  { tipo: 'Notificação', texto: 'Notifica-se a requerente de que o Vini lhe deseja boa sorte, em nome pessoal e em nome do Tribunal.', selo: 'Notificada' },
  { tipo: 'Notificação', texto: 'Fica notificada para, no prazo de cinco minutos, levantar os olhos do ecrã e olhar pela janela.', selo: 'Notificada' },
  { tipo: 'Notificação', texto: 'Notifica-se a requerente de que há um dia a menos para a frequência e um dia a mais de experiência.', selo: 'Registado' },

  { tipo: 'Mensagem', texto: 'Já escreveste aí meio livro. Respira.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Estás a dar cabo da sebenta e eu estou a ver.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Isso já está ótimo. A sério. Larga o rato.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Se este texto fosse um processo, já estava arquivado por falta de objeto. Brinco. Continua.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Pausa. Água. Pescoço. Pela ordem que quiseres.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Prometo que não leio isto. Quer dizer, leio.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Tu sabes que a nota vai ser boa. Eu sei. A tua caneta sabe.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Estás tão concentrada que até o telemóvel já desistiu de te chamar.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Quanto mais escreves, menos tens de ler na véspera. Contas feitas.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Isso foi um parágrafo e meio de pura inteligência. Registado.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Atenção: a arguida mexeu no cabelo três vezes enquanto escrevia. Sinal de genialidade em curso.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Se tiveres dúvidas, escreve-as numa lista e leva-as para a aula. A lista não tem medo.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Fecha as catorze abas que tens abertas. Eu sei que tens.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Já fizeste mais hoje do que eu fiz na semana. Sem exageros.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'O Vini acha que a próxima linha vai ser a melhor. Sem provas, mas com convicção.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Se isto fosse um filme, agora tocava a música da montagem de treino.', selo: 'Do Vini' },
  { tipo: 'Mensagem', texto: 'Ordem do dia: estudar mais um bocadinho, depois jantar, depois descansar. Sem recurso.', selo: 'Do Vini' },

  { tipo: 'Despacho', texto: 'Declara-se aberta a instrução desta nota. Aguardam-se os factos.', selo: 'Aberta' },
  { tipo: 'Despacho', texto: 'Há prova suficiente de que estás cansada. Ordena-se descanso.', selo: 'Provado' },
  { tipo: 'Despacho', texto: 'Facto notório não carece de prova: tu vais passar.', selo: 'Notório' },
  { tipo: 'Despacho', texto: 'Em nome da economia processual, deixa essa nota para amanhã e vai dormir.', selo: 'Economia processual' },
  { tipo: 'Despacho', texto: 'Princípio do contraditório: se achas que sabes mais do que a sebenta, escreve a tua versão. O Vini quer ler.', selo: 'Contraditório' },
  { tipo: 'Despacho', texto: 'In dubio pro Leonor.', selo: 'Decidido' },
  { tipo: 'Despacho', texto: 'Aplica-se aqui o princípio da boa-fé: o Vini jura que não é ironia. Bem, talvez um pouco.', selo: 'Boa-fé' },
  { tipo: 'Despacho', texto: 'Revogam-se todas as disposições em contrário, incluindo a que dizia que ficavas só mais cinco minutos.', selo: 'Revogado' },
  { tipo: 'Despacho', texto: 'Entra em vigor, a partir de agora, um intervalo de dez minutos. Publique-se.', selo: 'Publique-se' },
  { tipo: 'Despacho', texto: 'Caducou o prazo para procrastinar. Pode agora estudar.', selo: 'Caducado' },
];

// os três formatos em que a mensagem pode aparecer — sai um à sorte de cada vez
export const FORMATOS_PROVOCACAO = ['balao', 'despacho', 'postit'];
