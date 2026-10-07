// extensões do editor rico das notas: o que o tiptap já traz, mais dois extras feitos à medida
// (bloco de estudo e artigo de lei)
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import { Node, Mark, mergeAttributes } from '@tiptap/react';

// os blocos de estudo que a leonor pode meter numa nota (o rótulo vem do css, por tipo)
export const TIPOS_BLOCO = [
  { tipo: 'conceito', rotulo: 'Conceito' },
  { tipo: 'regra', rotulo: 'Regra' },
  { tipo: 'excecao', rotulo: 'Exceção' },
  { tipo: 'prazo', rotulo: 'Prazo' },
  { tipo: 'exemplo', rotulo: 'Exemplo' },
  { tipo: 'acordao', rotulo: 'Acórdão' },
  { tipo: 'pergunta', rotulo: 'Pergunta de frequência' },
];

// caixa colorida com um rótulo, que envolve parágrafos, listas, etc.
const BlocoEstudo = Node.create({
  name: 'blocoEstudo',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      tipo: {
        default: 'conceito',
        parseHTML: (el) => el.getAttribute('data-bloco'),
        renderHTML: (atributos) => ({ 'data-bloco': atributos.tipo }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-bloco]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      // clicar no mesmo tipo tira a caixa; noutro tipo muda a cor; sem caixa, envolve
      alternarBloco: (tipo) => ({ editor, commands }) => {
        if (editor.isActive('blocoEstudo', { tipo })) return commands.lift('blocoEstudo');
        if (editor.isActive('blocoEstudo')) return commands.updateAttributes('blocoEstudo', { tipo });
        return commands.wrapIn('blocoEstudo', { tipo });
      },
    };
  },
});

// "art. 483.º CC" e semelhantes, com ar de referência
const ArtigoDeLei = Mark.create({
  name: 'artigo',
  inclusive: false,

  parseHTML() {
    return [{ tag: 'span[data-artigo]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-artigo': '', class: 'nota-artigo' }), 0];
  },

  addCommands() {
    return {
      alternarArtigo: () => ({ commands }) => commands.toggleMark('artigo'),
    };
  },
});

import { Pesquisa } from './pesquisa.js';

export const extensoes = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
  }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color,
  FontSize,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit,
  Placeholder.configure({ placeholder: 'Escreve aqui o que deu na aula...' }),
  CharacterCount,
  BlocoEstudo,
  ArtigoDeLei,
  Pesquisa,
];
