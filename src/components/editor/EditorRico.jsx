// editor rico das anotações — texto formatado, blocos de estudo, tabelas e folha à escolha.
// o conteúdo é do próprio editor (não controlado): recebe o documento inicial e o pai pede-o
// com `ref.current.obterDoc()` na hora de guardar, por isso nunca se perde a última tecla
import { useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import { extensoes } from './extensoes.js';
import BarraEditor from './BarraEditor.jsx';
import CamadaDesenho from './CamadaDesenho.jsx';
import { BarraProcura, PainelIndice, FolhaFlashcard } from './FerramentasDaNota.jsx';
import { indiceDoDocumento, proximaOcorrencia } from '../../services/notaFerramentas.js';
import { bytesDoDocumento, classificarTamanho, folhaValida } from '../../services/notaRica.js';
import {
  lerDesenho, serializarDesenho, historicoInicial, adicionarTraco, apagarTracos, limparTudo,
  desfazer, refazer, tamanhoDoDesenhoEmBytes, alturaDoDesenho,
} from '../../services/desenho.js';
import './EditorRico.css';

// espaço livre que fica por baixo do desenho quando ela está a desenhar, para poder continuar (em unidades da página)
const ESPACO_LIVRE_UNIDADES = 600;

export default function EditorRico({ ref, valorInicial, folhaInicial, desenhoInicial = '', cadeiraId, aoMudarFolha, aoEscrever }) {
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
  const [painel, setPainel] = useState(null); // null | 'procurar' | 'indice'
  const [termo, setTermo] = useState('');
  const [selecaoParaFlashcard, setSelecaoParaFlashcard] = useState(null);
  const [aviso, setAviso] = useState('');
  const [, redesenhar] = useReducer((n) => n + 1, 0);

  const editor = useEditor({
    extensions: extensoes,
    content: valorInicial,
    editorProps: { attributes: { class: 'er-texto', spellcheck: 'true', 'aria-label': 'Texto da anotação' } },
    onUpdate: ({ editor: ed, transaction }) => {
      if (transaction.docChanged) aoEscrever?.();
      // medir o tamanho a cada tecla é caro numa nota grande: espera que ela pare um instante
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => { setBytesDoTexto(bytesDoDocumento(ed.getJSON())); redesenhar(); }, 400);
    },
  });

  const temSelecao = useEditorState({
    editor,
    selector: ({ editor: ed }) => !!ed && !ed.state.selection.empty
      && ed.state.doc.textBetween(ed.state.selection.from, ed.state.selection.to, ' ').trim().length > 2,
  });

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // ctrl+f (ou cmd+f) abre a procura da nota em vez da do browser, mas só com o cursor no texto
  useEffect(() => {
    if (!editor) return undefined;
    const aoTeclar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && editor.isFocused) { e.preventDefault(); setPainel('procurar'); }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [editor]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(''), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  function mudarTermo(novo) {
    setTermo(novo);
    editor.commands.pesquisar(novo);
    if (editor.storage.pesquisa.ocorrencias.length > 0) editor.commands.irParaOcorrencia(0);
    redesenhar();
  }

  function andarNasOcorrencias(delta) {
    const { ocorrencias, atual } = editor.storage.pesquisa;
    const novo = proximaOcorrencia(atual, ocorrencias.length, delta);
    if (novo >= 0) editor.commands.irParaOcorrencia(novo);
    redesenhar();
  }

  function fecharProcura() {
    setTermo('');
    editor?.commands.pesquisar('');
    setPainel(null);
  }

  // o índice leva ao n-ésimo título, pela mesma ordem em que o índice os lista
  function irParaTitulo(i) {
    const titulos = editor.view.dom.querySelectorAll('h1, h2, h3');
    titulos[i]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  useImperativeHandle(ref, () => ({
    obterDoc: () => editor?.getJSON(),
    obterDesenho: () => serializarDesenho(tracos),
    estaVazio: () => !editor || (editor.isEmpty && tracos.length === 0),
    // numa nota vazia o modelo ocupa o lugar do texto; numa nota com conteúdo entra no fim, sem apagar nada
    inserirModelo: (doc, folhaDoModelo) => {
      if (!editor) return;
      if (editor.isEmpty) {
        editor.commands.setContent(doc, { emitUpdate: true });
        if (folhaDoModelo && tracos.length === 0) { setFolha(folhaDoModelo); aoMudarFolha?.(folhaDoModelo); }
      } else {
        editor.chain().focus('end').insertContent(doc.content).run();
      }
    },
  }), [editor, tracos, aoMudarFolha]);

  function mudarFolha(nova) {
    setFolha(nova);
    aoMudarFolha?.(nova);
  }

  if (!editor) return null;

  function abrirSelecao() {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  }

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
            ferramentas={{
              painel,
              procurar: () => (painel === 'procurar' ? fecharProcura() : setPainel('procurar')),
              indice: () => { if (painel === 'procurar') fecharProcura(); setPainel(painel === 'indice' ? null : 'indice'); },
              flashcard: () => setSelecaoParaFlashcard(abrirSelecao()),
            }}
          />
        )}

      {painel === 'procurar' && !foco && (
        <BarraProcura
          termo={termo}
          total={editor.storage.pesquisa.ocorrencias.length}
          atual={editor.storage.pesquisa.atual}
          aoMudar={mudarTermo}
          aoAvancar={andarNasOcorrencias}
          aoFechar={fecharProcura}
        />
      )}
      {painel === 'indice' && !foco && (
        <PainelIndice itens={indiceDoDocumento(editor.getJSON())} aoIr={irParaTitulo} aoFechar={() => setPainel(null)} />
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

      {temSelecao && !modoDesenho && !selecaoParaFlashcard && !foco && (
        <button type="button" className="er-selecao" onMouseDown={(e) => e.preventDefault()} onClick={() => setSelecaoParaFlashcard(abrirSelecao())}>
          Criar flashcard com isto
        </button>
      )}
      {selecaoParaFlashcard !== null && (
        <FolhaFlashcard
          selecao={selecaoParaFlashcard}
          cadeiraInicial={cadeiraId}
          aoFechar={() => setSelecaoParaFlashcard(null)}
          aoGuardado={() => { setSelecaoParaFlashcard(null); setAviso('Flashcard criado'); }}
        />
      )}
      {aviso && <p className="er-toast" role="status">{aviso}</p>}

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
