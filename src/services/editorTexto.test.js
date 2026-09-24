import { describe, it, expect } from 'vitest';
import { Schema } from '@tiptap/pm/model';
import {
  docDeTextoSimples, docInicial, mapaDeTexto, intervaloNoDoc, intervaloNoTexto, normalizarEstilo, contarPalavras,
} from './editorTexto.js';

// esquema mínimo do prosemirror, igual no essencial ao do editor (parágrafos, títulos, listas, negrito, quebra)
const esquema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    heading: { group: 'block', content: 'inline*' },
    bulletList: { group: 'block', content: 'listItem+' },
    listItem: { content: 'paragraph+' },
    text: { group: 'inline' },
    hardBreak: { group: 'inline', inline: true },
  },
  marks: { bold: {} },
});

const doc = esquema.nodeFromJSON({
  type: 'doc',
  content: [
    { type: 'heading', content: [{ type: 'text', text: 'Título' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'O ' }, { type: 'text', text: 'contracto', marks: [{ type: 'bold' }] }, { type: 'text', text: ' é nulo' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'um' }, { type: 'hardBreak' }, { type: 'text', text: 'dois' }] }] }] },
  ],
});

describe('docDeTextoSimples e docInicial', () => {
  it('um parágrafo por linha, linhas vazias ficam parágrafos vazios', () => {
    expect(docDeTextoSimples('a\n\nb')).toEqual({ type: 'doc', content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
      { type: 'paragraph' },
      { type: 'paragraph', content: [{ type: 'text', text: 'b' }] },
    ] });
  });

  it('usa o documento guardado se for válido, senão o texto', () => {
    const rico = { type: 'doc', content: [] };
    expect(docInicial(rico, 'x')).toBe(rico);
    expect(docInicial({ type: 'lixo' }, 'x').content[0].content[0].text).toBe('x');
    expect(docInicial(undefined, undefined).content).toHaveLength(1);
  });
});

describe('mapaDeTexto', () => {
  const mapa = mapaDeTexto(doc);

  it('texto com os blocos separados por \\n, quebras incluídas', () => {
    expect(mapa.texto).toBe('Título\nO contracto é nulo\num\ndois');
    expect(mapa.posicoes).toHaveLength(mapa.texto.length);
  });

  it('cada letra aponta para a sua posição no documento', () => {
    const inicio = mapa.texto.indexOf('contracto');
    const { de, ate } = intervaloNoDoc(mapa, inicio, inicio + 9);
    expect(doc.textBetween(de, ate)).toBe('contracto');
    const i2 = mapa.texto.indexOf('dois');
    const r2 = intervaloNoDoc(mapa, i2, i2 + 4);
    expect(doc.textBetween(r2.de, r2.ate)).toBe('dois');
  });

  it('e volta do documento para o texto', () => {
    const inicio = mapa.texto.indexOf('nulo');
    const { de, ate } = intervaloNoDoc(mapa, inicio, inicio + 4);
    expect(intervaloNoTexto(mapa, de, ate)).toEqual({ inicio, fim: inicio + 4 });
  });

  it('intervalo fora do texto dá null; vazio dá um ponto', () => {
    expect(intervaloNoDoc(mapa, 0, 999)).toBeNull();
    const p = intervaloNoDoc(mapa, 2, 2);
    expect(p.de).toBe(p.ate);
  });
});

describe('normalizarEstilo e contarPalavras', () => {
  it('valores desconhecidos voltam ao padrão, tamanho fica entre 16 e 28', () => {
    expect(normalizarEstilo(undefined)).toEqual({ letra: 'georgia', tamanho: 17, papel: 'linhas' });
    expect(normalizarEstilo({ letra: 'comic', papel: 'quadriculado', tamanho: 40 })).toEqual({ letra: 'georgia', tamanho: 28, papel: 'quadriculado' });
    expect(normalizarEstilo({ letra: 'manuscrita', tamanho: 3 }).tamanho).toBe(16);
  });

  it('conta palavras', () => {
    expect(contarPalavras('  o contrato   é nulo ')).toBe(4);
    expect(contarPalavras('')).toBe(0);
  });
});
