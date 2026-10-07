// extensão do editor que sublinha todas as ocorrências de um termo (sem ligar a acentos nem maiúsculas).
// o termo e a ocorrência atual ficam em `editor.storage.pesquisa`; as decorações não mexem no documento
import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { encontrarOcorrencias } from '../../services/notaFerramentas.js';

export const chavePesquisa = new PluginKey('pesquisa');

// as ocorrências no documento, em posições do editor. procura bloco a bloco, por isso apanha o termo mesmo
// quando está meio a negrito e meio normal
export function ocorrenciasNoDoc(doc, termo) {
  const achados = [];
  doc.descendants((no, pos) => {
    if (!no.isTextblock) return true;
    let texto = '';
    const posicoes = [];
    no.forEach((filho, desvio) => {
      if (filho.isText) {
        for (let i = 0; i < filho.text.length; i += 1) { texto += filho.text[i]; posicoes.push(pos + 1 + desvio + i); }
      } else { texto += '\n'; posicoes.push(-1); }
    });
    encontrarOcorrencias(texto, termo).forEach(({ de, ate }) => {
      const from = posicoes[de];
      const to = posicoes[ate - 1] + 1;
      if (from >= 0 && to > from) achados.push({ from, to });
    });
    return false;
  });
  return achados;
}

export const Pesquisa = Extension.create({
  name: 'pesquisa',

  addStorage() {
    return { termo: '', ocorrencias: [], atual: -1 };
  },

  addCommands() {
    return {
      // define o termo e recalcula; devolve true para o editor emitir a atualização das decorações
      pesquisar: (termo) => ({ tr, dispatch, editor }) => {
        editor.storage.pesquisa.termo = termo;
        editor.storage.pesquisa.ocorrencias = ocorrenciasNoDoc(tr.doc, termo);
        editor.storage.pesquisa.atual = editor.storage.pesquisa.ocorrencias.length > 0 ? 0 : -1;
        if (dispatch) dispatch(tr.setMeta(chavePesquisa, { recalcular: true }));
        return true;
      },
      // marca a ocorrência `indice` como a atual e leva-a ao ecrã
      irParaOcorrencia: (indice) => ({ tr, dispatch, editor }) => {
        const { ocorrencias } = editor.storage.pesquisa;
        const alvo = ocorrencias[indice];
        if (!alvo) return false;
        editor.storage.pesquisa.atual = indice;
        if (dispatch) dispatch(tr.setMeta(chavePesquisa, { recalcular: true }));
        const el = editor.view.domAtPos(alvo.from).node;
        (el.nodeType === 3 ? el.parentElement : el)?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const { storage } = this;
    return [
      new Plugin({
        key: chavePesquisa,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, antigo, _estadoAntigo, estadoNovo) {
            const pedido = tr.getMeta(chavePesquisa);
            if (!pedido && !tr.docChanged) return antigo;
            if (tr.docChanged && storage.termo) {
              storage.ocorrencias = ocorrenciasNoDoc(estadoNovo.doc, storage.termo);
              if (storage.atual >= storage.ocorrencias.length) storage.atual = storage.ocorrencias.length - 1;
            }
            if (!storage.termo) return DecorationSet.empty;
            return DecorationSet.create(estadoNovo.doc, storage.ocorrencias.map((o, i) => Decoration.inline(
              o.from, o.to, { class: i === storage.atual ? 'er-achado er-achado--atual' : 'er-achado' },
            )));
          },
        },
        props: { decorations(estado) { return chavePesquisa.getState(estado); } },
      }),
    ];
  },
});
