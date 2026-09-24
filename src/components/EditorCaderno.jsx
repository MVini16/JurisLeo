// editor do caderno digital (tiptap) — barra curta com painéis (preview aprovado: editor c)
// guarda o documento formatado (json) e, ao lado, o texto simples que o resto da app lê
// o react escapa tudo: o documento é desenhado pelo tiptap a partir do json, nunca com dangerouslySetInnerHTML
import { useState, useMemo, useEffect, useRef } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import { mapaDeTexto, intervaloNoDoc, intervaloNoTexto, normalizarEstilo, contarPalavras } from '../services/editorTexto.js';
import { LETRAS, PAPEIS, TAMANHO_MIN, TAMANHO_MAX, TAMANHO_PADRAO_MANUSCRITA, CORES_TEXTO, CORES_DESTAQUE } from '../data/caderno.js';
import RevisaoTexto from './RevisaoTexto.jsx';
import Significado from './Significado.jsx';
import './RevisaoTexto.css';
import './EditorCaderno.css';

// painel de baixo (a mesma folha da revisão), com título e "fechar"
function Painel({ titulo, onFechar, children }) {
  const fechar = useRef(null);
  useEffect(() => { fechar.current?.focus(); }, []);
  return (
    <div className="revisao-fundo revisao-fundo--folha" onClick={onFechar}>
      <div className="revisao-folha" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <span className="revisao-folha__pega" aria-hidden="true" />
        <div className="revisao-folha__topo">
          <strong className="revisao-folha__titulo">{titulo}</strong>
          <button ref={fechar} type="button" className="revisao-botao revisao-botao--texto" onClick={onFechar}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// botão de formatação: aria-pressed diz ao leitor de ecrã se está ligado
function Botao({ ativo = false, onClick, rotulo, children, className = '' }) {
  return (
    <button
      type="button"
      className={`caderno-btn ${ativo ? 'ativo' : ''} ${className}`}
      aria-pressed={ativo}
      aria-label={rotulo}
      title={rotulo}
      // não tira o foco do editor, para a seleção não se perder
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// textoInicial: o `conteudo` guardado, que é o mesmo texto que o mapa do documento dá (evita atualizar o estado a meio da criação)
export default function EditorCaderno({ docInicial, textoInicial = '', estilo, onMudar, onEstilo, placeholder = 'Escreve aqui o que deu na aula...' }) {
  const [painel, setPainel] = useState(null);
  const est = normalizarEstilo(estilo);
  const [texto, setTexto] = useState(textoInicial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: docInicial,
    onUpdate: ({ editor: ed }) => {
      // o texto simples sai do mesmo mapa que a revisão usa, para as posições baterem certo
      const t = mapaDeTexto(ed.state.doc).texto;
      setTexto(t);
      onMudar({ json: ed.getJSON(), texto: t });
    },
  });

  // o que está ligado onde está o cursor (para os botões mostrarem o estado)
  const ativo = useEditorState({
    editor,
    selector: ({ editor: ed }) => (ed ? {
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      underline: ed.isActive('underline'),
      strike: ed.isActive('strike'),
      highlight: ed.isActive('highlight'),
      bulletList: ed.isActive('bulletList'),
      orderedList: ed.isActive('orderedList'),
      taskList: ed.isActive('taskList'),
      blockquote: ed.isActive('blockquote'),
      h1: ed.isActive('heading', { level: 1 }),
      h2: ed.isActive('heading', { level: 2 }),
      h3: ed.isActive('heading', { level: 3 }),
      alinhamento: ['left', 'center', 'right', 'justify'].find((a) => ed.isActive({ textAlign: a })) ?? 'left',
      podeDesfazer: ed.can().undo(),
      podeRefazer: ed.can().redo(),
    } : {}),
  }) ?? {};

  // adaptador para o "rever texto" e o "significado": posições no texto simples ↔ posições no documento
  const campo = useMemo(() => {
    if (!editor) return null;
    return {
      selecao: () => {
        const { from, to } = editor.state.selection;
        return intervaloNoTexto(mapaDeTexto(editor.state.doc), from, to);
      },
      selecionar: (inicio, fim) => {
        const r = intervaloNoDoc(mapaDeTexto(editor.state.doc), inicio, fim);
        if (r) editor.chain().focus().setTextSelection({ from: r.de, to: r.ate }).scrollIntoView().run();
      },
      // insertText mantém a formatação à volta (uma palavra a negrito continua a negrito)
      substituir: (inicio, fim, troca) => {
        const r = intervaloNoDoc(mapaDeTexto(editor.state.doc), inicio, fim);
        if (!r) return;
        const tr = troca ? editor.state.tr.insertText(troca, r.de, r.ate) : editor.state.tr.delete(r.de, r.ate);
        editor.view.dispatch(tr);
      },
      desfazer: () => editor.commands.undo(),
    };
  }, [editor]);

  if (!editor) return null;
  const c = () => editor.chain().focus();
  const letra = LETRAS.find((l) => l.id === est.letra) ?? LETRAS[0];

  function mudarLetra(id) {
    // a manuscrita pede letra maior; ao voltar para outra, volta ao tamanho de base se estava no da manuscrita
    let tamanho = est.tamanho;
    if (id === 'manuscrita' && tamanho < TAMANHO_PADRAO_MANUSCRITA) tamanho = TAMANHO_PADRAO_MANUSCRITA;
    onEstilo({ ...est, letra: id, tamanho });
  }

  return (
    <div className="caderno-editor">
      <div className="caderno-barra" role="toolbar" aria-label="Formatação">
        <Botao rotulo="Letra, tamanho, cor e papel" onClick={() => setPainel('letra')} className="caderno-btn--aa">Aa</Botao>
        <Botao rotulo="Negrito" ativo={ativo.bold} onClick={() => c().toggleBold().run()}><strong>B</strong></Botao>
        <Botao rotulo="Destaque amarelo" ativo={ativo.highlight} onClick={() => c().toggleHighlight({ color: CORES_DESTAQUE[0].valor }).run()}>
          <span className="caderno-btn__marcador">A</span>
        </Botao>
        <Botao rotulo="Lista" ativo={ativo.bulletList} onClick={() => c().toggleBulletList().run()}>•≡</Botao>
        <Botao rotulo="Mais formatação" onClick={() => setPainel('mais')} className="caderno-btn--mais">+</Botao>
        <span className="caderno-barra__espaco" />
        <Botao rotulo="Desfazer" onClick={() => c().undo().run()}>↶</Botao>
      </div>

      <div
        className={`caderno-pagina caderno-papel--${est.papel}`}
        style={{ '--letra': letra.css, '--tamanho': `${est.tamanho}px` }}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="caderno-rodape">
        <div className="campo-ferramentas">
          {campo && <RevisaoTexto texto={texto} campo={campo} setTexto={() => {}} />}
          {campo && <Significado texto={texto} campo={campo} />}
        </div>
        <span className="caderno-contador">{contarPalavras(texto)} palavras</span>
      </div>

      {painel === 'letra' && (
        <Painel titulo="Letra e papel" onFechar={() => setPainel(null)}>
          <span className="caderno-painel__rotulo">Letra desta página</span>
          <div className="caderno-grelha caderno-grelha--3">
            {LETRAS.map((l) => (
              <button key={l.id} type="button" className={`caderno-opcao ${est.letra === l.id ? 'ativo' : ''}`} style={{ fontFamily: l.css }} aria-pressed={est.letra === l.id} onClick={() => mudarLetra(l.id)}>
                {l.nome}
              </button>
            ))}
          </div>

          <label className="caderno-painel__rotulo" htmlFor="caderno-tamanho">Tamanho: {est.tamanho}</label>
          <input
            id="caderno-tamanho"
            type="range"
            min={TAMANHO_MIN}
            max={TAMANHO_MAX}
            value={est.tamanho}
            onChange={(e) => onEstilo({ ...est, tamanho: Number(e.target.value) })}
          />

          <span className="caderno-painel__rotulo">Cor do texto selecionado</span>
          <div className="caderno-cores">
            {CORES_TEXTO.map((cor) => (
              <button
                key={cor.id}
                type="button"
                className="caderno-cor"
                style={{ '--cor': cor.valor ?? 'var(--text-light)' }}
                aria-label={cor.nome}
                title={cor.nome}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (cor.valor ? c().setColor(cor.valor).run() : c().unsetColor().run())}
              />
            ))}
          </div>

          <span className="caderno-painel__rotulo">Papel</span>
          <div className="caderno-grelha caderno-grelha--3">
            {PAPEIS.map((p) => (
              <button key={p.id} type="button" className={`caderno-opcao caderno-opcao--papel caderno-papel--${p.id} ${est.papel === p.id ? 'ativo' : ''}`} aria-pressed={est.papel === p.id} onClick={() => onEstilo({ ...est, papel: p.id })}>
                {p.nome}
              </button>
            ))}
          </div>
        </Painel>
      )}

      {painel === 'mais' && (
        <Painel titulo="Mais formatação" onFechar={() => setPainel(null)}>
          <span className="caderno-painel__rotulo">Texto</span>
          <div className="caderno-grelha caderno-grelha--4">
            <Botao rotulo="Itálico" ativo={ativo.italic} onClick={() => c().toggleItalic().run()}><em>I</em></Botao>
            <Botao rotulo="Sublinhado" ativo={ativo.underline} onClick={() => c().toggleUnderline().run()}><u>U</u></Botao>
            <Botao rotulo="Riscado" ativo={ativo.strike} onClick={() => c().toggleStrike().run()}><s>S</s></Botao>
            <Botao rotulo="Limpar formatação" onClick={() => c().unsetAllMarks().clearNodes().run()}>⌫</Botao>
          </div>

          <span className="caderno-painel__rotulo">Títulos</span>
          <div className="caderno-grelha caderno-grelha--4">
            <Botao rotulo="Título 1" ativo={ativo.h1} onClick={() => c().toggleHeading({ level: 1 }).run()}>H1</Botao>
            <Botao rotulo="Título 2" ativo={ativo.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Botao>
            <Botao rotulo="Título 3" ativo={ativo.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Botao>
            <Botao rotulo="Texto normal" onClick={() => c().setParagraph().run()}>¶</Botao>
          </div>

          <span className="caderno-painel__rotulo">Listas e blocos</span>
          <div className="caderno-grelha caderno-grelha--4">
            <Botao rotulo="Lista numerada" ativo={ativo.orderedList} onClick={() => c().toggleOrderedList().run()}>1≡</Botao>
            <Botao rotulo="Lista de tarefas" ativo={ativo.taskList} onClick={() => c().toggleTaskList().run()}>☑</Botao>
            <Botao rotulo="Citação" ativo={ativo.blockquote} onClick={() => c().toggleBlockquote().run()}>❝</Botao>
            <Botao rotulo="Linha divisória" onClick={() => c().setHorizontalRule().run()}>―</Botao>
          </div>

          <span className="caderno-painel__rotulo">Alinhamento</span>
          <div className="caderno-grelha caderno-grelha--4">
            {[['left', 'À esquerda', '⇤'], ['center', 'Ao centro', '↔'], ['right', 'À direita', '⇥'], ['justify', 'Justificado', '☰']].map(([a, nome, sim]) => (
              <Botao key={a} rotulo={nome} ativo={ativo.alinhamento === a} onClick={() => c().setTextAlign(a).run()}>{sim}</Botao>
            ))}
          </div>

          <span className="caderno-painel__rotulo">Marcador</span>
          <div className="caderno-cores">
            {CORES_DESTAQUE.map((cor) => (
              <button
                key={cor.id}
                type="button"
                className="caderno-cor caderno-cor--marcador"
                style={{ '--cor': cor.valor }}
                aria-label={`Marcador ${cor.nome.toLowerCase()}`}
                title={cor.nome}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => c().setHighlight({ color: cor.valor }).run()}
              />
            ))}
            <button type="button" className="revisao-botao revisao-botao--texto" onMouseDown={(e) => e.preventDefault()} onClick={() => c().unsetHighlight().run()}>Sem marcador</button>
          </div>

          <div className="caderno-grelha caderno-grelha--2">
            <button type="button" className="revisao-botao" disabled={!ativo.podeDesfazer} onClick={() => c().undo().run()}>↶ Desfazer</button>
            <button type="button" className="revisao-botao" disabled={!ativo.podeRefazer} onClick={() => c().redo().run()}>↷ Refazer</button>
          </div>
        </Painel>
      )}
    </div>
  );
}
