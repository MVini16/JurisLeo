// gera o ficheiro word (.docx) das notas a partir do documento do editor.
// este módulo importa a biblioteca `docx` (grande), por isso a app só o carrega quando se exporta
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, ShadingType, BorderStyle, LevelFormat, UnderlineType,
} from 'docx';
import { corSegura, tamanhoSeguro, rotuloDoBloco } from './exportarNotas.js';

const TITULOS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
const ALINHAMENTOS = { left: AlignmentType.LEFT, center: AlignmentType.CENTER, right: AlignmentType.RIGHT, justify: AlignmentType.JUSTIFIED };
// cada tipo de bloco de estudo tem a cor do mesmo nome que no editor
const COR_DO_BLOCO = { conceito: 'cor-azul', regra: 'cor-vinho', excecao: 'cor-laranja', prazo: 'selo', exemplo: 'cor-verde', acordao: 'cor-roxo', pergunta: 'cor-ouro' };
const NIVEIS_MAX = 5;

// `cores` vem do index.css, lida em tempo de execução: { 'cor-vinho': '6B0F1A', 'marca-amarelo': 'F3D77A', selo: 'E0554F' }
function corDocx(valor, cores) {
  const seguro = corSegura(valor);
  const achado = seguro && /--nota-(cor|marca)-([a-z]+)/.exec(seguro);
  return achado ? cores[`${achado[1]}-${achado[2]}`] : undefined;
}

// sombreado só quando a cor existe (vem sempre do index.css)
function sombra(fill) {
  return fill ? { shading: { type: ShadingType.CLEAR, fill, color: 'auto' } } : {};
}

function corDoBloco(tipo, cores) {
  return cores[COR_DO_BLOCO[tipo] ?? 'cor-azul'];
}

// ---------- texto ----------

function runsDe(no, cores) {
  if (no.type === 'hardBreak') return [new TextRun({ break: 1 })];
  if (no.type === 'text') {
    const opcoes = { text: no.text || '' };
    for (const marca of no.marks || []) {
      if (marca.type === 'bold') opcoes.bold = true;
      else if (marca.type === 'italic') opcoes.italics = true;
      else if (marca.type === 'underline') opcoes.underline = { type: UnderlineType.SINGLE };
      else if (marca.type === 'strike') opcoes.strike = true;
      else if (marca.type === 'artigo') opcoes.font = 'Courier New';
      else if (marca.type === 'highlight') {
        Object.assign(opcoes, sombra(corDocx(marca.attrs?.color, cores)));
      } else if (marca.type === 'textStyle') {
        const cor = corDocx(marca.attrs?.color, cores);
        if (cor) opcoes.color = cor;
        const px = tamanhoSeguro(marca.attrs?.fontSize);
        if (px) opcoes.size = Math.round(px * 1.5); // o word conta em meios pontos: 1 px = 0,75 pt
      }
    }
    return [new TextRun(opcoes)];
  }
  return (no.content || []).flatMap((f) => runsDe(f, cores));
}

// ---------- blocos ----------

// contexto: deslocamento dos títulos, estado das listas e, dentro de uma caixa, o estilo dessa caixa
function paragrafo(no, ctx, extra = {}) {
  return new Paragraph({
    children: runsDe(no, ctx.cores),
    alignment: ALINHAMENTOS[no.attrs?.textAlign],
    spacing: { after: 120 },
    ...ctx.caixa,
    ...extra,
  });
}

function bordaEsquerda(cor) {
  return { style: BorderStyle.SINGLE, size: 18, space: 8, color: cor ?? 'auto' };
}

function celulaDe(no, ctx) {
  const cabecalho = no.type === 'tableHeader';
  return new TableCell({
    children: blocosDe(no, { ...ctx, caixa: {} }),
    ...(cabecalho ? sombra(ctx.cores['marca-azul']) : {}),
  });
}

function lista(no, ctx, nivel) {
  const nivelFinal = Math.min(nivel, NIVEIS_MAX);
  let referencia = 'marcadores';
  if (no.type === 'orderedList') {
    referencia = `ordem-${ctx.numeracoes.length}`;
    ctx.numeracoes.push({ reference: referencia, start: no.attrs?.start ?? 1 });
  }

  return (no.content || []).flatMap((item) => {
    const [primeiro, ...resto] = item.content || [];
    const recuo = { indent: { left: 720 * (nivelFinal + 1), hanging: 360 } };
    let saida;

    if (no.type === 'taskList') {
      const marcador = new TextRun({ text: item.attrs?.checked ? '☑ ' : '☐ ' });
      saida = primeiro?.type === 'paragraph'
        ? [new Paragraph({ children: [marcador, ...runsDe(primeiro, ctx.cores)], spacing: { after: 60 }, ...recuo, ...ctx.caixa })]
        : [];
    } else {
      saida = primeiro?.type === 'paragraph'
        ? [paragrafo(primeiro, ctx, { numbering: { reference: referencia, level: nivelFinal }, spacing: { after: 60 } })]
        : [];
    }

    for (const filho of resto) {
      const ehLista = ['bulletList', 'orderedList', 'taskList'].includes(filho.type);
      saida.push(...(ehLista ? lista(filho, ctx, nivel + 1) : blocosDe({ content: [filho] }, ctx)));
    }
    return saida;
  });
}

function bloco(no, ctx) {
  switch (no.type) {
    case 'paragraph': return [paragrafo(no, ctx)];
    case 'heading': {
      const nivel = Math.min(6, (no.attrs?.level ?? 1) + ctx.deslocamento);
      return [new Paragraph({ children: runsDe(no, ctx.cores), heading: TITULOS[nivel - 1], alignment: ALINHAMENTOS[no.attrs?.textAlign], spacing: { before: 200, after: 100 }, ...ctx.caixa })];
    }
    case 'bulletList': case 'orderedList': case 'taskList': return lista(no, ctx, ctx.nivelLista ?? 0);
    case 'blockquote':
      return blocosDe(no, { ...ctx, caixa: { ...ctx.caixa, indent: { left: 360 }, border: { left: bordaEsquerda(ctx.cores['cor-ouro']) } } });
    case 'blocoEstudo': {
      const cor = corDoBloco(no.attrs?.tipo, ctx.cores);
      const caixa = { indent: { left: 240 }, border: { left: bordaEsquerda(cor) }, ...sombra(ctx.cores['fundo-bloco']) };
      const rotulo = new Paragraph({
        children: [new TextRun({ text: rotuloDoBloco(no.attrs?.tipo).toUpperCase(), bold: true, size: 16, color: cor })],
        spacing: { after: 40 },
        ...caixa,
      });
      return [rotulo, ...blocosDe(no, { ...ctx, caixa })];
    }
    case 'codeBlock':
      return [new Paragraph({ children: [new TextRun({ text: (no.content || []).map((t) => t.text || '').join(''), font: 'Courier New', size: 20 })], spacing: { after: 120 }, ...ctx.caixa })];
    case 'horizontalRule':
      return [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: 'auto' } }, spacing: { after: 120 } })];
    case 'table':
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: (no.content || []).map((linha) => new TableRow({ children: (linha.content || []).map((c) => celulaDe(c, ctx)) })),
        }),
        new Paragraph({ spacing: { after: 120 } }),
      ];
    default: return blocosDe(no, ctx);
  }
}

function blocosDe(no, ctx) {
  return (no.content || []).flatMap((f) => bloco(f, ctx));
}

function configuracaoDeLista(referencia, comeco = 1, formato = LevelFormat.DECIMAL) {
  return {
    reference: referencia,
    levels: Array.from({ length: NIVEIS_MAX + 1 }, (_, nivel) => ({
      level: nivel,
      format: formato,
      text: formato === LevelFormat.BULLET ? '•' : `%${nivel + 1}.`,
      start: nivel === 0 ? comeco : 1,
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720 * (nivel + 1), hanging: 360 } } },
    })),
  };
}

// ---------- o documento ----------

// devolve o documento do word (sem o transformar em ficheiro); `cores` é lido do index.css pela interface
export function criarDocx(paginas, tituloColecao, cores) {
  const numeracoes = [];
  const varias = paginas.length > 1;
  const filhos = [];

  if (varias && tituloColecao) {
    filhos.push(new Paragraph({ text: tituloColecao, heading: HeadingLevel.TITLE, spacing: { after: 240 } }));
  }

  paginas.forEach((pagina, i) => {
    filhos.push(new Paragraph({ text: pagina.titulo, heading: HeadingLevel.HEADING_1, pageBreakBefore: varias && i > 0 }));
    filhos.push(new Paragraph({
      children: [new TextRun({ text: [pagina.caderno, pagina.seccao].filter(Boolean).join(' · '), italics: true, size: 20 })],
      spacing: { after: 200 },
    }));
    filhos.push(...blocosDe(pagina.doc, { cores, deslocamento: 1, numeracoes, caixa: {} }));
    if (pagina.tags?.length) {
      filhos.push(new Paragraph({ children: [new TextRun({ text: pagina.tags.map((t) => `#${t.replace(/\s+/g, '-')}`).join('  '), size: 18, color: cores['cor-ouro'] })], spacing: { before: 200 } }));
    }
  });

  const estiloTitulo = (id, tamanho) => ({ id, name: id, basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Georgia', bold: true, size: tamanho, color: cores['cor-vinho'] } });

  return new Document({
    creator: 'JurisLeo',
    title: tituloColecao || paginas[0]?.titulo || 'Notas',
    styles: {
      default: { document: { run: { font: 'Georgia', size: 22 } } },
      paragraphStyles: [
        estiloTitulo('Title', 44), estiloTitulo('Heading1', 36), estiloTitulo('Heading2', 30), estiloTitulo('Heading3', 26), estiloTitulo('Heading4', 24),
      ],
    },
    numbering: {
      config: [
        configuracaoDeLista('marcadores', 1, LevelFormat.BULLET),
        ...numeracoes.map((n) => configuracaoDeLista(n.reference, n.start)),
      ],
    },
    sections: [{ children: filhos }],
  });
}

export async function gerarDocxBlob(paginas, tituloColecao, cores) {
  return Packer.toBlob(criarDocx(paginas, tituloColecao, cores));
}
