// editor rico das anotações — texto formatado, blocos de estudo, tabelas e folha à escolha.
// o conteúdo é do próprio editor (não controlado): recebe o documento inicial e o pai pede-o
// com `ref.current.obterDoc()` na hora de guardar, por isso nunca se perde a última tecla
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { extensoes } from './extensoes.js';
import BarraEditor from './BarraEditor.jsx';
import { estadoTamanho, folhaValida } from '../../services/notaRica.js';
import './EditorRico.css';

export default function EditorRico({ ref, valorInicial, folhaInicial, aoMudarFolha, aoEscrever }) {
  const [folha, setFolha] = useState(() => folhaValida(folhaInicial));
  const [foco, setFoco] = useState(false);
  const [tamanho, setTamanho] = useState(() => estadoTamanho(valorInicial));
  const temporizador = useRef(null);

  const editor = useEditor({
    extensions: extensoes,
    content: valorInicial,
    editorProps: { attributes: { class: 'er-texto', spellcheck: 'true', 'aria-label': 'Texto da anotação' } },
    onUpdate: ({ editor: ed, transaction }) => {
      if (transaction.docChanged) aoEscrever?.();
      // medir o tamanho a cada tecla é caro numa nota grande: espera que ela pare um instante
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setTamanho(estadoTamanho(ed.getJSON())), 400);
    },
  });

  useEffect(() => () => clearTimeout(temporizador.current), []);

  useImperativeHandle(ref, () => ({
    obterDoc: () => editor?.getJSON(),
  }), [editor]);

  function mudarFolha(nova) {
    setFolha(nova);
    aoMudarFolha?.(nova);
  }

  if (!editor) return null;

  return (
    <div className={`er ${foco ? 'er--foco' : ''}`}>
      {foco
        ? <button type="button" className="er-sair-foco" onClick={() => setFoco(false)}>Sair do modo foco</button>
        : <BarraEditor editor={editor} folha={folha} aoMudarFolha={mudarFolha} aoFoco={setFoco} />}

      <div className="er-folha" data-folha={folha}>
        <EditorContent editor={editor} />
      </div>

      {tamanho.estado !== 'ok' && (
        <p className={`er-aviso er-aviso--${tamanho.estado}`} role="alert">
          {tamanho.estado === 'perto'
            ? 'Esta nota está a ficar grande. Divide-a em duas páginas antes de chegar ao limite.'
            : 'Esta nota ficou grande demais para guardar. Divide-a em duas páginas.'}
        </p>
      )}
    </div>
  );
}
