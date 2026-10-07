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
    titulo: 'Notas e Faltas desta cadeira',
    texto: 'Aqui lanças os elementos de avaliação e as faltas, e vês logo o que isso significa segundo o regulamento.',
    pontos: [
      'Preenche a prova escrita e outros elementos para veres a nota de avaliação contínua.',
      'Os campos de exame escrito e oral só aparecem quando fazem sentido para o teu caso.',
      '"Guardar" grava; o texto por baixo explica sempre o que vem a seguir.',
      'Em Faltas, os números "agora" e "até final do semestre" são propositalmente diferentes — no início do semestre cada falta pesa mais.',
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
      'Nas aulas, marca como correu: fui, faltei, faltei com justificação, o professor faltou ou não houve aula. As práticas contam para as faltas.',
      'Na mesma aula escreves o sumário em tópicos, uma nota, o trabalho para casa e uma dúvida.',
      'As práticas aparecem realçadas e as teóricas com o contorno tracejado. A aula em curso pisca a dourado.',
    ],
  },
  '/faltas': {
    titulo: 'Faltas',
    texto: 'O estado de faltas de cada cadeira, calculado a partir do que marcaste no calendário.',
    pontos: [
      'O anel mostra quanto já gastaste do limite total, e o selo diz se estás tranquila, com atenção ou em risco.',
      'O simulador mostra o que aconteceria se faltasses a mais algumas aulas. É só uma simulação, não muda nada.',
      '"Já entreguei" tira uma falta justificada da lista de comprovativos por entregar.',
      'O histórico leva-te ao dia certo no calendário, para corrigires uma marca.',
    ],
  },
  '/feed': {
    titulo: 'Modo Feed',
    texto: 'Cartas de estudo em ecrã inteiro. Desliza para cima para passar à seguinte.',
    pontos: [
      'Toca num flashcard para o virar e diz se sabias.',
      'O coração (ou duplo toque) guarda a carta; "Abrir" leva à página de origem.',
      'O anel do topo conta as cartas de hoje até à meta.',
      'O botão do canto volta à app normal.',
    ],
  },
  '/perfil': {
    titulo: 'Definições',
    texto: 'Tudo o que podes mudar, arrumado em grupos. Toca numa linha para abrir.',
    pontos: [
      'A pesquisa no topo encontra qualquer definição, mesmo que não saibas onde está.',
      'Em Aparência mudas o tema e a folha com que as notas novas começam.',
      'Em Brincadeiras ligas ou desligas o Barney, as mensagens do Vini e o boneco do Vini (aspeto, sítio, quando puxa conversa e o número do Vini).',
      'Em Os meus dados tiras uma cópia de segurança de tudo.',
      '"Terminar sessão" pede confirmação antes de sair.',
    ],
  },
  '/perfil/:secao': {
    titulo: 'Definições',
    texto: 'As mudanças guardam-se logo, sem botão de guardar.',
    pontos: [
      'A seta no topo volta às definições.',
      'As brincadeiras e a folha das notas ficam guardadas só neste aparelho; o tema vale em todos.',
    ],
  },
  '/anotacoes': {
    titulo: 'Notas',
    texto: 'As tuas notas de cada aula, arrumadas por caderno.',
    pontos: [
      'Cada lombada da estante é um caderno. Toca para ver as secções e as páginas lá dentro.',
      'O caderno Livre é para tudo o que não é de nenhuma cadeira.',
      'Os separadores mostram só as favoritas, os rascunhos ou as perguntas para a frequência.',
      '"+ Nova" cria uma página e a pesquisa encontra por título, texto ou tag.',
    ],
  },
  '/cadernos/:id': {
    titulo: 'Caderno',
    texto: 'Um caderno por cadeira, com secções (teóricas, práticas, perguntas para frequência...) e as páginas lá dentro.',
    pontos: [
      'Toca numa secção para a abrir ou fechar. O + dentro dela cria uma página nessa secção.',
      'Toca numa página para ver uma pré-visualização, e em "Abrir página" para escrever.',
      '"+ Nova secção" cria uma secção tua, com o nome que quiseres.',
      '"Exportar" leva o caderno inteiro, ou só uma secção, para partilhar, PDF ou Word.',
    ],
  },
  '/anotacoes/:id': {
    titulo: 'Esta anotação',
    texto: 'Escreve à vontade, marca como favorita, e assinala se ainda é rascunho.',
    pontos: [
      'As tags (separadas por vírgula) ajudam a encontrar isto mais tarde na pesquisa.',
      '"Modelo de página" começa a nota com uma estrutura pronta (resumo de aula, caso prático, ficha de acórdão, Cornell...). Numa nota que já tem texto, o modelo entra no fim.',
      'No separador "Desenhar" podes riscar à mão por cima do texto, com o dedo ou a Apple Pencil. "Só Apple Pencil" deixa o dedo para fazer scroll.',
      '"Exportar" leva esta página, a secção ou o caderno para o menu de partilha do telemóvel, para PDF ou para Word. O desenho vai no PDF e no Word, mas não no texto partilhado.',
      '"Guardar" grava as alterações.',
      '"Apagar" remove de vez, sempre com confirmação antes.',
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

  const prefixosDinamicos = ['/cadeiras/', '/anotacoes/', '/cadernos/', '/casos/', '/perfil/'];
  for (const prefixo of prefixosDinamicos) {
    if (pathname.startsWith(prefixo)) {
      const chave = `${prefixo}:id`;
      return ajudaPorRota[chave] ? { chave, ...ajudaPorRota[chave] } : null;
    }
  }

  return null;
}
