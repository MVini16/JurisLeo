// textos de ajuda por ecrã — usados no botão de ajuda e na dica da primeira visita
// chave = rota (ou base da rota, para rotas dinâmicas tipo /cadeiras/:id)

export const ajudaPorRota = {
  '/dashboard': {
    titulo: 'O teu Dashboard',
    texto: 'Aqui vês a aula de agora ou a seguir, e a contagem para a próxima frequência. É o que abre sempre que entras na app.',
    pontos: [
      'O interruptor no canto muda entre tema claro e escuro.',
      '"Aulas de Hoje" mostra a tua agenda do dia, por ordem de hora.',
      '"Próxima Frequência" conta os dias que faltam.',
      '"Tarefas Pendentes" mostra o que ainda não marcaste como feito.',
    ],
  },
  '/horario': {
    titulo: 'Horário',
    texto: 'A tua semana toda, com a aula que está a acontecer agora destacada com um contorno.',
    pontos: [
      'Cada coluna é um dia, cada linha um tempo lectivo.',
      'A cor de cada aula corresponde à cor da cadeira.',
      'O dia de hoje fica realçado no cabeçalho.',
    ],
  },
  '/cadeiras': {
    titulo: 'Cadeiras',
    texto: 'As tuas 5 cadeiras do semestre, com o estado de avaliação e de faltas calculado automaticamente.',
    pontos: [
      'Toca numa cadeira para lançares notas ou faltas.',
      'O emblema colorido mostra se estás aprovada, a ir a exame, excluída, etc.',
      'O semáforo de faltas mostra quantas ainda podes dar.',
      '"Recursos" leva-te ao Glossário, Artigos, Leituras e Pesquisa.',
    ],
  },
  '/cadeiras/:id': {
    titulo: 'A tua cadeira',
    texto: 'Tudo sobre esta cadeira num sítio: estado da avaliação, faltas, anotações, casos, leituras e flashcards.',
    pontos: [
      'Usa as abas no topo para mudar de secção.',
      'Em "Notas" vês onde estás no regulamento e lanças notas.',
      'Em "Faltas" o número grande é quantas ainda podes dar até ao fim do semestre. No início do semestre cada falta pesa mais.',
      'O que ainda não tem conteúdo diz-te o que fazer para o começares.',
    ],
  },
  '/notas': {
    titulo: 'Notas',
    texto: 'O estado de cada cadeira segundo o regulamento de avaliação, explicado por palavras, mais a tua média do ano.',
    pontos: [
      '"Lançar nota" grava um elemento de avaliação e mostra logo o que isso significa.',
      '"Onde estou" mostra o caminho do regulamento e em que passo estás.',
      '"Simular" diz-te que nota precisas no exame para chegares à nota que queres.',
      '"Pesos" deixa-te ajustar a ponderação da contínua, se o regente tiver fixado outra.',
    ],
  },
  '/faltas': {
    titulo: 'Faltas',
    texto: 'Quantas faltas ainda podes dar em cada cadeira, e o registo de cada uma.',
    pontos: [
      'Para registar: toca na cadeira e depois em "Faltei". O motivo pode ficar para depois.',
      'O número grande é quantas faltas ainda podes dar até ao fim do semestre.',
      'No início do semestre cada falta pesa mais, porque a conta é feita sobre as aulas já dadas.',
      'Se justificares uma falta, tens até ao fim do dia útil seguinte para entregar o comprovativo.',
    ],
  },
  '/tarefas': {
    titulo: 'Tarefas',
    texto: 'Tudo o que tens para fazer, agrupado por cadeira ou por prazo.',
    pontos: [
      '"+ Nova Tarefa" abre o formulário.',
      'Toca no círculo à esquerda de cada tarefa para a marcares como feita.',
      'Os filtros no topo escondem ou mostram por cadeira.',
      'Tarefas atrasadas ficam destacadas.',
    ],
  },
  '/calendario': {
    titulo: 'Calendário',
    texto: 'As tuas aulas e eventos — frequências, orais, entregas — em 4 vistas diferentes.',
    pontos: [
      'Alterna entre Dia, Semana, Mês e Lista no topo.',
      'O botão + cria um evento novo.',
      'Toca num evento para o veres, editares ou apagares.',
    ],
  },
  '/perfil': {
    titulo: 'Perfil',
    texto: 'Os teus dados académicos, o tema da app, e é aqui que terminas sessão.',
    pontos: [
      'O interruptor muda o tema em qualquer dispositivo onde entrares.',
      '"Rever o tutorial" mostra outra vez a introdução do Dashboard.',
      '"Repor cadeiras" só serve para arranjar contas de teste antigas.',
      '"Terminar sessão" sai da tua conta.',
    ],
  },
  '/anotacoes': {
    titulo: 'Cadernos',
    texto: 'Um caderno por cadeira, com as tuas notas de cada aula.',
    pontos: [
      'Toca numa lombada para abrir o caderno dessa cadeira.',
      '"Continuar onde ficaste" abre a última página em que mexeste.',
      '"Ver todas numa lista" mostra todas as anotações, com filtros por cadeira.',
    ],
  },
  '/anotacoes/todas': {
    titulo: 'Todas as anotações',
    texto: 'As páginas de todos os cadernos numa só lista.',
    pontos: [
      'Os filtros por cadeira e a pesquisa ajudam a encontrar depois.',
      'A estrela marca uma anotação como favorita.',
    ],
  },
  '/anotacoes/caderno/:id': {
    titulo: 'Este caderno',
    texto: 'As divisórias estão nos separadores de cima; cada uma tem as suas páginas.',
    pontos: [
      'O "+" nos separadores cria uma divisória nova (por exemplo, um capítulo).',
      'As setas ↑ ↓ mudam a ordem das páginas.',
      'Apagar uma divisória tua não apaga páginas: passam para as Teóricas.',
    ],
  },
  '/anotacoes/:id': {
    titulo: 'Esta página',
    texto: 'Escreve à vontade, com formatação, e escolhe a letra e o papel.',
    pontos: [
      '"Aa" muda a letra (há uma manuscrita), o tamanho, a cor do texto e o papel.',
      'O "+" tem o resto: títulos, listas de tarefas, citações, marcadores de várias cores e alinhamento.',
      '"Rever texto" e "Significado" funcionam aqui também.',
      '"Guardar" grava as alterações; "Apagar" pede sempre confirmação antes.',
    ],
  },
  '/casos': {
    titulo: 'Casos Práticos',
    texto: 'Onde resolves casos com a estrutura de sempre — factos, questão, enquadramento, subsunção, conclusão.',
    pontos: [
      'O painel de "Dúvidas por esclarecer" junta as dúvidas de todos os casos num só sítio.',
      'Filtra por cadeira ou por estado (por resolver, resolvido, corrigido, com dúvida).',
      '"+ Novo" começa um caso do zero.',
    ],
  },
  '/casos/:id': {
    titulo: 'Este caso',
    texto: 'Preenche cada campo da estrutura, e usa as dúvidas para não esqueceres o que perguntar depois.',
    pontos: [
      'Prime Enter para adicionares uma dúvida rapidamente.',
      'O estado ajuda-te a saber, de relance, em que ponto está cada caso.',
      '"Nota do professor" fica para quando tiveres o feedback da correção.',
    ],
  },
  '/artigos': {
    titulo: 'Artigos',
    texto: 'A tua referência pessoal de artigos de código, com nota própria e nível de dificuldade.',
    pontos: [
      'Os pontos (●●●) marcam a dificuldade, de 1 a 3.',
      'Filtra por código (CC, CPA, CRP, CT) no topo.',
      'A nota é tua — escreve por palavras tuas, não é preciso copiar a lei.',
    ],
  },
  '/glossario': {
    titulo: 'Glossário',
    texto: 'Termos jurídicos, explicados no teu vocabulário.',
    pontos: [
      'Marca "Dominado" quando já não precisares de o consultar.',
      '"Só por dominar" filtra só o que ainda estás a aprender.',
      '"+ Novo termo" adiciona um termo novo.',
    ],
  },
  '/leituras': {
    titulo: 'Leituras',
    texto: 'O teu progresso pelos manuais, capítulo a capítulo.',
    pontos: [
      'A barra mostra a percentagem lida (página actual sobre o total).',
      'Adiciona capítulos e marca-os como lidos à medida que avanças.',
      '"+ Novo manual" regista um manual, associado a uma cadeira.',
    ],
  },
  '/estudo': {
    titulo: 'Estudo',
    texto: 'Um cronómetro simples para as tuas sessões de estudo, por cadeira.',
    pontos: [
      'Escolhe a cadeira (ou "Geral") antes de iniciares.',
      '"Pausar" não perde o tempo já estudado, só pára de contar.',
      '"Terminar" grava a sessão no histórico, logo por baixo.',
    ],
  },
  '/pesquisa': {
    titulo: 'Pesquisa',
    texto: 'Procura em tudo — cadeiras, tarefas, anotações, casos, artigos, glossário e leituras — de uma vez.',
    pontos: [
      'Escreve qualquer palavra; os resultados aparecem agrupados por tipo.',
      'Toca num resultado para ires direta a essa página.',
    ],
  },
  '/flashcards': {
    titulo: 'Flashcards',
    texto: 'Cartões de pergunta e resposta, com repetição espaçada — os que erraste voltam mais cedo, os que sabes bem voltam mais tarde.',
    pontos: [
      '"Começar revisão" só mostra os que já estão prontos a rever hoje.',
      'Toca no cartão para o virares e veres a resposta.',
      'Os pontinhos mostram o nível — mais pontos, mais bem sabido.',
    ],
  },
};

// resolve o tópico de ajuda certo para um pathname, incluindo rotas dinâmicas
export function resolverAjuda(pathname) {
  if (ajudaPorRota[pathname]) return { chave: pathname, ...ajudaPorRota[pathname] };

  // o mais comprido primeiro: /anotacoes/caderno/ antes de /anotacoes/
  const prefixosDinamicos = ['/cadeiras/', '/anotacoes/caderno/', '/anotacoes/', '/casos/'];
  for (const prefixo of prefixosDinamicos) {
    if (pathname.startsWith(prefixo)) {
      const chave = `${prefixo}:id`;
      return ajudaPorRota[chave] ? { chave, ...ajudaPorRota[chave] } : null;
    }
  }

  return null;
}
