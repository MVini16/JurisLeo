// editor de uma anotação — criar ou editar
import { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacao } from '../hooks/useAnotacao.js';
import { useProvocacoes } from '../hooks/useProvocacoes.jsx';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import EditorRico from '../components/editor/EditorRico.jsx';
import ExportarNotas from '../components/exportar/ExportarNotas.jsx';
import SeletorModelos from '../components/editor/SeletorModelos.jsx';
import { paginasParaExportar } from '../services/exportarNotas.js';
import { lerDesenho } from '../services/desenho.js';
import { abrirNota, serializarNota, estadoTamanho, folhaValida, tamanhoEmBytes } from '../services/notaRica.js';
import { cadernoDaNota, seccaoDaNota, seccoesDoCaderno, seccoesPadrao, mesmoNome, normalizarNomeSeccao, CADERNO_LIVRE } from '../services/cadernos.js';
import { cadeirasS1, idsCadeiras, nomesCadernos } from '../data/dadosLeonor.js';
import './Anotacao.css';

export default function Anotacao() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacao, loading, nova, criar, guardar, apagar } = useAnotacao(id);

  if (!nova && loading) return <div className="anotacao-editor"><p className="anotacao-editor__loading">A carregar...</p></div>;
  if (!nova && !anotacao) return <div className="anotacao-editor"><p className="anotacao-editor__loading">Anotação não encontrada.</p></div>;

  return (
    <div className={`anotacao-editor ${darkMode ? 'dark' : ''}`}>
      <Formulario
        key={id}
        anotacao={anotacao}
        nova={nova}
        cadeiraInicial={location.state?.cadeiraId}
        seccaoInicial={location.state?.seccao}
        criar={criar}
        guardar={guardar}
        apagar={apagar}
        onVoltar={(cadernoId) => navigate(cadernoId ? `/cadernos/${cadernoId}` : '/anotacoes')}
      />
    </div>
  );
}

function Formulario({ anotacao, nova, cadeiraInicial, seccaoInicial, criar, guardar, apagar, onVoltar }) {
  const [titulo, setTitulo] = useState(anotacao?.titulo || '');
  // o caderno é a cadeira, ou "livre" para o que não pertence a nenhuma
  const [cadeiraId, setCadeiraId] = useState(() => (anotacao ? cadernoDaNota(anotacao, idsCadeiras) : (cadeiraInicial || cadeirasS1[0].id)));
  const [seccao, setSeccao] = useState(() => (anotacao
    ? seccaoDaNota(anotacao, cadernoDaNota(anotacao, idsCadeiras))
    : (normalizarNomeSeccao(seccaoInicial) || seccoesPadrao(cadeiraInicial)[0])));
  const [criandoSeccao, setCriandoSeccao] = useState(false);
  const [nomeNovaSeccao, setNomeNovaSeccao] = useState('');
  const { anotacoes: todasAsNotas } = useAnotacoes();
  const [exportacao, setExportacao] = useState(null);
  // numa nota nova a escolha de modelos aparece logo (pode fechar-se e escrever à vontade)
  const [modelosAbertos, setModelosAbertos] = useState(nova);
  // o texto do painel depende de a nota estar vazia na altura em que ele abre
  const [modelosEmNotaVazia, setModelosEmNotaVazia] = useState(nova);
  // o conteúdo vive dentro do editor; aqui só guardamos a folha e o que é preciso para abrir a nota
  const editorRef = useRef(null);
  const [docInicial] = useState(() => abrirNota(anotacao));
  const [folha, setFolha] = useState(() => folhaValida(anotacao?.folha));
  const [erroTamanho, setErroTamanho] = useState(false);
  const [tagsTexto, setTagsTexto] = useState((anotacao?.tags || []).join(', '));
  const [favorita, setFavorita] = useState(anotacao?.favorita || false);
  const [rascunho, setRascunho] = useState(anotacao?.rascunho ?? true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const { elemento: provocacao, aoEscrever } = useProvocacoes();

  const cadeira = cadeirasS1.find((c) => c.id === cadeiraId);
  const cor = cadeira?.cor || 'var(--gold)';

  // secções do caderno escolhido; a que está escolhida entra sempre, mesmo que ainda não tenha páginas
  const seccoesExistentes = seccoesDoCaderno(todasAsNotas, cadeiraId, idsCadeiras);
  const seccoes = seccoesExistentes.some((s) => mesmoNome(s, seccao)) ? seccoesExistentes : [...seccoesExistentes, seccao];

  // monta o que se pode exportar a partir do que está no ecrã agora (mesmo o que ainda não foi guardado)
  function abrirExportacao() {
    const atual = {
      id: anotacao?.id,
      titulo: titulo.trim(),
      cadeiraId,
      seccao,
      tags: tagsTexto.split(',').map((t) => t.trim()).filter(Boolean),
      doc: editorRef.current?.obterDoc() ?? docInicial,
      tracos: lerDesenho(editorRef.current?.obterDesenho() ?? anotacao?.desenho),
    };
    const nomeCaderno = nomesCadernos[cadeiraId];
    const base = { cadernoId: cadeiraId, seccao, atual, idsConhecidos: idsCadeiras, nomesCadernos };
    const paginasDe = (escopo) => paginasParaExportar(todasAsNotas, { ...base, escopo });
    setExportacao([
      { id: 'pagina', rotulo: 'Esta página', titulo: atual.titulo || 'Sem título', nomeBase: `${nomeCaderno} - ${atual.titulo || 'Sem título'}`, paginas: paginasDe('pagina') },
      { id: 'seccao', rotulo: `Secção ${seccao}`, titulo: `${nomeCaderno} · ${seccao}`, nomeBase: `${nomeCaderno} - ${seccao}`, paginas: paginasDe('seccao') },
      { id: 'caderno', rotulo: 'Caderno inteiro', titulo: nomeCaderno, nomeBase: nomeCaderno, paginas: paginasDe('caderno') },
    ]);
  }

  // aplica um modelo: o texto vai para o editor e, numa nota nova e vazia, ajusta também o título e a secção
  function usarModelo(modelo) {
    const vazio = editorRef.current?.estaVazio() ?? true;
    if (vazio) {
      if (!titulo.trim()) setTitulo(modelo.titulo(new Date()));
      const daSeccao = seccoesDoCaderno(todasAsNotas, cadeiraId, idsCadeiras).find((s) => mesmoNome(s, modelo.seccao));
      if (daSeccao) setSeccao(daSeccao);
    }
    editorRef.current?.inserirModelo(modelo.doc(), modelo.folha);
    setModelosAbertos(false);
  }

  function escolherCaderno(id) {
    setCadeiraId(id);
    // mantém a secção se também existir no outro caderno, senão volta à primeira
    const doNovo = seccoesDoCaderno(todasAsNotas, id, idsCadeiras);
    if (!doNovo.some((s) => mesmoNome(s, seccao))) setSeccao(seccoesPadrao(id)[0]);
  }

  function criarSeccao(evento) {
    evento.preventDefault();
    const nome = normalizarNomeSeccao(nomeNovaSeccao);
    if (nome) setSeccao(seccoes.find((s) => mesmoNome(s, nome)) ?? nome);
    setNomeNovaSeccao('');
    setCriandoSeccao(false);
  }

  function dadosAtuais() {
    const doc = editorRef.current?.obterDoc() ?? docInicial;
    return {
      titulo: titulo.trim(),
      cadeiraId,
      seccao,
      // o tipo antigo continua a ser guardado, para o que ainda o lê
      tipo: mesmoNome(seccao, 'Práticas') ? 'pratica' : 'teorica',
      ...serializarNota(doc),
      folha,
      desenho: editorRef.current?.obterDesenho() ?? (anotacao?.desenho ?? ''),
      tags: tagsTexto.split(',').map((t) => t.trim()).filter(Boolean),
      favorita,
      rascunho,
    };
  }

  async function handleGuardar() {
    if (!titulo.trim()) return;
    // o firestore não guarda documentos acima de 1 mb: avisa em vez de falhar em silêncio
    const doc = editorRef.current?.obterDoc() ?? docInicial;
    if (estadoTamanho(doc, tamanhoEmBytes(editorRef.current?.obterDesenho() ?? '')).estado === 'excedido') {
      setErroTamanho(true);
      return;
    }
    setErroTamanho(false);
    setGuardando(true);
    if (nova) {
      const novoId = await criar(dadosAtuais());
      setGuardando(false);
      if (novoId) onVoltar(cadeiraId);
    } else {
      await guardar(dadosAtuais());
      setGuardando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 1500);
    }
  }

  async function handleApagar() {
    await apagar();
    onVoltar(cadeiraId);
  }

  return (
    <>
      {provocacao}
      {exportacao && <ExportarNotas opcoes={exportacao} aoFechar={() => setExportacao(null)} />}
      <div className="anotacao-editor__header">
        <button className="anotacao-editor__voltar" onClick={() => onVoltar(cadeiraId)}>‹ {cadeira?.abrev ?? 'Livre'}</button>
        <button className="anotacao-editor__exportar" onClick={abrirExportacao}>Exportar</button>
        <button className={`anotacao-editor__estrela ${favorita ? 'ativa' : ''}`} onClick={() => setFavorita((f) => !f)}>
          {favorita ? '★' : '☆'}
        </button>
      </div>

      <input
        className="anotacao-editor__titulo"
        placeholder="Título da anotação"
        value={titulo}
        onChange={(e) => { setTitulo(e.target.value); aoEscrever(); }}
      />

      <div className="anotacao-editor__cadeiras">
        {cadeirasS1.map((c) => (
          <button
            key={c.id}
            className={`anotacao-editor__cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`}
            style={{ '--cor': c.cor }}
            onClick={() => escolherCaderno(c.id)}
          >
            {c.abrev}
          </button>
        ))}
        <button
          className={`anotacao-editor__cadeira-btn ${cadeiraId === CADERNO_LIVRE ? 'ativo' : ''}`}
          style={{ '--cor': 'var(--gold)' }}
          onClick={() => escolherCaderno(CADERNO_LIVRE)}
        >
          Livre
        </button>
      </div>

      <div className="anotacao-editor__seccoes" role="group" aria-label="Secção">
        {seccoes.map((s) => (
          <button
            key={s}
            className={`anotacao-editor__seccao-btn ${mesmoNome(s, seccao) ? 'ativo' : ''}`}
            style={{ '--cor': cor }}
            onClick={() => setSeccao(s)}
          >
            {s}
          </button>
        ))}
        {criandoSeccao ? (
          <form className="anotacao-editor__seccao-nova" onSubmit={criarSeccao}>
            <input
              autoFocus
              maxLength={40}
              placeholder="Nome da secção"
              aria-label="Nome da nova secção"
              value={nomeNovaSeccao}
              onChange={(e) => setNomeNovaSeccao(e.target.value)}
            />
            <button type="submit">Criar</button>
          </form>
        ) : (
          <button className="anotacao-editor__seccao-btn anotacao-editor__seccao-btn--nova" onClick={() => setCriandoSeccao(true)}>
            + Nova secção
          </button>
        )}
      </div>

      {modelosAbertos ? (
        <SeletorModelos aoEscolher={usarModelo} aoFechar={() => setModelosAbertos(false)} notaVazia={modelosEmNotaVazia} />
      ) : (
        <button
          className="anotacao-editor__modelos-btn"
          onClick={() => { setModelosEmNotaVazia(editorRef.current?.estaVazio() ?? true); setModelosAbertos(true); }}
        >
          + Modelo de página
        </button>
      )}

      <EditorRico
        ref={editorRef}
        valorInicial={docInicial}
        folhaInicial={folha}
        desenhoInicial={anotacao?.desenho ?? ''}
        aoMudarFolha={setFolha}
        aoEscrever={aoEscrever}
      />
      {erroTamanho && (
        <p className="anotacao-editor__erro" role="alert">
          Esta nota ficou grande demais para guardar. Divide-a em duas páginas e tenta outra vez.
        </p>
      )}

      <input
        className="anotacao-editor__tags"
        placeholder="Tags separadas por vírgula (ex: prescrição, boa fé)"
        value={tagsTexto}
        onChange={(e) => setTagsTexto(e.target.value)}
      />

      <label className="anotacao-editor__rascunho-linha">
        <input type="checkbox" checked={rascunho} onChange={(e) => setRascunho(e.target.checked)} />
        <span>Ainda é rascunho</span>
      </label>

      <div className="anotacao-editor__acoes">
        {!nova && (
          confirmarApagar ? (
            <div className="anotacao-editor__confirmar">
              <span>Apagar esta anotação?</span>
              <button className="anotacao-editor__btn-sim" onClick={handleApagar}>Sim</button>
              <button className="anotacao-editor__btn-nao" onClick={() => setConfirmarApagar(false)}>Não</button>
            </div>
          ) : (
            <button className="anotacao-editor__btn-apagar" onClick={() => setConfirmarApagar(true)}>Apagar</button>
          )
        )}
        <button className="anotacao-editor__btn-guardar" onClick={handleGuardar} disabled={guardando || !titulo.trim()}>
          {guardando ? 'A guardar...' : guardado ? '✓ Guardado' : nova ? 'Criar anotação' : 'Guardar'}
        </button>
      </div>
    </>
  );
}
