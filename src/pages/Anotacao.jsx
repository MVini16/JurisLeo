// editor de uma anotação — criar ou editar
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacao } from '../hooks/useAnotacao.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import './Anotacao.css';
import Carregando from '../components/animacoes/Carregando.jsx';

export default function Anotacao() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { anotacao, loading, nova, criar, guardar, apagar } = useAnotacao(id);

  if (!nova && loading) return <div className="anotacao-editor"><Carregando texto="A carregar..." tipo="templo" /></div>;
  if (!nova && !anotacao) return <div className="anotacao-editor"><p className="anotacao-editor__loading">Anotação não encontrada.</p></div>;

  return (
    <div className={`anotacao-editor ${darkMode ? 'dark' : ''}`}>
      <Formulario
        key={id}
        anotacao={anotacao}
        nova={nova}
        cadeiraInicial={location.state?.cadeiraId}
        criar={criar}
        guardar={guardar}
        apagar={apagar}
        onVoltar={() => navigate('/anotacoes')}
      />
    </div>
  );
}

function Formulario({ anotacao, nova, cadeiraInicial, criar, guardar, apagar, onVoltar }) {
  const [titulo, setTitulo] = useState(anotacao?.titulo || '');
  const [cadeiraId, setCadeiraId] = useState(anotacao?.cadeiraId || cadeiraInicial || cadeirasS1[0].id);
  const [tipo, setTipo] = useState(anotacao?.tipo || 'teorica');
  const [conteudo, setConteudo] = useState(anotacao?.conteudo || '');
  const [tagsTexto, setTagsTexto] = useState((anotacao?.tags || []).join(', '));
  const [favorita, setFavorita] = useState(anotacao?.favorita || false);
  const [rascunho, setRascunho] = useState(anotacao?.rascunho ?? true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  const cadeira = cadeirasS1.find((c) => c.id === cadeiraId);

  function dadosAtuais() {
    return {
      titulo: titulo.trim(),
      cadeiraId,
      tipo,
      conteudo,
      tags: tagsTexto.split(',').map((t) => t.trim()).filter(Boolean),
      favorita,
      rascunho,
    };
  }

  async function handleGuardar() {
    if (!titulo.trim()) return;
    setGuardando(true);
    if (nova) {
      const novoId = await criar(dadosAtuais());
      setGuardando(false);
      if (novoId) onVoltar();
    } else {
      await guardar(dadosAtuais());
      setGuardando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 1500);
    }
  }

  async function handleApagar() {
    await apagar();
    onVoltar();
  }

  return (
    <>
      <div className="anotacao-editor__header">
        <button className="anotacao-editor__voltar" onClick={onVoltar}>‹ Anotações</button>
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

      <div className="anotacao-editor__tipos">
        <button className={`anotacao-editor__tipo-btn ${tipo === 'teorica' ? 'ativo' : ''}`} onClick={() => setTipo('teorica')} style={{ '--cor': cadeira?.cor }}>Teórica</button>
        <button className={`anotacao-editor__tipo-btn ${tipo === 'pratica' ? 'ativo' : ''}`} onClick={() => setTipo('pratica')} style={{ '--cor': cadeira?.cor }}>Prática</button>
      </div>

      <textarea
        className="anotacao-editor__conteudo"
        placeholder="Escreve aqui o que deu na aula..."
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={14}
      />

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
