// tipos de ficha: cada um é só uma lista de campos, e a mesma página trata de todos
// nascem como módulos ligáveis (data/modulos.js) e vivem em users/{uid}/fichas, com o campo tipo
// campos: texto (uma linha) · longo (várias linhas) · data · cadeira · escolha (com opcoes)
// nada aqui traz texto da lei nem regras: são só os títulos dos campos e dicas para ela preencher

export const TIPOS_FICHA = [
  {
    id: 'jurisprudencia',
    nome: 'Fichas de jurisprudência',
    descricao: 'Acórdãos e decisões que valha a pena guardar, para os comentários de jurisprudência.',
    vazio: 'Ainda não tens fichas. Cria uma da próxima vez que leres um acórdão.',
    campos: [
      { id: 'titulo', rotulo: 'Acórdão ou tema', tipo: 'texto', obrigatorio: true, dica: 'Ex: acórdão sobre responsabilidade do Estado' },
      { id: 'tribunal', rotulo: 'Tribunal', tipo: 'texto' },
      { id: 'data', rotulo: 'Data da decisão', tipo: 'data' },
      { id: 'cadeiraId', rotulo: 'Cadeira', tipo: 'cadeira' },
      { id: 'factos', rotulo: 'Factos', tipo: 'longo', dica: 'O que aconteceu, em poucas linhas' },
      { id: 'questao', rotulo: 'Questão', tipo: 'longo', dica: 'O que o tribunal tinha de decidir' },
      { id: 'decisao', rotulo: 'Decisão', tipo: 'longo' },
      { id: 'fundamento', rotulo: 'Fundamento', tipo: 'longo', dica: 'Porquê' },
      { id: 'aprendi', rotulo: 'O que me ensina', tipo: 'longo' },
    ],
    resumo: ['tribunal', 'data'],
  },
  {
    id: 'erros',
    nome: 'Diário dos meus erros',
    descricao: 'O que errei e porquê, para não voltar a errar o mesmo.',
    vazio: 'Ainda não registaste erros. Depois de uma frequência ou de um caso, escreve aqui o que escapou.',
    campos: [
      { id: 'titulo', rotulo: 'O que errei', tipo: 'texto', obrigatorio: true },
      { id: 'onde', rotulo: 'Onde', tipo: 'escolha', opcoes: ['Frequência', 'Caso prático', 'Aula', 'Estudo'] },
      { id: 'cadeiraId', rotulo: 'Cadeira', tipo: 'cadeira' },
      { id: 'certo', rotulo: 'O que está certo', tipo: 'longo' },
      { id: 'porque', rotulo: 'Porque errei', tipo: 'longo', dica: 'Falta de matéria, distração, má leitura do enunciado...' },
      { id: 'data', rotulo: 'Data', tipo: 'data' },
    ],
    resumo: ['onde', 'data'],
  },
  {
    id: 'perguntas',
    nome: 'Perguntas para o stor',
    descricao: 'As dúvidas que queres levar para a aula, por cadeira.',
    vazio: 'Ainda não tens perguntas. Escreve aqui a próxima dúvida que te surgir.',
    campos: [
      { id: 'titulo', rotulo: 'A pergunta', tipo: 'longo', obrigatorio: true },
      { id: 'cadeiraId', rotulo: 'Cadeira', tipo: 'cadeira' },
      { id: 'estado', rotulo: 'Estado', tipo: 'escolha', opcoes: ['Por perguntar', 'Perguntada', 'Respondida'] },
      { id: 'resposta', rotulo: 'Resposta', tipo: 'longo' },
    ],
    resumo: ['estado'],
  },
  {
    id: 'checklists',
    nome: 'Checklists',
    descricao: 'Listas de passos para não te esqueceres de nada: antes de entregar, antes de uma frequência, o que levar.',
    vazio: 'Ainda não tens checklists. Cria a primeira com o que costumas esquecer.',
    campos: [
      { id: 'titulo', rotulo: 'Nome da checklist', tipo: 'texto', obrigatorio: true, dica: 'Ex: antes de entregar um trabalho' },
      { id: 'categoria', rotulo: 'Para quê', tipo: 'escolha', opcoes: ['Antes de entregar', 'Antes de uma frequência', 'Peça ou trabalho', 'Outro'] },
      { id: 'passos', rotulo: 'Passos', tipo: 'longo', dica: 'Um passo por linha' },
    ],
    resumo: ['categoria'],
  },
  {
    id: 'portfolio',
    nome: 'Portfólio',
    descricao: 'Os trabalhos e conquistas de que te orgulhas, prontos para uma candidatura a estágio.',
    vazio: 'O teu portfólio está vazio. Guarda aqui o primeiro trabalho de que te orgulhas.',
    campos: [
      { id: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { id: 'categoria', rotulo: 'O que é', tipo: 'escolha', opcoes: ['Trabalho', 'Comentário', 'Caso prático', 'Prémio ou nota', 'Outro'] },
      { id: 'cadeiraId', rotulo: 'Cadeira', tipo: 'cadeira' },
      { id: 'data', rotulo: 'Data', tipo: 'data' },
      { id: 'descricao', rotulo: 'Porque te orgulhas', tipo: 'longo' },
      { id: 'ligacao', rotulo: 'Onde está o ficheiro', tipo: 'texto', dica: 'Pasta ou ligação (opcional)' },
    ],
    resumo: ['categoria', 'data'],
  },
  {
    id: 'estagio',
    nome: 'Diário de estágio',
    descricao: 'Para quando estagiares: o que viste, o que aprendeste e as dúvidas para o patrono.',
    aviso: 'Sigilo profissional: não escrevas nomes nem dados que identifiquem clientes ou processos.',
    vazio: 'Ainda não tens entradas. Quando começares o estágio, escreve aqui no fim de cada dia.',
    campos: [
      { id: 'titulo', rotulo: 'Resumo do dia', tipo: 'texto', obrigatorio: true },
      { id: 'data', rotulo: 'Data', tipo: 'data' },
      { id: 'vi', rotulo: 'O que vi', tipo: 'longo' },
      { id: 'aprendi', rotulo: 'O que aprendi', tipo: 'longo' },
      { id: 'duvidas', rotulo: 'Dúvidas para o patrono', tipo: 'longo' },
    ],
    resumo: ['data'],
  },
  {
    id: 'contactos',
    nome: 'Contactos jurídicos',
    descricao: 'Professores, colegas, secretarias e contactos de estágio, com lembrete para voltares a falar.',
    aviso: 'Guarda só contactos profissionais e o que a pessoa aceitou partilhar.',
    vazio: 'Ainda não tens contactos. Começa pelos professores e colegas com quem trabalhas.',
    campos: [
      { id: 'titulo', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
      { id: 'funcao', rotulo: 'Quem é e onde está', tipo: 'texto' },
      { id: 'contacto', rotulo: 'Telefone ou email', tipo: 'texto' },
      { id: 'voltarFalar', rotulo: 'Voltar a falar em', tipo: 'data' },
      { id: 'notas', rotulo: 'Notas', tipo: 'longo' },
    ],
    resumo: ['funcao', 'voltarFalar'],
  },
];

export function tipoDeFicha(id) {
  return TIPOS_FICHA.find((t) => t.id === id) || null;
}
