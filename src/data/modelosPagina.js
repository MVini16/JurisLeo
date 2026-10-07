// modelos de página para as notas: esqueletos de títulos, blocos de estudo e tabelas, vazios para a leonor
// preencher. não trazem matéria, artigos nem jurisprudência: isso é dela (e do regente), nunca nosso.
// cada modelo diz que secção e que folha faz sentido, e o `doc()` devolve o documento do editor (json)

// ---------- peças para montar os documentos ----------

const texto = (t) => ({ type: 'text', text: t });
const par = (t) => (t ? { type: 'paragraph', content: [texto(t)] } : { type: 'paragraph' });
const titulo = (nivel, t) => ({ type: 'heading', attrs: { level: nivel }, content: [texto(t)] });
const lista = (itens) => ({ type: 'bulletList', content: itens.map((t) => ({ type: 'listItem', content: [par(t)] })) });
const tarefas = (itens) => ({ type: 'taskList', content: itens.map((t) => ({ type: 'taskItem', attrs: { checked: false }, content: [par(t)] })) });
const bloco = (tipo, ...conteudo) => ({ type: 'blocoEstudo', attrs: { tipo }, content: conteudo.length > 0 ? conteudo : [par('')] });
const celula = (tipo, t) => ({ type: tipo, content: [par(t)] });
// linha com a primeira coluna a título (ou toda a linha a título, para o cabeçalho)
const linha = (...celulas) => ({ type: 'tableRow', content: celulas });
const tabela = (...linhas) => ({ type: 'table', content: linhas });
const cabecalho = (...nomes) => linha(...nomes.map((n) => celula('tableHeader', n)));
const campo = (nome, ...resto) => linha(celula('tableHeader', nome), ...resto.map(() => celula('tableCell', '')));
const documento = (...conteudo) => ({ type: 'doc', content: conteudo });

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// "7 Out", para os títulos que levam a data da aula
export function rotuloDoDia(data = new Date()) {
  return `${data.getDate()} ${MESES[data.getMonth()]}`;
}

// ---------- os modelos ----------

// `esboco` desenha o cartãozinho do modelo: t título, l linha, c linha curta, b bloco, k checklist, g tabela
export const MODELOS_PAGINA = [
  {
    id: 'resumo-aula',
    nome: 'Resumo de aula',
    descricao: 'Tema, conceitos, regras e exceções, artigos e dúvidas.',
    seccao: 'Teóricas',
    esboco: ['t', 'l', 'b', 'l', 'c', 'b'],
    titulo: (dia) => `Resumo de aula · ${rotuloDoDia(dia)}`,
    doc: () => documento(
      titulo(2, 'Tema da aula'), par(''),
      bloco('conceito'),
      titulo(2, 'Ideias principais'), lista(['', '']),
      bloco('regra'),
      bloco('excecao'),
      titulo(2, 'Artigos a decorar'), tarefas(['']),
      bloco('pergunta'),
      titulo(2, 'Dúvidas para esclarecer'), lista(['']),
    ),
  },
  {
    id: 'caso-pratico',
    nome: 'Caso prático',
    descricao: 'A estrutura de resolução: factos, questão, enquadramento, subsunção e conclusão.',
    seccao: 'Práticas',
    esboco: ['t', 'c', 'l', 'c', 'l', 'c', 'l'],
    titulo: () => 'Caso prático',
    doc: () => documento(
      titulo(2, 'Factos'), par(''),
      titulo(2, 'Questão jurídica'), par(''),
      titulo(2, 'Enquadramento'), par(''),
      titulo(2, 'Subsunção'), par(''),
      titulo(2, 'Conclusão'), par(''),
    ),
  },
  {
    id: 'ficha-acordao',
    nome: 'Ficha de acórdão',
    descricao: 'Identificação do acórdão, questão, factos, decisão e fundamentação.',
    seccao: 'Resumos',
    esboco: ['t', 'g', 'c', 'l', 'b'],
    titulo: () => 'Ficha de acórdão',
    doc: () => documento(
      tabela(campo('Tribunal', 1), campo('Processo', 1), campo('Data', 1), campo('Relator', 1), campo('Tema', 1)),
      par(''),
      bloco('acordao'),
      titulo(2, 'Questão a decidir'), par(''),
      titulo(2, 'Factos relevantes'), par(''),
      titulo(2, 'Decisão'), par(''),
      titulo(2, 'Fundamentação'), par(''),
      titulo(2, 'Normas aplicadas'), lista(['']),
      titulo(2, 'Voto de vencido e notas'), par(''),
      bloco('pergunta'),
    ),
  },
  {
    id: 'cornell',
    nome: 'Notas Cornell',
    descricao: 'Palavras-chave à esquerda, notas à direita e um resumo no fim.',
    seccao: 'Teóricas',
    esboco: ['t', 'g', 'g', 'b'],
    titulo: (dia) => `Cornell · ${rotuloDoDia(dia)}`,
    doc: () => documento(
      par(''),
      tabela(
        cabecalho('Palavras-chave e perguntas', 'Notas da aula'),
        campo('', 1), campo('', 1), campo('', 1), campo('', 1), campo('', 1),
      ),
      par(''),
      bloco('conceito', par('')),
      titulo(3, 'Resumo em duas frases'), par(''),
    ),
  },
  {
    id: 'revisao-frequencia',
    nome: 'Revisão para a frequência',
    descricao: 'O que vai sair, artigos essenciais, perguntas prováveis e plano dos últimos dias.',
    seccao: 'Perguntas para frequência',
    esboco: ['t', 'k', 'k', 'b', 'g'],
    titulo: () => 'Revisão para a frequência',
    doc: () => documento(
      titulo(2, 'Matéria que pode sair'), tarefas(['', '', '']),
      titulo(2, 'Artigos essenciais'), tarefas(['']),
      titulo(2, 'Perguntas prováveis'), bloco('pergunta'), bloco('pergunta'),
      titulo(2, 'Erros a evitar'), lista(['']),
      titulo(2, 'Plano dos últimos dias'),
      tabela(cabecalho('Dia', 'O que rever'), campo('', 1), campo('', 1), campo('', 1)),
      par(''),
    ),
  },
  {
    id: 'comparacao',
    nome: 'Comparação de conceitos',
    descricao: 'Um quadro para comparar dois institutos: noção, requisitos, efeitos e regime.',
    seccao: 'Resumos',
    esboco: ['t', 'g', 'g', 'c'],
    titulo: () => 'Comparação de conceitos',
    doc: () => documento(
      tabela(
        cabecalho('', 'Conceito A', 'Conceito B'),
        campo('Noção', 1, 1), campo('Requisitos', 1, 1), campo('Efeitos', 1, 1),
        campo('Regime e artigos', 1, 1), campo('Exemplo', 1, 1), campo('Diferença essencial', 1, 1),
      ),
      par(''),
      bloco('pergunta'),
    ),
  },
  {
    id: 'mapa-mental',
    nome: 'Mapa mental',
    descricao: 'Uma folha de pontos para ligar ideias à mão (usa o separador Desenhar).',
    seccao: 'Resumos',
    folha: 'pontos',
    esboco: ['t'],
    titulo: () => 'Mapa mental',
    doc: () => documento(titulo(2, 'Tema central'), par('')),
  },
];

export function modeloPorId(id) {
  return MODELOS_PAGINA.find((m) => m.id === id) ?? null;
}
