import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { criarDocx } from './docxNotas.js';
import { textoParaDoc } from './notaRica.js';

const CORES = { 'cor-vinho': '6B0F1A', 'cor-azul': '1F3A5F', 'cor-ouro': '8A6D1F', 'cor-laranja': 'B5651D', selo: 'E0554F', 'marca-amarelo': 'F3D77A', 'marca-azul': 'BCD3F2' };
const txt = (text, marks) => ({ type: 'text', text, ...(marks ? { marks } : {}) });
const par = (...c) => ({ type: 'paragraph', content: c });

async function xmlDe(paginas, titulo = '') {
  const buffer = await Packer.toBuffer(criarDocx(paginas, titulo, CORES));
  const zip = await JSZip.loadAsync(buffer);
  return {
    buffer,
    documento: await zip.file('word/document.xml').async('string'),
    numeracao: await zip.file('word/numbering.xml').async('string'),
  };
}

const pagina = (titulo, ...conteudo) => ({ titulo, caderno: 'DO I', seccao: 'Teóricas', tags: [], doc: { type: 'doc', content: conteudo } });

describe('criarDocx', () => {
  it('gera um ficheiro zip válido com o título, a linha do caderno e o texto', async () => {
    const { buffer, documento } = await xmlDe([pagina('Responsabilidade civil', par(txt('Dever de indemnizar')))]);
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
    expect(documento).toContain('Responsabilidade civil');
    expect(documento).toContain('DO I · Teóricas');
    expect(documento).toContain('Dever de indemnizar');
  });

  it('aplica negrito, itálico, sublinhado, cor e tamanho vindos das marcas', async () => {
    const marcas = [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }, { type: 'textStyle', attrs: { color: 'var(--nota-cor-vinho)', fontSize: '21px' } }];
    const { documento } = await xmlDe([pagina('T', par(txt('importante', marcas)))]);
    expect(documento).toContain('<w:b/>');
    expect(documento).toContain('<w:i/>');
    expect(documento).toContain('w:val="6B0F1A"');
    expect(documento).toContain('<w:sz w:val="32"/>');
  });

  it('ignora cores e tamanhos que não são da app', async () => {
    const marcas = [{ type: 'textStyle', attrs: { color: 'red', fontSize: '900px' } }];
    const { documento } = await xmlDe([pagina('T', par(txt('x', marcas)))]);
    expect(documento).not.toContain('w:val="red"');
    expect(documento).not.toContain('w:val="1350"');
  });

  it('marca-texto vira sombreado com a cor da app', async () => {
    const { documento } = await xmlDe([pagina('T', par(txt('x', [{ type: 'highlight', attrs: { color: 'var(--nota-marca-amarelo)' } }])))]);
    expect(documento).toContain('w:fill="F3D77A"');
  });

  it('listas, checklist, blocos de estudo e tabelas entram no ficheiro', async () => {
    const item = (t) => ({ type: 'listItem', content: [par(txt(t))] });
    const { documento, numeracao } = await xmlDe([pagina('T',
      { type: 'bulletList', content: [item('ponto um')] },
      { type: 'orderedList', attrs: { start: 1 }, content: [item('passo um')] },
      { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [par(txt('feito'))] }] },
      { type: 'blocoEstudo', attrs: { tipo: 'prazo' }, content: [par(txt('cinco dias'))] },
      { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', content: [par(txt('Coluna'))] }] }] },
    )]);
    expect(documento).toContain('ponto um');
    expect(documento).toContain('passo um');
    expect(documento).toContain('☑ ');
    expect(documento).toContain('PRAZO');
    expect(documento).toContain('E0554F');
    expect(documento).toContain('<w:tbl>');
    expect(numeracao).toContain('w:numFmt w:val="bullet"');
    expect(numeracao).toContain('w:numFmt w:val="decimal"');
  });

  it('várias páginas levam o título da coleção e quebra de página entre elas', async () => {
    const { documento } = await xmlDe([pagina('Primeira', par(txt('a'))), pagina('Segunda', par(txt('b')))], 'Direito das Obrigações I');
    expect(documento).toContain('Direito das Obrigações I');
    expect(documento.match(/w:pageBreakBefore/g)).toHaveLength(1);
  });

  it('notas antigas só com texto também exportam', async () => {
    const { documento } = await xmlDe([{ titulo: 'Antiga', caderno: 'DF', seccao: 'Teóricas', tags: ['família'], doc: textoParaDoc('linha 1\nlinha 2') }]);
    expect(documento).toContain('linha 1');
    expect(documento).toContain('#família');
  });
});
