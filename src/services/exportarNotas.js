// lógica pura da exportação de notas (partilhar, pdf, word) — sem react, sem firebase e sem a
// biblioteca do word, para testar com vitest sem mocks. trabalha sobre o documento do editor (json)
import { abrirNota, docParaTexto, contarPalavras } from './notaRica.js';
import { agruparPorSeccao, cadernoDaNota, seccaoDaNota, mesmoNome, milissegundos, CADERNO_LIVRE } from './cadernos.js';

// ---------- que páginas exportar ----------

// junta a página aberta no editor (que pode ter alterações por guardar) às notas já guardadas
function comPaginaAtual(notas, atual) {
  if (!atual) return notas;
  const existe = atual.id && notas.some((n) => n.id === atual.id);
  return existe ? notas.map((n) => (n.id === atual.id ? { ...n, ...atual } : n)) : [...notas, atual];
}

function ordemDeLeitura(a, b) {
  const tempo = (n) => milissegundos(n.criadoEm) || milissegundos(n.atualizadoEm);
  return tempo(a) - tempo(b);
}

// devolve as páginas do âmbito pedido, prontas a converter: { titulo, caderno, seccao, tags, doc }
// - escopo 'pagina': só a `atual`; 'seccao': as do mesmo caderno e secção; 'caderno': todas, por secção
export function paginasParaExportar(notas, { escopo, cadernoId, seccao, atual = null, idsConhecidos, nomesCadernos }) {
  const todas = comPaginaAtual(notas, atual);
  const nomeDoCaderno = (id) => nomesCadernos[id] ?? nomesCadernos[CADERNO_LIVRE] ?? 'Caderno Livre';

  const converter = (nota) => {
    const caderno = cadernoDaNota(nota, idsConhecidos);
    return {
      titulo: nota.titulo || 'Sem título',
      caderno: nomeDoCaderno(caderno),
      seccao: seccaoDaNota(nota, caderno),
      tags: nota.tags || [],
      doc: nota.doc ?? abrirNota(nota),
    };
  };

  if (escopo === 'pagina') return atual ? [converter(atual)] : [];

  if (escopo === 'seccao') {
    return todas
      .filter((n) => cadernoDaNota(n, idsConhecidos) === cadernoId && mesmoNome(seccaoDaNota(n, cadernoId), seccao))
      .sort(ordemDeLeitura)
      .map(converter);
  }

  return agruparPorSeccao(todas, cadernoId, idsConhecidos)
    .flatMap((grupo) => [...grupo.notas].sort(ordemDeLeitura))
    .map(converter);
}

export function resumoExportacao(paginas) {
  return {
    total: paginas.length,
    palavras: paginas.reduce((soma, p) => soma + contarPalavras(docParaTexto(p.doc)), 0),
  };
}

// um nome de ficheiro que o telemóvel e o windows aceitam
export function nomeFicheiro(base, extensao) {
  const limpo = String(base ?? '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .trim();
  return `${limpo || 'Notas'}.${extensao}`;
}

// ---------- o que se aceita vir no json (cores e tamanhos) ----------

// só aceitamos as cores da própria app (variáveis do index.css) e tamanhos em px sensatos,
// para um json estragado nunca meter estilos estranhos na impressão ou no word
const COR_APP = /^var\(--nota-(cor|marca)-[a-z]+\)$/;

export function corSegura(valor) {
  return typeof valor === 'string' && COR_APP.test(valor) ? valor : null;
}

export function tamanhoSeguro(valor) {
  const encontrado = /^(\d{1,2})px$/.exec(valor ?? '');
  const px = encontrado ? Number(encontrado[1]) : 0;
  return px >= 8 && px <= 60 ? px : null;
}

// ---------- markdown (o texto que segue para o menu de partilhar) ----------

function escaparMarkdown(texto) {
  return texto.replace(/([\\`*_~])/g, '\\$1');
}

// as marcas de markdown não podem ter espaços lá dentro ("** x **" não funciona)
function envolver(texto, marca) {
  const [, antes, miolo, depois] = /^(\s*)([\s\S]*?)(\s*)$/.exec(texto);
  return miolo ? `${antes}${marca}${miolo}${marca}${depois}` : texto;
}

function textoMarcado(no) {
  let texto = escaparMarkdown(no.text || '');
  for (const marca of no.marks || []) {
    if (marca.type === 'bold') texto = envolver(texto, '**');
    else if (marca.type === 'italic') texto = envolver(texto, '*');
    else if (marca.type === 'strike') texto = envolver(texto, '~~');
    else if (marca.type === 'highlight') texto = envolver(texto, '==');
    else if (marca.type === 'artigo') texto = envolver(texto, '`');
    else if (marca.type === 'underline') {
      const [, antes, miolo, depois] = /^(\s*)([\s\S]*?)(\s*)$/.exec(texto);
      if (miolo) texto = `${antes}<u>${miolo}</u>${depois}`;
    }
  }
  return texto;
}

function inline(no) {
  if (no.type === 'text') return textoMarcado(no);
  if (no.type === 'hardBreak') return '  \n';
  return (no.content || []).map(inline).join('');
}

function prefixarLinhas(texto, prefixo) {
  return texto.split('\n').map((linha) => (linha ? `${prefixo}${linha}` : prefixo.trimEnd())).join('\n');
}

function itensDeLista(no, profundidade) {
  const recuo = '  '.repeat(profundidade);
  return (no.content || []).map((item, i) => {
    let marcador = '- ';
    if (no.type === 'orderedList') marcador = `${(no.attrs?.start ?? 1) + i}. `;
    if (no.type === 'taskList') marcador = item.attrs?.checked ? '- [x] ' : '- [ ] ';

    const [primeiro, ...resto] = item.content || [];
    const linhas = [`${recuo}${marcador}${primeiro ? bloco(primeiro, profundidade + 1) : ''}`];
    for (const filho of resto) {
      const ehLista = ['bulletList', 'orderedList', 'taskList'].includes(filho.type);
      linhas.push(ehLista ? itensDeLista(filho, profundidade + 1) : prefixarLinhas(bloco(filho, profundidade + 1), `${recuo}  `));
    }
    return linhas.join('\n');
  }).join('\n');
}

function tabela(no) {
  const linhas = (no.content || []).map((linha) => (linha.content || []).map((celula) => inline({ content: celula.content }).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim()));
  if (linhas.length === 0) return '';
  const colunas = Math.max(...linhas.map((l) => l.length));
  const preencher = (l) => `| ${[...l, ...Array(colunas - l.length).fill('')].join(' | ')} |`;
  return [preencher(linhas[0]), `| ${Array(colunas).fill('---').join(' | ')} |`, ...linhas.slice(1).map(preencher)].join('\n');
}

const ROTULOS_BLOCO = {
  conceito: 'Conceito', regra: 'Regra', excecao: 'Exceção', prazo: 'Prazo', exemplo: 'Exemplo', acordao: 'Acórdão', pergunta: 'Pergunta de frequência',
};

export function rotuloDoBloco(tipo) {
  return ROTULOS_BLOCO[tipo] ?? 'Nota';
}

function filhos(no, profundidade, deslocamento) {
  return (no.content || []).map((f) => bloco(f, profundidade, deslocamento)).filter((t) => t !== '').join('\n\n');
}

function bloco(no, profundidade = 0, deslocamento = 0) {
  switch (no.type) {
    case 'paragraph': return inline(no);
    case 'heading': return `${'#'.repeat(Math.min(6, (no.attrs?.level ?? 1) + deslocamento))} ${inline(no)}`;
    case 'bulletList': case 'orderedList': case 'taskList': return itensDeLista(no, profundidade);
    case 'blockquote': return prefixarLinhas(filhos(no, profundidade, deslocamento), '> ');
    case 'blocoEstudo': return prefixarLinhas(`**${rotuloDoBloco(no.attrs?.tipo)}**\n\n${filhos(no, profundidade, deslocamento)}`, '> ');
    case 'codeBlock': return `\`\`\`\n${(no.content || []).map((t) => t.text || '').join('')}\n\`\`\``;
    case 'horizontalRule': return '---';
    case 'table': return tabela(no);
    default: return filhos(no, profundidade, deslocamento);
  }
}

// o corpo de uma página em markdown; `deslocamento` empurra os títulos para baixo
// (o título da página fica em cima, por isso um título 1 da nota passa a nível 2)
export function docParaMarkdown(doc, deslocamento = 0) {
  return filhos(doc, 0, deslocamento);
}

// as páginas escolhidas, em markdown: uma só leva "# título"; várias levam o nome da coleção em cima
export function paginasParaMarkdown(paginas, tituloColecao = '') {
  const varias = paginas.length > 1;
  const partes = paginas.map((p) => {
    const meta = `*${[p.caderno, p.seccao].filter(Boolean).join(' · ')}*`;
    const etiquetas = p.tags?.length ? `\n\n${p.tags.map((t) => `#${t.replace(/\s+/g, '-')}`).join(' ')}` : '';
    const corpo = docParaMarkdown(p.doc, varias ? 2 : 1);
    return `${varias ? '##' : '#'} ${p.titulo}\n\n${meta}${corpo ? `\n\n${corpo}` : ''}${etiquetas}`;
  });
  const cabecalho = varias && tituloColecao ? `# ${tituloColecao}\n\n` : '';
  return `${cabecalho}${partes.join('\n\n---\n\n')}\n`;
}
