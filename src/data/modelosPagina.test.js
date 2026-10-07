import { describe, it, expect } from 'vitest';
import { MODELOS_PAGINA, modeloPorId, rotuloDoDia } from './modelosPagina.js';
import { docParaTexto, serializarNota, abrirNota } from '../services/notaRica.js';
import { FOLHAS } from '../services/notaRica.js';

// o que o editor sabe desenhar (ver components/editor/extensoes.js)
const NOS = new Set(['doc', 'paragraph', 'text', 'heading', 'bulletList', 'listItem', 'taskList', 'taskItem', 'blocoEstudo', 'table', 'tableRow', 'tableHeader', 'tableCell']);
const TIPOS_BLOCO = ['conceito', 'regra', 'excecao', 'prazo', 'exemplo', 'acordao', 'pergunta'];
const SECCOES_PADRAO = ['Teóricas', 'Práticas', 'Perguntas para frequência', 'Resumos', 'Dúvidas'];

function percorrer(no, visitar) {
  visitar(no);
  (no.content || []).forEach((f) => percorrer(f, visitar));
}

describe('modelos de página', () => {
  it('há sete modelos, com ids diferentes', () => {
    expect(MODELOS_PAGINA).toHaveLength(7);
    expect(new Set(MODELOS_PAGINA.map((m) => m.id)).size).toBe(7);
  });

  it.each(MODELOS_PAGINA)('$nome: só usa nós que o editor conhece e blocos de estudo válidos', (modelo) => {
    percorrer(modelo.doc(), (no) => {
      expect(NOS.has(no.type), `nó desconhecido: ${no.type}`).toBe(true);
      if (no.type === 'blocoEstudo') expect(TIPOS_BLOCO).toContain(no.attrs.tipo);
      if (no.type === 'heading') expect([1, 2, 3]).toContain(no.attrs.level);
    });
  });

  it.each(MODELOS_PAGINA)('$nome: tem estrutura válida (tabelas com células, listas com itens, blocos com conteúdo)', (modelo) => {
    percorrer(modelo.doc(), (no) => {
      if (no.type === 'table') { expect(no.content.length).toBeGreaterThan(0); no.content.forEach((l) => expect(l.type).toBe('tableRow')); }
      if (no.type === 'tableRow') no.content.forEach((c) => expect(['tableHeader', 'tableCell']).toContain(c.type));
      if (no.type === 'bulletList' || no.type === 'taskList') expect(no.content.length).toBeGreaterThan(0);
      if (no.type === 'blocoEstudo') expect(no.content.length).toBeGreaterThan(0);
      if (no.type === 'tableHeader' || no.type === 'tableCell') expect(no.content[0].type).toBe('paragraph');
    });
  });

  it.each(MODELOS_PAGINA)('$nome: as tabelas têm todas as linhas com o mesmo número de colunas', (modelo) => {
    percorrer(modelo.doc(), (no) => {
      if (no.type === 'table') {
        const colunas = no.content.map((l) => l.content.length);
        expect(new Set(colunas).size).toBe(1);
      }
    });
  });

  it.each(MODELOS_PAGINA)('$nome: dá um documento que se guarda e volta a abrir igual', (modelo) => {
    const doc = modelo.doc();
    const { rico } = serializarNota(doc);
    expect(abrirNota({ rico })).toEqual(doc);
  });

  it.each(MODELOS_PAGINA)('$nome: sugere uma secção e uma folha que existem, e um título', (modelo) => {
    expect(SECCOES_PADRAO).toContain(modelo.seccao);
    if (modelo.folha) expect(FOLHAS).toContain(modelo.folha);
    expect(modelo.titulo(new Date(2026, 9, 7)).length).toBeGreaterThan(3);
    expect(modelo.esboco.length).toBeGreaterThan(0);
  });

  it('cada chamada devolve um documento novo (editar um não estraga o seguinte)', () => {
    const [modelo] = MODELOS_PAGINA;
    expect(modelo.doc()).toEqual(modelo.doc());
    expect(modelo.doc()).not.toBe(modelo.doc());
  });

  it('o caso prático tem a mesma estrutura dos Casos Práticos da app', () => {
    const texto = docParaTexto(modeloPorId('caso-pratico').doc());
    for (const parte of ['Factos', 'Questão jurídica', 'Enquadramento', 'Subsunção', 'Conclusão']) expect(texto).toContain(parte);
  });

  it('o modelo não traz matéria nem artigos inventados, só estrutura', () => {
    for (const modelo of MODELOS_PAGINA) {
      expect(docParaTexto(modelo.doc())).not.toMatch(/art\.?\s*\d|artigo\s+\d/i);
    }
  });

  it('o mapa mental abre numa folha de pontos', () => {
    expect(modeloPorId('mapa-mental').folha).toBe('pontos');
  });

  it('modeloPorId devolve nulo se não existir, e o título leva o dia', () => {
    expect(modeloPorId('xpto')).toBeNull();
    expect(rotuloDoDia(new Date(2026, 9, 7))).toBe('7 Out');
    expect(modeloPorId('resumo-aula').titulo(new Date(2026, 9, 7))).toBe('Resumo de aula · 7 Out');
  });
});
