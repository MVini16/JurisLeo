// editor rico das anotações — texto formatado, blocos de estudo, tabelas e folha à escolha.
// o conteúdo é do próprio editor (não controlado): recebe o documento inicial e o pai pede-o
// com `ref.current.obterDoc()` na hora de guardar, por isso nunca se perde a última tecla
import { useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import { extensoes } from './extensoes.js';
import BarraEditor from './BarraEditor.jsx';
import CamadaDesenho from './CamadaDesenho.jsx';
import { BarraProcura, PesquisaSpotlight, ChipsIndice, MenuSelecao, FolhaFlashcard } from './FerramentasDaNota.jsx';
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
  const [procurarAberto, setProcurarAberto] = useState(false);
  const [indiceAberto, setIndiceAberto] = useState(false);
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

  // o texto selecionado (se houver um bocado a sério), para mostrar o menu junto dele
  const selecao = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed || ed.state.selection.empty) return null;
      const { from, to } = ed.state.selection;
      return ed.state.doc.textBetween(from, to, ' ').trim().length > 2 ? { from, to } : null;
    },
  });

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // ctrl+f (ou cmd+f) abre a procura da nota em vez da do browser, mas só com o cursor no texto
  useEffect(() => {
    if (!editor) return undefined;
    const aoTeclar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && editor.isFocused) { e.preventDefault(); setProcurarAberto(true); }
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
    setProcurarAberto(false);
  }

  // escolher uma frase da lista: fecha a caixa, deixa o termo marcado e a pílula para andar entre ocorrências
  function escolherResultado(i) {
    editor.commands.irParaOcorrencia(i);
    setProcurarAberto(false);
    redesenhar();
  }

  // o menu da seleção acompanha o scroll
  useEffect(() => {
    if (!selecao) return undefined;
    window.addEventListener('scroll', redesenhar, true);
    window.addEventListener('resize', redesenhar);
    return () => { window.removeEventListener('scroll', redesenhar, true); window.removeEventListener('resize', redesenhar); };
  }, [selecao]);

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

  function marcarSelecao() {
    editor.chain().focus().toggleHighlight({ color: 'var(--nota-marca-amarelo)' }).run();
  }

  function copiarSelecao() {
    navigator.clipboard?.writeText(abrirSelecao()).then(() => setAviso('Copiado'), () => setAviso('Não consegui copiar'));
  }

  // as frases onde o termo aparece, com um bocado de texto antes e depois (para a caixa de procura)
  const resultados = (() => {
    if (!procurarAberto) return [];
    const { ocorrencias } = editor.storage.pesquisa;
    const doc = editor.state.doc;
    return ocorrencias.slice(0, 50).map((o) => ({
      antes: doc.textBetween(Math.max(0, o.from - 28), o.from, ' '),
      achado: doc.textBetween(o.from, o.to, ' '),
      depois: doc.textBetween(o.to, Math.min(doc.content.size, o.to + 40), ' '),
    }));
  })();

  let posicaoMenu = null;
  if (selecao && !modoDesenho && selecaoParaFlashcard === null && !foco) {
    try {
      const ponto = editor.view.coordsAtPos(selecao.to);
      posicaoMenu = {
        top: Math.min(ponto.bottom + 10, window.innerHeight - 56),
        left: Math.max(8, Math.min(ponto.left - 80, window.innerWidth - 232)),
      };
    } catch { /* a seleção saiu do ecrã: sem menu */ }
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
              procurarAtivo: procurarAberto || !!termo.trim(),
              indiceAtivo: indiceAberto,
              procurar: () => setProcurarAberto(true),
              indice: () => setIndiceAberto((a) => !a),
              flashcard: () => setSelecaoParaFlashcard(abrirSelecao()),
            }}
          />
        )}

      {indiceAberto && !foco && (
        <ChipsIndice itens={indiceDoDocumento(editor.getJSON())} aoIr={irParaTitulo} aoFechar={() => setIndiceAberto(false)} />
      )}
      {!procurarAberto && termo.trim() && !foco && (
        <BarraProcura
          termo={termo}
          total={editor.storage.pesquisa.ocorrencias.length}
          atual={editor.storage.pesquisa.atual}
          aoAvancar={andarNasOcorrencias}
          aoFechar={fecharProcura}
          aoReabrir={() => setProcurarAberto(true)}
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

      {posicaoMenu && (
        <MenuSelecao posicao={posicaoMenu} aoFlashcard={() => setSelecaoParaFlashcard(abrirSelecao())} aoMarcar={marcarSelecao} aoCopiar={copiarSelecao} />
      )}
      {procurarAberto && (
        <PesquisaSpotlight termo={termo} resultados={resultados} aoMudar={mudarTermo} aoEscolher={escolherResultado} aoFechar={() => { if (!termo.trim()) fecharProcura(); else setProcurarAberto(false); }} />
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
