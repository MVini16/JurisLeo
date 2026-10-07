import { describe, it, expect } from 'vitest';
import { normalizar, encontrarOcorrencias, proximaOcorrencia, indiceDoDocumento, prepararFlashcard } from './notaFerramentas.js';

describe('normalizar', () => {
  it('mantém o comprimento', () => {
    const t = 'Responsabilidade Civil, ação e ÇÃO';
    expect(normalizar(t)).toHaveLength(t.length);
    expect(normalizar(t)).toBe('responsabilidade civil, acao e cao');
  });
});

describe('encontrarOcorrencias', () => {
  it('encontra sem ligar a acentos nem maiúsculas', () => {
    expect(encontrarOcorrencias('A Acao e a ação', 'acao')).toEqual([{ de: 2, ate: 6 }, { de: 11, ate: 15 }]);
  });
  it('termo vazio não encontra nada', () => {
    expect(encontrarOcorrencias('texto', '  ')).toEqual([]);
    expect(encontrarOcorrencias('texto', undefined)).toEqual([]);
  });
  it('não sobrepõe ocorrências', () => {
    expect(encontrarOcorrencias('aaaa', 'aa')).toEqual([{ de: 0, ate: 2 }, { de: 2, ate: 4 }]);
  });
  it('sem resultados devolve lista vazia', () => {
    expect(encontrarOcorrencias('culpa e dano', 'ilicitude')).toEqual([]);
  });
});

describe('proximaOcorrencia', () => {
  it('dá a volta nas duas direções', () => {
    expect(proximaOcorrencia(2, 3, 1)).toBe(0);
    expect(proximaOcorrencia(0, 3, -1)).toBe(2);
    expect(proximaOcorrencia(-1, 3, 1)).toBe(0);
    expect(proximaOcorrencia(-1, 3, -1)).toBe(2);
    expect(proximaOcorrencia(0, 0, 1)).toBe(-1);
  });
});

describe('indiceDoDocumento', () => {
  const t = (nivel, texto) => ({ type: 'heading', attrs: { level: nivel }, content: texto ? [{ type: 'text', text: texto }] : [] });
  it('lista os títulos por ordem, até dentro de blocos', () => {
    const doc = { type: 'doc', content: [
      t(1, 'Obrigações'),
      { type: 'paragraph', content: [{ type: 'text', text: 'texto' }] },
      { type: 'blocoEstudo', content: [t(2, 'Fontes')] },
      t(2, ''),
      t(3, 'Contrato'),
    ] };
    expect(indiceDoDocumento(doc)).toEqual([
      { nivel: 1, texto: 'Obrigações' }, { nivel: 2, texto: 'Fontes' }, { nivel: 3, texto: 'Contrato' },
    ]);
  });
  it('documento sem títulos dá lista vazia', () => {
    expect(indiceDoDocumento({ type: 'doc', content: [{ type: 'paragraph' }] })).toEqual([]);
    expect(indiceDoDocumento(null)).toEqual([]);
  });
});

describe('prepararFlashcard', () => {
  it('sem dois pontos, só preenche a resposta', () => {
    expect(prepararFlashcard('  facto, ilicitude,\n culpa ')).toEqual({ frente: '', tras: 'facto, ilicitude, culpa' });
  });
  it('"termo: explicação" sugere a pergunta', () => {
    expect(prepararFlashcard('Dano: prejuízo causado a alguém'))
      .toEqual({ frente: 'O que é Dano?', tras: 'prejuízo causado a alguém' });
  });
  it('limita o tamanho', () => {
    expect(prepararFlashcard('x'.repeat(2000)).tras).toHaveLength(600);
  });
});
