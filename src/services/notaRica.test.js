import { describe, it, expect } from 'vitest';
import {
  DOC_VAZIO, textoParaDoc, docParaTexto, abrirNota, serializarNota,
  estadoTamanho, contarPalavras, folhaValida, tamanhoEmBytes, LIMITE_FIRESTORE_BYTES,
} from './notaRica.js';

describe('textoParaDoc / docParaTexto', () => {
  it('faz ida e volta sem perder linhas', () => {
    const texto = 'Primeira linha\nSegunda linha\n\nQuarta linha';
    expect(docParaTexto(textoParaDoc(texto))).toBe(texto);
  });

  it('texto vazio dá um documento válido com um parágrafo', () => {
    const doc = textoParaDoc('');
    expect(doc.type).toBe('doc');
    expect(doc.content).toHaveLength(1);
    expect(docParaTexto(doc)).toBe('');
  });

  it('extrai o texto de títulos, listas, blocos de estudo e tabelas', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Responsabilidade civil' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'facto' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ilicitude' }] }] },
        ] },
        { type: 'blocoEstudo', attrs: { tipo: 'conceito' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'dano' }] }] },
        { type: 'table', content: [{ type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
        ] }] },
      ],
    };
    const texto = docParaTexto(doc);
    expect(texto).toContain('Responsabilidade civil');
    expect(texto).toContain('facto');
    expect(texto).toContain('ilicitude');
    expect(texto).toContain('dano');
    expect(texto).toContain('A');
  });

  it('preserva marcas de formatação sem as meter no texto', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [
      { type: 'text', text: 'art. 483.º', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' CC' },
    ] }] };
    expect(docParaTexto(doc)).toBe('art. 483.º CC');
  });
});

describe('abrirNota', () => {
  it('abre o documento rico quando existe', () => {
    const doc = textoParaDoc('rico');
    expect(abrirNota({ rico: JSON.stringify(doc), conteudo: 'antigo' })).toEqual(doc);
  });

  it('converte notas antigas só com texto', () => {
    expect(docParaTexto(abrirNota({ conteudo: 'nota antiga\nem duas linhas' }))).toBe('nota antiga\nem duas linhas');
  });

  it('cai para o texto se o json estiver estragado', () => {
    expect(docParaTexto(abrirNota({ rico: '{não é json', conteudo: 'salvo' }))).toBe('salvo');
  });

  it('cai para o texto se o json não for um documento', () => {
    expect(docParaTexto(abrirNota({ rico: JSON.stringify({ foo: 1 }), conteudo: 'salvo' }))).toBe('salvo');
  });

  it('nota nova ou sem nada abre vazia', () => {
    expect(abrirNota(null)).toEqual(DOC_VAZIO);
    expect(abrirNota({})).toEqual(DOC_VAZIO);
  });
});

describe('serializarNota', () => {
  it('devolve o json e o texto simples coerentes', () => {
    const doc = textoParaDoc('olá\nmundo');
    const { rico, conteudo } = serializarNota(doc);
    expect(JSON.parse(rico)).toEqual(doc);
    expect(conteudo).toBe('olá\nmundo');
  });
});

describe('estadoTamanho', () => {
  it('uma nota normal está ok', () => {
    expect(estadoTamanho(textoParaDoc('uma nota curta')).estado).toBe('ok');
  });

  it('avisa perto do limite e trava acima dele', () => {
    const quase = textoParaDoc('x'.repeat(Math.floor(LIMITE_FIRESTORE_BYTES * 0.45)));
    expect(estadoTamanho(quase).estado).toBe('perto');
    const demais = textoParaDoc('x'.repeat(LIMITE_FIRESTORE_BYTES));
    expect(estadoTamanho(demais).estado).toBe('excedido');
  });

  it('o desenho à mão conta para o limite da mesma nota', () => {
    const doc = textoParaDoc('nota curta');
    expect(estadoTamanho(doc, 0).estado).toBe('ok');
    expect(estadoTamanho(doc, Math.floor(LIMITE_FIRESTORE_BYTES * 0.85)).estado).toBe('perto');
    expect(estadoTamanho(doc, LIMITE_FIRESTORE_BYTES).estado).toBe('excedido');
  });

  it('conta bytes e não carateres (acentos ocupam mais)', () => {
    expect(tamanhoEmBytes('ç')).toBe(2);
    expect(tamanhoEmBytes('a')).toBe(1);
  });
});

describe('contarPalavras e folhaValida', () => {
  it('conta palavras com espaços e quebras de linha a mais', () => {
    expect(contarPalavras('  um  dois\n três ')).toBe(3);
    expect(contarPalavras('')).toBe(0);
    expect(contarPalavras(null)).toBe(0);
  });

  it('uma folha desconhecida volta ao pautado', () => {
    expect(folhaValida('quadriculado')).toBe('quadriculado');
    expect(folhaValida('xpto')).toBe('pautado');
    expect(folhaValida(undefined)).toBe('pautado');
  });
});
