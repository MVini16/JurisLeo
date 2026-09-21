// registo dos módulos que a leonor pode ligar e desligar em perfil → "o teu ecrã"
// só entra aqui o que já existe na app; cada funcionalidade nova acrescenta a sua linha
// fixo: true = não se pode desligar (um erro aqui era ela não ver uma falta a chegar ao limite)
// defeito: como vem numa conta que nunca mexeu nas escolhas (por isso não há migração)

export const CATEGORIAS_MODULOS = [
  { id: 'inicio', nome: 'No ecrã de início' },
  { id: 'atalhos', nome: 'No botão +' },
];

export const MODULOS = [
  // cartões do dashboard, pela ordem em que aparecem por defeito
  { id: 'aulaAgora', categoria: 'inicio', nome: 'Aula de agora e a seguir', descricao: 'A aula que está a decorrer e a próxima, com sala e docente.', fixo: true },
  { id: 'proximaFrequencia', categoria: 'inicio', nome: 'Próxima frequência', descricao: 'Quantos dias faltam para a próxima frequência.', fixo: true },
  { id: 'aulasHoje', categoria: 'inicio', nome: 'Aulas de hoje', descricao: 'A lista das aulas do dia.', defeito: true },
  { id: 'tarefasPendentes', categoria: 'inicio', nome: 'Tarefas pendentes', descricao: 'As tarefas com prazo mais próximo.', defeito: true },
  { id: 'fraseDoDia', categoria: 'inicio', nome: 'Frase do dia', descricao: 'Uma frase por baixo do teu nome.', defeito: true },

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
export const ORDEM_CARTOES_DEFEITO = ['aulaAgora', 'proximaFrequencia', 'aulasHoje', 'tarefasPendentes'];
