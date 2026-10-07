// editor rico das anotações — texto formatado, blocos de estudo, tabelas e folha à escolha.
// o conteúdo é do próprio editor (não controlado): recebe o documento inicial e o pai pede-o
// com `ref.current.obterDoc()` na hora de guardar, por isso nunca se perde a última tecla
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { extensoes } from './extensoes.js';
import BarraEditor from './BarraEditor.jsx';
import CamadaDesenho from './CamadaDesenho.jsx';
import { bytesDoDocumento, classificarTamanho, folhaValida } from '../../services/notaRica.js';
import {
  lerDesenho, serializarDesenho, historicoInicial, adicionarTraco, apagarTracos, limparTudo,
  desfazer, refazer, tamanhoDoDesenhoEmBytes, alturaDoDesenho,
} from '../../services/desenho.js';
import './EditorRico.css';

// espaço livre que fica por baixo do desenho quando ela está a desenhar, para poder continuar (em unidades da página)
const ESPACO_LIVRE_UNIDADES = 600;

export default function EditorRico({ ref, valorInicial, folhaInicial, desenhoInicial = '', aoMudarFolha, aoEscrever }) {
  const [folha, setFolha] = useState(() => folhaValida(folhaInicial));
  const [foco, setFoco] = useState(false);
  const [bytesDoTexto, setBytesDoTexto] = useState(() => bytesDoDocumento(valorInicial));
  const [modoDesenho, setModoDesenho] = useState(false);
  const [historico, setHistorico] = useState(() => historicoInicial(lerDesenho(desenhoInicial)));
  const [ferramenta, setFerramenta] = useState({ tipo: 'caneta', cor: 'tinta', espessura: 2, soCaneta: false });
  const tracos = historico.tracos;
  const tamanho = useMemo(() => classificarTamanho(bytesDoTexto + tamanhoDoDesenhoEmBytes(tracos)), [bytesDoTexto, tracos]);
  const alturaUnidades = useMemo(() => alturaDoDesenho(tracos), [tracos]);
  const temporizador = useRef(null);

  const editor = useEditor({
    extensions: extensoes,
    content: valorInicial,
    editorProps: { attributes: { class: 'er-texto', spellcheck: 'true', 'aria-label': 'Texto da anotação' } },
    onUpdate: ({ editor: ed, transaction }) => {
      if (transaction.docChanged) aoEscrever?.();
      // medir o tamanho a cada tecla é caro numa nota grande: espera que ela pare um instante
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setBytesDoTexto(bytesDoDocumento(ed.getJSON())), 400);
    },
  });

  useEffect(() => () => clearTimeout(temporizador.current), []);

  useImperativeHandle(ref, () => ({
    obterDoc: () => editor?.getJSON(),
    obterDesenho: () => serializarDesenho(tracos),
  }), [editor, tracos]);

  function mudarFolha(nova) {
    setFolha(nova);
    aoMudarFolha?.(nova);
  }

  if (!editor) return null;

  const desenho = {
    ferramenta,
    mudarFerramenta: (parcial) => setFerramenta((f) => ({ ...f, ...parcial })),
    numTracos: tracos.length,
    podeDesfazer: historico.passado.length > 0,
    podeRefazer: historico.futuro.length > 0,
    desfazer: () => setHistorico(desfazer),
    refazer: () => setHistorico(refazer),
    limpar: () => setHistorico(limparTudo),
  };

  return (
    <div className={`er ${foco ? 'er--foco' : ''}`}>
      {foco
        ? <button type="button" className="er-sair-foco" onClick={() => setFoco(false)}>Sair do modo foco</button>
        : (
          <BarraEditor
            editor={editor}
            folha={folha}
            aoMudarFolha={mudarFolha}
            aoFoco={(ligado) => { setFoco(ligado); if (ligado) setModoDesenho(false); }}
            desenho={desenho}
            aoMudarAba={(aba) => setModoDesenho(aba === 'Desenhar')}
          />
        )}

      <div
        className="er-folha"
        data-folha={folha}
        style={{ '--desenho-h': alturaUnidades + (modoDesenho ? ESPACO_LIVRE_UNIDADES : 0) }}
      >
        <EditorContent editor={editor} />
        <CamadaDesenho
          tracos={tracos}
          ativo={modoDesenho}
          ferramenta={ferramenta}
          aoAdicionar={(traco) => { setHistorico((h) => adicionarTraco(h, traco)); aoEscrever?.(); }}
          aoApagar={(indices) => setHistorico((h) => apagarTracos(h, indices))}
        />
      </div>

      {tamanho.estado !== 'ok' && (
        <p className={`er-aviso er-aviso--${tamanho.estado}`} role="alert">
          {tamanho.estado === 'perto'
            ? 'Esta nota está a ficar grande (texto e desenho). Divide-a em duas páginas antes de chegar ao limite.'
            : 'Esta nota ficou grande demais para guardar. Divide-a em duas páginas.'}
        </p>
      )}
    </div>
  );
}
