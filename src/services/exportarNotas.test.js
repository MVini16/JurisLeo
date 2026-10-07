import { describe, it, expect } from 'vitest';
import {
  paginasParaExportar, resumoExportacao, nomeFicheiro, corSegura, tamanhoSeguro,
  docParaMarkdown, paginasParaMarkdown,
} from './exportarNotas.js';
import { textoParaDoc } from './notaRica.js';

const IDS = ['do', 'df'];
const NOMES = { do: 'Direito das Obrigações I', df: 'Direito da Família', livre: 'Caderno Livre' };
const ts = (ms) => ({ toMillis: () => ms });
const txt = (text, marks) => ({ type: 'text', text, ...(marks ? { marks } : {}) });
const par = (...conteudo) => ({ type: 'paragraph', content: conteudo });
const doc = (...conteudo) => ({ type: 'doc', content: conteudo });

describe('paginasParaExportar', () => {
  const notas = [
    { id: 'a', titulo: 'Fontes', cadeiraId: 'do', conteudo: 'texto a', criadoEm: ts(300) },
    { id: 'b', titulo: 'Responsabilidade', cadeiraId: 'do', conteudo: 'texto b', criadoEm: ts(100) },
    { id: 'c', titulo: 'Casos', cadeiraId: 'do', seccao: 'Práticas', conteudo: 'texto c', criadoEm: ts(200) },
    { id: 'd', titulo: 'Casamento', cadeiraId: 'df', conteudo: 'texto d', criadoEm: ts(50) },
  ];
  const base = { idsConhecidos: IDS, nomesCadernos: NOMES };

  it('uma página: só a que está aberta, com o conteúdo do editor e não o guardado', () => {
    const atual = { id: 'a', titulo: 'Fontes (alterado)', cadeiraId: 'do', doc: textoParaDoc('conteúdo novo') };
    const paginas = paginasParaExportar(notas, { ...base, escopo: 'pagina', atual });
    expect(paginas).toHaveLength(1);
    expect(paginas[0]).toMatchObject({ titulo: 'Fontes (alterado)', caderno: 'Direito das Obrigações I', seccao: 'Teóricas' });
    expect(docParaMarkdown(paginas[0].doc)).toBe('conteúdo novo');
  });

  it('uma secção: só as do mesmo caderno e secção, pela ordem em que foram escritas', () => {
    const paginas = paginasParaExportar(notas, { ...base, escopo: 'seccao', cadernoId: 'do', seccao: 'Teóricas' });
    expect(paginas.map((p) => p.titulo)).toEqual(['Responsabilidade', 'Fontes']);
  });

  it('uma secção inclui a página nova que ainda não foi guardada', () => {
    const atual = { titulo: 'Nova', cadeiraId: 'do', seccao: 'Teóricas', doc: textoParaDoc('x') };
    const paginas = paginasParaExportar(notas, { ...base, escopo: 'seccao', cadernoId: 'do', seccao: 'Teóricas', atual });
    expect(paginas.map((p) => p.titulo)).toContain('Nova');
  });

  it('o caderno inteiro vem por secção (padrão primeiro) e não mistura outros cadernos', () => {
    const paginas = paginasParaExportar(notas, { ...base, escopo: 'caderno', cadernoId: 'do' });
    expect(paginas.map((p) => p.titulo)).toEqual(['Responsabilidade', 'Fontes', 'Casos']);
  });

  it('notas sem título ficam com um nome e um caderno desconhecido vai para o livre', () => {
    const paginas = paginasParaExportar([{ id: 'z', cadeiraId: 'xpto', conteudo: 'a' }], { ...base, escopo: 'caderno', cadernoId: 'livre' });
    expect(paginas[0]).toMatchObject({ titulo: 'Sem título', caderno: 'Caderno Livre', seccao: 'Ideias' });
  });

  it('resumo conta páginas, palavras e páginas com desenho', () => {
    const paginas = paginasParaExportar(notas, { ...base, escopo: 'caderno', cadernoId: 'do' });
    expect(resumoExportacao(paginas)).toEqual({ total: 3, palavras: 6, desenhos: 0 });
  });

  it('o desenho guardado vai com a página, e o da página aberta ganha ao guardado', () => {
    const guardado = JSON.stringify({ v: 1, t: [{ f: 'c', k: 'azul', l: 2, p: [0, 0, 5, 5] }] });
    const comDesenho = [{ id: 'x', titulo: 'T', cadeiraId: 'do', conteudo: 'a', desenho: guardado }];
    const paginas = paginasParaExportar(comDesenho, { ...base, escopo: 'caderno', cadernoId: 'do' });
    expect(paginas[0].tracos).toHaveLength(1);
    expect(resumoExportacao(paginas).desenhos).toBe(1);
    const atual = { id: 'x', titulo: 'T', cadeiraId: 'do', doc: textoParaDoc('a'), tracos: [] };
    expect(paginasParaExportar(comDesenho, { ...base, escopo: 'pagina', atual })[0].tracos).toHaveLength(0);
  });
});

describe('nomeFicheiro', () => {
  it('tira carateres proibidos e junta a extensão', () => {
    expect(nomeFicheiro('DO I: "Responsabilidade" / civil?', 'docx')).toBe('DO I Responsabilidade civil.docx');
  });

  it('nome vazio vira Notas e nomes enormes são cortados', () => {
    expect(nomeFicheiro('', 'pdf')).toBe('Notas.pdf');
    expect(nomeFicheiro('x'.repeat(200), 'docx').length).toBeLessThanOrEqual(85);
  });
});

describe('cores e tamanhos aceites', () => {
  it('só aceita as variáveis de cor da app', () => {
    expect(corSegura('var(--nota-cor-vinho)')).toBe('var(--nota-cor-vinho)');
    expect(corSegura('var(--nota-marca-amarelo)')).toBe('var(--nota-marca-amarelo)');
    expect(corSegura('red')).toBeNull();
    expect(corSegura('url(javascript:alert(1))')).toBeNull();
    expect(corSegura('var(--nota-cor-vinho); background:url(x)')).toBeNull();
    expect(corSegura(undefined)).toBeNull();
  });

  it('só aceita tamanhos em px razoáveis', () => {
    expect(tamanhoSeguro('21px')).toBe(21);
    expect(tamanhoSeguro('5px')).toBeNull();
    expect(tamanhoSeguro('999px')).toBeNull();
    expect(tamanhoSeguro('2em')).toBeNull();
    expect(tamanhoSeguro(null)).toBeNull();
  });
});

describe('markdown', () => {
  it('formata marcas e põe os espaços fora dos asteriscos', () => {
    const d = doc(par(txt('um ', null), txt('negrito ', [{ type: 'bold' }]), txt('itálico', [{ type: 'italic' }]), txt(' e '), txt('art. 483.º', [{ type: 'artigo' }])));
    expect(docParaMarkdown(d)).toBe('um **negrito** *itálico* e `art. 483.º`');
  });

  it('marca-texto, riscado e sublinhado', () => {
    const d = doc(par(txt('a', [{ type: 'highlight', attrs: { color: 'var(--nota-marca-amarelo)' } }]), txt(' '), txt('b', [{ type: 'strike' }]), txt(' '), txt('c', [{ type: 'underline' }])));
    expect(docParaMarkdown(d)).toBe('==a== ~~b~~ <u>c</u>');
  });

  it('escapa os carateres que estragariam o markdown', () => {
    expect(docParaMarkdown(doc(par(txt('2 * 3 = 6 e _x_'))))).toBe('2 \\* 3 = 6 e \\_x\\_');
  });

  it('empurra os títulos para baixo', () => {
    const d = doc({ type: 'heading', attrs: { level: 1 }, content: [txt('Título')] });
    expect(docParaMarkdown(d, 1)).toBe('## Título');
    expect(docParaMarkdown(d, 9)).toBe('###### Título');
  });

  it('listas com marcadores, números, tarefas e níveis', () => {
    const item = (...c) => ({ type: 'listItem', content: c });
    const d = doc(
      { type: 'bulletList', content: [item(par(txt('um')), { type: 'bulletList', content: [item(par(txt('filho')))] }), item(par(txt('dois')))] },
      { type: 'orderedList', attrs: { start: 3 }, content: [item(par(txt('três'))), item(par(txt('quatro')))] },
      { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [par(txt('feito'))] }, { type: 'taskItem', attrs: { checked: false }, content: [par(txt('por fazer'))] }] },
    );
    expect(docParaMarkdown(d)).toBe('- um\n  - filho\n- dois\n\n3. três\n4. quatro\n\n- [x] feito\n- [ ] por fazer');
  });

  it('blocos de estudo e citações viram citações com rótulo', () => {
    const d = doc(
      { type: 'blocoEstudo', attrs: { tipo: 'excecao' }, content: [par(txt('só se houver culpa'))] },
      { type: 'blockquote', content: [par(txt('citação'))] },
    );
    expect(docParaMarkdown(d)).toBe('> **Exceção**\n>\n> só se houver culpa\n\n> citação');
  });

  it('tabelas ficam em formato de barras com cabeçalho', () => {
    const celula = (tipo, t) => ({ type: tipo, content: [par(txt(t))] });
    const d = doc({ type: 'table', content: [
      { type: 'tableRow', content: [celula('tableHeader', 'A'), celula('tableHeader', 'B')] },
      { type: 'tableRow', content: [celula('tableCell', '1'), celula('tableCell', '2')] },
    ] });
    expect(docParaMarkdown(d)).toBe('| A | B |\n| --- | --- |\n| 1 | 2 |');
  });

  it('avisa que o desenho não vai no texto', () => {
    const pagina = { titulo: 'T', caderno: 'DO I', seccao: 'Teóricas', tags: [], doc: textoParaDoc('corpo'), tracos: [{ f: 'c', k: 'tinta', l: 1, p: [0, 0, 1, 1] }] };
    expect(paginasParaMarkdown([pagina])).toContain('desenho à mão que não vai no texto');
    expect(paginasParaMarkdown([{ ...pagina, tracos: [] }])).not.toContain('desenho');
  });

  it('uma página leva # título, a linha do caderno e as tags; várias levam a coleção em cima', () => {
    const p = (titulo) => ({ titulo, caderno: 'DO I', seccao: 'Teóricas', tags: ['boa fé'], doc: textoParaDoc('corpo') });
    expect(paginasParaMarkdown([p('Um')])).toBe('# Um\n\n*DO I · Teóricas*\n\ncorpo\n\n#boa-fé\n');
    const varias = paginasParaMarkdown([p('Um'), p('Dois')], 'DO I');
    expect(varias.startsWith('# DO I\n\n## Um')).toBe(true);
    expect(varias).toContain('\n\n---\n\n## Dois');
  });
});
