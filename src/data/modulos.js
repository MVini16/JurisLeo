// registo dos módulos que a leonor pode ligar e desligar em perfil → "o teu ecrã"
// só entra aqui o que já existe na app; cada funcionalidade nova acrescenta a sua linha
// fixo: true = não se pode desligar (um erro aqui era ela não ver uma falta a chegar ao limite)
// defeito: como vem numa conta que nunca mexeu nas escolhas (por isso não há migração)

export const CATEGORIAS_MODULOS = [
  { id: 'inicio', nome: 'No ecrã de início' },
  { id: 'ferramentas', nome: 'Ferramentas' },
  { id: 'atalhos', nome: 'No botão +' },
];

// as ferramentas agrupam-se assim na página Ferramentas e nas Definições
export const GRUPOS_FERRAMENTAS = ['Estudar', 'Direito', 'Vida profissional', 'Bem-estar'];

export const MODULOS = [
  // cartões do dashboard, pela ordem em que aparecem por defeito
  { id: 'aulaAgora', categoria: 'inicio', nome: 'Aula de agora e a seguir', descricao: 'A aula que está a decorrer e a próxima, com sala e docente.', fixo: true },
  { id: 'bemEstar', categoria: 'inicio', nome: 'Como estás hoje', descricao: 'De manhã e à noite, uma pergunta curta. O Vini vê as respostas. Vem desligado: ligas tu, se quiseres.', defeito: false },
  { id: 'horasPorRegistar', categoria: 'inicio', nome: 'Ainda não registaste nada hoje', descricao: 'Ao fim do dia, se não houver nenhuma sessão de estudo, pergunta uma vez. Nunca obriga.', defeito: false },
  { id: 'missoesDoDia', categoria: 'inicio', nome: 'Missões do dia', descricao: '25 minutos, 10 cartões, 1 sumário — pequenas metas fixas.', defeito: false },
  { id: 'sequenciaADois', categoria: 'inicio', nome: 'Sequência a dois com o Vini', descricao: 'Ele vê só se já estudaste hoje, sem ranking nem pressão. Vem desligado: ligas tu, se quiseres.', defeito: false },
  { id: 'balancoDomingo', categoria: 'inicio', nome: 'Balanço de domingo', descricao: 'Ao domingo: horas, cartões, sumários e uma pergunta para a semana.', defeito: false },
  { id: 'proximaFrequencia', categoria: 'inicio', nome: 'Próxima frequência', descricao: 'Quantos dias faltam para a próxima frequência.', fixo: true },
  { id: 'aulasHoje', categoria: 'inicio', nome: 'Aulas de hoje', descricao: 'A lista das aulas do dia.', defeito: true },
  { id: 'tarefasPendentes', categoria: 'inicio', nome: 'Tarefas pendentes', descricao: 'As tarefas com prazo mais próximo.', defeito: true },
  { id: 'ferramentas', categoria: 'inicio', nome: 'As tuas ferramentas', descricao: 'Atalhos para as ferramentas que tens ligadas.', defeito: true },
  { id: 'fraseDoDia', categoria: 'inicio', nome: 'Frase do dia', descricao: 'Uma frase por baixo do teu nome.', defeito: true },

  // ferramentas: cada uma tem rota e grupo, e liga-se e desliga-se em Definições
  { id: 'ferrFlashcards', categoria: 'ferramentas', grupo: 'Estudar', rota: '/flashcards', nome: 'Flashcards', descricao: 'Cartões com repetição espaçada.', defeito: true },
  { id: 'ferrEstudo', categoria: 'ferramentas', grupo: 'Estudar', rota: '/estudo', nome: 'Cronómetro de estudo', descricao: 'Sessões por cadeira, com pausas.', defeito: true },
  { id: 'ferrLeituras', categoria: 'ferramentas', grupo: 'Estudar', rota: '/leituras', nome: 'Leituras', descricao: 'Manuais, capítulos e páginas.', defeito: true },
  { id: 'ferrPerguntas', categoria: 'ferramentas', grupo: 'Estudar', rota: '/fichas/perguntas', nome: 'Perguntas para o stor', descricao: 'As dúvidas que levas para a aula.', defeito: true },
  { id: 'ferrChecklists', categoria: 'ferramentas', grupo: 'Estudar', rota: '/fichas/checklists', nome: 'Checklists', descricao: 'Antes de entregar, antes de uma frequência.', defeito: true },
  { id: 'ferrPares', categoria: 'ferramentas', grupo: 'Estudar', rota: '/pares', nome: 'Jogo de pares', descricao: 'Liga a pergunta à resposta, contra o relógio.', defeito: true },
  { id: 'ferrFrequencia', categoria: 'ferramentas', grupo: 'Estudar', rota: '/frequencia', nome: 'Modo Frequência', descricao: 'Só a prova que vem aí e a matéria por rever.', defeito: true },
  { id: 'ferrPrazos', categoria: 'ferramentas', grupo: 'Estudar', rota: '/prazos', nome: 'Calculadora de prazos', descricao: 'Dias úteis e seguidos, com feriados.', defeito: true },
  { id: 'ferrPlanoEstudo', categoria: 'ferramentas', grupo: 'Estudar', rota: '/plano-estudo', nome: 'Plano de estudo', descricao: 'Uma cadeira por dia, a partir das tuas próximas provas.', defeito: true },
  { id: 'ferrCasos', categoria: 'ferramentas', grupo: 'Direito', rota: '/casos', nome: 'Casos práticos', descricao: 'Factos, questão, enquadramento e conclusão.', defeito: true },
  { id: 'ferrModoExame', categoria: 'ferramentas', grupo: 'Direito', rota: '/modo-exame', nome: 'Modo Exame', descricao: '90 minutos, um caso do arquivo, sem consultar nada.', defeito: true },
  { id: 'ferrTopicosCorrecao', categoria: 'ferramentas', grupo: 'Direito', rota: '/topicos-correcao', nome: 'Tópicos de Correção', descricao: 'Compara a tua resposta com a correção: o que reclamar e o que rever.', defeito: true },
  { id: 'ferrJurisprudencia', categoria: 'ferramentas', grupo: 'Direito', rota: '/fichas/jurisprudencia', nome: 'Fichas de jurisprudência', descricao: 'Acórdãos que valha a pena guardar.', defeito: true },
  { id: 'ferrArtigos', categoria: 'ferramentas', grupo: 'Direito', rota: '/artigos', nome: 'Biblioteca de artigos', descricao: 'Referências e notas tuas.', defeito: true },
  { id: 'ferrGlossario', categoria: 'ferramentas', grupo: 'Direito', rota: '/glossario', nome: 'Glossário', descricao: 'Termos e latim jurídico.', defeito: true },
  { id: 'ferrErros', categoria: 'ferramentas', grupo: 'Direito', rota: '/fichas/erros', nome: 'Diário dos meus erros', descricao: 'O que errei e porquê.', defeito: true },
  { id: 'ferrPesquisa', categoria: 'ferramentas', grupo: 'Direito', rota: '/pesquisa', nome: 'Pesquisa', descricao: 'Procura em tudo o que escreveste.', defeito: true },
  { id: 'ferrMapasMentais', categoria: 'ferramentas', grupo: 'Direito', rota: '/mapas-mentais', nome: 'Mapas Mentais', descricao: 'Caixas e setas por cadeira ou tema.', defeito: true },
  { id: 'ferrPortfolio', categoria: 'ferramentas', grupo: 'Vida profissional', rota: '/fichas/portfolio', nome: 'Portfólio', descricao: 'Os trabalhos de que te orgulhas.', defeito: true },
  { id: 'ferrEstagio', categoria: 'ferramentas', grupo: 'Vida profissional', rota: '/fichas/estagio', nome: 'Diário de estágio', descricao: 'Para quando estagiares.', defeito: true },
  { id: 'ferrContactos', categoria: 'ferramentas', grupo: 'Vida profissional', rota: '/fichas/contactos', nome: 'Contactos jurídicos', descricao: 'Com lembrete para voltares a falar.', defeito: true },

  { id: 'ferrRespirar', categoria: 'ferramentas', grupo: 'Bem-estar', rota: '/respirar', nome: 'Respirar', descricao: 'Respiração guiada, para abrandar.', defeito: true },

  // atalhos do menu +, com o rótulo exato que já lá está
  { id: 'atalhoTarefa', categoria: 'atalhos', nome: 'Nova Tarefa', descricao: 'Criar uma tarefa.', defeito: true },
  { id: 'atalhoAnotacao', categoria: 'atalhos', nome: 'Nova Anotação', descricao: 'Escrever uma anotação.', defeito: true },
  { id: 'atalhoCaso', categoria: 'atalhos', nome: 'Novo Caso', descricao: 'Começar um caso prático.', defeito: true },
  { id: 'atalhoFrequencia', categoria: 'atalhos', nome: 'Nova Frequência', descricao: 'Marcar uma frequência no calendário.', defeito: true },
  { id: 'atalhoOral', categoria: 'atalhos', nome: 'Oral de Melhoria', descricao: 'Preparar uma oral de melhoria.', defeito: true },
  { id: 'atalhoFalta', categoria: 'atalhos', nome: 'Registar Falta', descricao: 'Ir direta às faltas.', defeito: true },
  { id: 'atalhoNota', categoria: 'atalhos', nome: 'Lançar Nota', descricao: 'Lançar uma nota.', defeito: true },
  { id: 'atalhoEstudar', categoria: 'atalhos', nome: 'Estudar', descricao: 'Começar uma sessão de estudo.', defeito: true },
];

// ordem por defeito dos cartões do dashboard
export const ORDEM_CARTOES_DEFEITO = ['aulaAgora', 'bemEstar', 'missoesDoDia', 'horasPorRegistar', 'balancoDomingo', 'proximaFrequencia', 'aulasHoje', 'tarefasPendentes', 'ferramentas'];
