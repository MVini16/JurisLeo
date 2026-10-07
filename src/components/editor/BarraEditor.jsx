// barra de ferramentas do editor, em separadores (Base, Parágrafo, Inserir, Vista) — as opções
// ficam agrupadas e só o separador aberto ocupa espaço, para sobrar ecrã para o texto
import { useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { TIPOS_BLOCO } from './extensoes.js';
import { CORES as CORES_DO_DESENHO, LARGURAS } from '../../services/desenho.js';

const ABAS = ['Base', 'Parágrafo', 'Inserir', 'Desenhar', 'Vista'];
const NOMES_COR = { tinta: 'Preto', azul: 'Azul', vinho: 'Vinho', verde: 'Verde', ouro: 'Dourado', roxo: 'Roxo' };
const FERRAMENTAS = [['caneta', 'Caneta'], ['marcador', 'Marcador'], ['borracha', 'Borracha']];
const NOMES_ESPESSURA = ['Fina', 'Média', 'Grossa'];

const CORES = [['vinho', 'Vinho'], ['azul', 'Azul'], ['verde', 'Verde'], ['ouro', 'Dourado'], ['roxo', 'Roxo']];
const MARCAS = [['amarelo', 'Amarelo'], ['rosa', 'Rosa'], ['verde', 'Verde'], ['azul', 'Azul']];
const TAMANHOS = [['13px', 'Pequeno'], [null, 'Normal'], ['21px', 'Grande']];
const FOLHAS = [['pautado', 'Pautado'], ['quadriculado', 'Quadriculado'], ['pontos', 'Pontos'], ['branco', 'Branco']];

// o botão não rouba o foco ao texto (senão a seleção desaparecia ao tocar)
function Botao({ ativo, desativado, titulo, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`er-btn ${ativo ? 'ativo' : ''} ${className}`}
      title={titulo}
      aria-label={titulo}
      aria-pressed={ativo === undefined ? undefined : !!ativo}
      disabled={desativado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function BarraEditor({ editor, folha, aoMudarFolha, aoFoco, desenho, aoMudarAba }) {
  const [aba, setAba] = useState('Base');
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const noDesenho = aba === 'Desenhar';

  const e = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      const centro = ed.isActive({ textAlign: 'center' });
      const direita = ed.isActive({ textAlign: 'right' });
      const justificado = ed.isActive({ textAlign: 'justify' });
      return {
        negrito: ed.isActive('bold'),
        italico: ed.isActive('italic'),
        sublinhado: ed.isActive('underline'),
        riscado: ed.isActive('strike'),
        marca: ed.isActive('highlight'),
        artigo: ed.isActive('artigo'),
        h1: ed.isActive('heading', { level: 1 }),
        h2: ed.isActive('heading', { level: 2 }),
        h3: ed.isActive('heading', { level: 3 }),
        lista: ed.isActive('bulletList'),
        numerada: ed.isActive('orderedList'),
        tarefas: ed.isActive('taskList'),
        citacao: ed.isActive('blockquote'),
        centro,
        direita,
        justificado,
        esquerda: !centro && !direita && !justificado,
        tabela: ed.isActive('table'),
        bloco: ed.isActive('blocoEstudo') ? ed.getAttributes('blocoEstudo').tipo : null,
        desfazer: ed.can().undo(),
        refazer: ed.can().redo(),
        // na primeira renderização o armazenamento da extensão ainda pode não existir
        palavras: ed.storage.characterCount?.words?.() ?? 0,
        carateres: ed.storage.characterCount?.characters?.() ?? 0,
      };
    },
  });

  const cadeia = () => editor.chain().focus();
  const itemDeLista = e.tarefas ? 'taskItem' : 'listItem';

  return (
    <div className="er-barra" role="toolbar" aria-label="Formatação">
      <div className="er-barra__topo">
        <div className="er-abas" role="tablist">
          {ABAS.map((a) => (
            <button
              key={a}
              role="tab"
              type="button"
              aria-selected={aba === a}
              className="er-aba"
              onClick={() => { setAba(a); setConfirmarLimpar(false); aoMudarAba?.(a); }}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="er-historico">
          {/* no separador do desenho, desfazer e refazer mexem nos traços e não no texto */}
          <Botao titulo={noDesenho ? 'Desfazer traço' : 'Desfazer'} desativado={noDesenho ? !desenho.podeDesfazer : !e.desfazer} onClick={() => (noDesenho ? desenho.desfazer() : cadeia().undo().run())}>↶</Botao>
          <Botao titulo={noDesenho ? 'Refazer traço' : 'Refazer'} desativado={noDesenho ? !desenho.podeRefazer : !e.refazer} onClick={() => (noDesenho ? desenho.refazer() : cadeia().redo().run())}>↷</Botao>
        </div>
      </div>

      <div className="er-barra__corpo" key={aba}>
        {aba === 'Base' && (
          <>
            <Botao ativo={e.negrito} titulo="Negrito" onClick={() => cadeia().toggleBold().run()}><b>B</b></Botao>
            <Botao ativo={e.italico} titulo="Itálico" onClick={() => cadeia().toggleItalic().run()}><i>I</i></Botao>
            <Botao ativo={e.sublinhado} titulo="Sublinhado" onClick={() => cadeia().toggleUnderline().run()}><u>S</u></Botao>
            <Botao ativo={e.riscado} titulo="Riscado" onClick={() => cadeia().toggleStrike().run()}><s>R</s></Botao>
            <span className="er-sep" />
            <span className="er-rotulo">Marca-texto</span>
            {MARCAS.map(([id, nome]) => (
              <Botao key={id} titulo={`Marca-texto ${nome}`} className="er-amostra" onClick={() => cadeia().toggleHighlight({ color: `var(--nota-marca-${id})` }).run()}>
                <span className="er-amostra__cor" style={{ background: `var(--nota-marca-${id})` }} />
              </Botao>
            ))}
            {e.marca && <Botao titulo="Tirar marca-texto" onClick={() => cadeia().unsetHighlight().run()}>✕</Botao>}
            <span className="er-sep" />
            <span className="er-rotulo">Cor</span>
            {CORES.map(([id, nome]) => (
              <Botao key={id} titulo={`Texto ${nome}`} className="er-amostra" onClick={() => cadeia().setColor(`var(--nota-cor-${id})`).run()}>
                <span className="er-amostra__cor" style={{ background: `var(--nota-cor-${id})` }} />
              </Botao>
            ))}
            <Botao titulo="Cor normal" onClick={() => cadeia().unsetColor().run()}>A</Botao>
            <span className="er-sep" />
            <span className="er-rotulo">Tamanho</span>
            {TAMANHOS.map(([valor, nome]) => (
              <Botao key={nome} titulo={`Letra ${nome.toLowerCase()}`} onClick={() => (valor ? cadeia().setFontSize(valor).run() : cadeia().unsetFontSize().run())}>
                <span style={{ fontSize: valor || '17px' }}>A</span>
              </Botao>
            ))}
          </>
        )}

        {aba === 'Parágrafo' && (
          <>
            <Botao ativo={e.h1} titulo="Título 1" onClick={() => cadeia().toggleHeading({ level: 1 }).run()}>T1</Botao>
            <Botao ativo={e.h2} titulo="Título 2" onClick={() => cadeia().toggleHeading({ level: 2 }).run()}>T2</Botao>
            <Botao ativo={e.h3} titulo="Título 3" onClick={() => cadeia().toggleHeading({ level: 3 }).run()}>T3</Botao>
            <span className="er-sep" />
            <Botao ativo={e.lista} titulo="Lista" onClick={() => cadeia().toggleBulletList().run()}>• Lista</Botao>
            <Botao ativo={e.numerada} titulo="Lista numerada" onClick={() => cadeia().toggleOrderedList().run()}>1. Lista</Botao>
            <Botao ativo={e.tarefas} titulo="Checklist" onClick={() => cadeia().toggleTaskList().run()}>☐ Checklist</Botao>
            <Botao titulo="Recuar" onClick={() => cadeia().liftListItem(itemDeLista).run()}>⇤</Botao>
            <Botao titulo="Avançar" onClick={() => cadeia().sinkListItem(itemDeLista).run()}>⇥</Botao>
            <span className="er-sep" />
            <Botao ativo={e.citacao} titulo="Citação" onClick={() => cadeia().toggleBlockquote().run()}>“ ”</Botao>
            <span className="er-sep" />
            <Botao ativo={e.esquerda} titulo="Alinhar à esquerda" onClick={() => cadeia().setTextAlign('left').run()}>⇠</Botao>
            <Botao ativo={e.centro} titulo="Centrar" onClick={() => cadeia().setTextAlign('center').run()}>↔</Botao>
            <Botao ativo={e.direita} titulo="Alinhar à direita" onClick={() => cadeia().setTextAlign('right').run()}>⇢</Botao>
            <Botao ativo={e.justificado} titulo="Justificar" onClick={() => cadeia().setTextAlign('justify').run()}>☰</Botao>
          </>
        )}

        {aba === 'Inserir' && (
          <>
            <span className="er-rotulo">Blocos de estudo</span>
            {TIPOS_BLOCO.map(({ tipo, rotulo }) => (
              <Botao key={tipo} ativo={e.bloco === tipo} titulo={rotulo} className={`er-bloco er-bloco--${tipo}`} onClick={() => cadeia().alternarBloco(tipo).run()}>
                {rotulo}
              </Botao>
            ))}
            <span className="er-sep" />
            <Botao ativo={e.artigo} titulo="Marcar seleção como artigo de lei" onClick={() => cadeia().alternarArtigo().run()}>§ Artigo</Botao>
            <Botao titulo="Linha divisória" onClick={() => cadeia().setHorizontalRule().run()}>— Linha</Botao>
            <Botao titulo="Tabela 3x3" onClick={() => cadeia().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>▦ Tabela</Botao>
            {e.tabela && (
              <>
                <Botao titulo="Coluna à direita" onClick={() => cadeia().addColumnAfter().run()}>+ Coluna</Botao>
                <Botao titulo="Linha por baixo" onClick={() => cadeia().addRowAfter().run()}>+ Linha</Botao>
                <Botao titulo="Apagar coluna" onClick={() => cadeia().deleteColumn().run()}>− Coluna</Botao>
                <Botao titulo="Apagar linha" onClick={() => cadeia().deleteRow().run()}>− Linha</Botao>
                <Botao titulo="Apagar tabela" onClick={() => cadeia().deleteTable().run()}>Apagar tabela</Botao>
              </>
            )}
          </>
        )}

        {aba === 'Desenhar' && (
          <>
            {FERRAMENTAS.map(([tipo, nome]) => (
              <Botao key={tipo} ativo={desenho.ferramenta.tipo === tipo} titulo={nome} onClick={() => desenho.mudarFerramenta({ tipo })}>{nome}</Botao>
            ))}
            {desenho.ferramenta.tipo !== 'borracha' && (
              <>
                <span className="er-sep" />
                {NOMES_ESPESSURA.map((nome, i) => (
                  <Botao key={nome} ativo={desenho.ferramenta.espessura === i + 1} titulo={`Espessura ${nome.toLowerCase()}`} onClick={() => desenho.mudarFerramenta({ espessura: i + 1 })}>
                    <span className="er-espessura" style={{ height: `${LARGURAS.caneta[i] / 2}px` }} />
                  </Botao>
                ))}
                <span className="er-sep" />
                {CORES_DO_DESENHO.map((id) => (
                  <Botao key={id} ativo={desenho.ferramenta.cor === id} titulo={`Cor ${NOMES_COR[id]}`} className="er-amostra" onClick={() => desenho.mudarFerramenta({ cor: id })}>
                    <span className="er-amostra__cor" style={{ background: `var(--nota-cor-${id})` }} />
                  </Botao>
                ))}
              </>
            )}
            <span className="er-sep" />
            <Botao ativo={desenho.ferramenta.soCaneta} titulo="Só a caneta desenha, o dedo faz scroll" onClick={() => desenho.mudarFerramenta({ soCaneta: !desenho.ferramenta.soCaneta })}>Só Apple Pencil</Botao>
            <span className="er-sep" />
            {confirmarLimpar ? (
              <>
                <span className="er-rotulo">Apagar tudo?</span>
                <Botao titulo="Sim, apagar o desenho todo" onClick={() => { desenho.limpar(); setConfirmarLimpar(false); }}>Sim</Botao>
                <Botao titulo="Não apagar" onClick={() => setConfirmarLimpar(false)}>Não</Botao>
              </>
            ) : (
              <Botao titulo="Apagar o desenho todo" desativado={desenho.numTracos === 0} onClick={() => setConfirmarLimpar(true)}>Limpar</Botao>
            )}
            <span className="er-contagem">{desenho.numTracos} {desenho.numTracos === 1 ? 'traço' : 'traços'}</span>
          </>
        )}

        {aba === 'Vista' && (
          <>
            <span className="er-rotulo">Folha</span>
            {FOLHAS.map(([id, nome]) => (
              <Botao key={id} ativo={folha === id} titulo={`Folha ${nome.toLowerCase()}`} onClick={() => aoMudarFolha(id)}>{nome}</Botao>
            ))}
            <span className="er-sep" />
            <Botao titulo="Esconder tudo menos o texto" onClick={() => aoFoco(true)}>Modo foco</Botao>
            <span className="er-contagem">{e.palavras} palavras · {e.carateres} carateres</span>
          </>
        )}
      </div>
    </div>
  );
}
