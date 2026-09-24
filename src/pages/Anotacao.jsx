// uma página do caderno digital — criar ou editar
// o editor com formatação carrega à parte (lazy), para o resto da app não ficar mais pesado
import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacao } from '../hooks/useAnotacao.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { useCasos } from '../hooks/useCasos.js';
import { ondeAparece } from '../services/backlinks.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import './Anotacao.css';
import Carregando from '../components/animacoes/Carregando.jsx';
import { useDivisorias } from '../hooks/useDivisorias.js';
import { divisoriaDaAnotacao, paginasDaDivisoria, ordemNova } from '../services/cadernos.js';
import { docInicial, normalizarEstilo } from '../services/editorTexto.js';

const EditorCaderno = lazy(() => import('../components/EditorCaderno.jsx'));

export default function Anotacao() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacao, loading, nova, criar, guardar, apagar } = useAnotacao(id);
  const { anotacoes } = useAnotacoes();
  const { casos } = useCasos();

  if (!nova && loading) return <div className="anotacao-editor"><Carregando texto="A carregar..." tipo="templo" /></div>;
  if (!nova && !anotacao) return <div className="anotacao-editor"><p className="anotacao-editor__loading">Anotação não encontrada.</p></div>;

  const aparecesEm = nova || !anotacao?.titulo ? [] : ondeAparece(anotacao.titulo, { anotacoes, casos }, { tipo: 'anotacoes', id });

  return (
    <div className={`anotacao-editor ${darkMode ? 'dark' : ''}`}>
      <Formulario
        key={id}
        anotacao={anotacao}
        nova={nova}
        cadeiraInicial={location.state?.cadeiraId}
        divisoriaInicial={location.state?.divisoria}
        anotacoes={anotacoes}
        criar={criar}
        guardar={guardar}
        apagar={apagar}
        onVoltar={(cadeiraId) => navigate(cadeiraId ? `/anotacoes/caderno/${cadeiraId}` : '/anotacoes')}
        aparecesEm={aparecesEm}
        onIrPara={(item) => navigate(item.tipo === 'anotacoes' ? `/anotacoes/${item.id}` : `/casos/${item.id}`)}
      />
    </div>
  );
}

function Formulario({ anotacao, nova, cadeiraInicial, divisoriaInicial, anotacoes = [], criar, guardar, apagar, onVoltar, aparecesEm = [], onIrPara }) {
  const [titulo, setTitulo] = useState(anotacao?.titulo || '');
  const [cadeiraId, setCadeiraId] = useState(anotacao?.cadeiraId || cadeiraInicial || cadeirasS1[0].id);
  const [divisoria, setDivisoria] = useState(anotacao ? divisoriaDaAnotacao(anotacao) : (divisoriaInicial || 'teoricas'));
  const [conteudo, setConteudo] = useState(anotacao?.conteudo || '');
  // o documento formatado; null enquanto ela não mexer (numa anotação antiga fica só o texto)
  const [conteudoRico, setConteudoRico] = useState(anotacao?.conteudoRico ?? null);
  const [estilo, setEstilo] = useState(() => normalizarEstilo(anotacao?.estilo));
  // só no início: depois quem manda no documento é o editor
  const [docDeArranque] = useState(() => docInicial(anotacao?.conteudoRico, anotacao?.conteudo));
  const { daCadeira } = useDivisorias();
  const [tagsTexto, setTagsTexto] = useState((anotacao?.tags || []).join(', '));
  const [favorita, setFavorita] = useState(anotacao?.favorita || false);
  const [rascunho, setRascunho] = useState(anotacao?.rascunho ?? true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  const divisorias = daCadeira(cadeiraId);
  // uma divisória que não existe nesta cadeira (mudou de cadeira, ou foi apagada) conta como teóricas
  const divisoriaValida = divisorias.some((d) => d.id === divisoria) ? divisoria : 'teoricas';

  function dadosAtuais() {
    return {
      titulo: titulo.trim(),
      cadeiraId,
      divisoria: divisoriaValida,
      // o tipo continua a existir para as partes da app que ainda o leem
      tipo: divisoriaValida === 'praticas' ? 'pratica' : (anotacao?.tipo && divisoriaValida !== 'teoricas' ? anotacao.tipo : 'teorica'),
      conteudo,
      // json limpo: o firestore não aceita valores undefined
      ...(conteudoRico ? { conteudoRico: JSON.parse(JSON.stringify(conteudoRico)) } : {}),
      estilo,
      tags: tagsTexto.split(',').map((t) => t.trim()).filter(Boolean),
      favorita,
      rascunho,
    };
  }

  async function handleGuardar() {
    if (!titulo.trim()) return;
    setGuardando(true);
    if (nova) {
      // página nova vai para o fim da divisória
      const ordem = ordemNova(paginasDaDivisoria(anotacoes, cadeiraId, divisoriaValida, divisorias));
      const novoId = await criar({ ...dadosAtuais(), ordem });
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
      <div className="anotacao-editor__header">
        <BotaoVoltar destino={`/anotacoes/caderno/${cadeiraId}`} texto="‹ Caderno" />
        <button className={`anotacao-editor__estrela ${favorita ? 'ativa' : ''}`} onClick={() => setFavorita((f) => !f)}>
          {favorita ? '★' : '☆'}
        </button>
      </div>

      <input
        className="anotacao-editor__titulo"
        placeholder="Título da anotação"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <div className="anotacao-editor__cadeiras">
        {cadeirasS1.map((c) => (
          <button
            key={c.id}
            className={`anotacao-editor__cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`}
            style={{ '--cor': c.cor }}
            onClick={() => setCadeiraId(c.id)}
          >
            {c.abrev}
          </button>
        ))}
      </div>

      <div className="anotacao-editor__tipos" role="group" aria-label="Divisória">
        {divisorias.map((d) => (
          <button
            key={d.id}
            className={`anotacao-editor__tipo-btn ${divisoriaValida === d.id ? 'ativo' : ''}`}
            onClick={() => setDivisoria(d.id)}
            style={{ '--cor': d.cor }}
            aria-pressed={divisoriaValida === d.id}
          >
            {d.nome}
          </button>
        ))}
      </div>

      <Suspense fallback={<Carregando texto="A abrir o caderno..." tipo="templo" />}>
        <EditorCaderno
          docInicial={docDeArranque}
          textoInicial={anotacao?.conteudo || ''}
          estilo={estilo}
          onEstilo={setEstilo}
          onMudar={({ json, texto }) => { setConteudoRico(json); setConteudo(texto); }}
        />
      </Suspense>

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

      {aparecesEm.length > 0 && (
        <p className="anotacao-editor__backlinks">
          Onde já apareceu: {aparecesEm.map((item, i) => (
            <span key={item.tipo + item.id}>
              {i > 0 && ', '}
              <button className="anotacao-editor__backlink" onClick={() => onIrPara(item)}>{item.titulo}</button>
            </span>
          ))}
        </p>
      )}

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
