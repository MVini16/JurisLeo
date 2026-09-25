// artigos de código guardados como referência pessoal, com nota e dificuldade
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useArtigos } from '../hooks/useArtigos.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { useCasos } from '../hooks/useCasos.js';
import { ondeAparece } from '../services/backlinks.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import './Artigos.css';
import Carregando from '../components/animacoes/Carregando.jsx';
import TextareaRevista from '../components/TextareaRevista.jsx';

const CODIGOS = ['CC', 'CPA', 'CRP', 'CT', 'outro'];
const CORES_CODIGO = { CC: '#7B1E2B', CPA: '#1F3A5F', CRP: '#2E6F5E', CT: '#C9843E', outro: '#5C8374' };

function ordenarArtigos(lista) {
  return [...lista].sort((a, b) => {
    if (a.codigo !== b.codigo) return a.codigo.localeCompare(b.codigo);
    return (parseInt(a.numero) || 0) - (parseInt(b.numero) || 0);
  });
}

export default function Artigos() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { artigos, loading, adicionar, atualizar, apagar } = useArtigos();
  const { anotacoes } = useAnotacoes();
  const { casos } = useCasos();
  const [pesquisa, setPesquisa] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('todos');
  const [formAberto, setFormAberto] = useState(false);

  const filtrados = ordenarArtigos(artigos.filter((a) => {
    if (filtroCodigo !== 'todos' && a.codigo !== filtroCodigo) return false;
    if (pesquisa.trim()) {
      const alvo = `${a.numero} ${a.epigrafe} ${a.notaPessoal || ''}`.toLowerCase();
      if (!alvo.includes(pesquisa.toLowerCase())) return false;
    }
    return true;
  }));

  return (
    <div className={`artigos-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" />
      <header className="artigos-header">
        <div>
          <h1 className="artigos-titulo">Artigos</h1>
          <span className="artigos-contador">{artigos.length} guardados</span>
        </div>
        <button className="artigos-btn-novo" onClick={() => setFormAberto((f) => !f)}>{formAberto ? 'Fechar' : '+ Novo'}</button>
      </header>

      {formAberto && <FormNovoArtigo onGuardar={async (d) => { await adicionar(d); setFormAberto(false); }} />}

      <input className="artigos-pesquisa" placeholder="Pesquisar por número, epígrafe ou nota..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />

      <div className="artigos-filtros">
        <button className={`artigos-filtro-btn ${filtroCodigo === 'todos' ? 'ativo' : ''}`} onClick={() => setFiltroCodigo('todos')}>Todos</button>
        {CODIGOS.map((c) => (
          <button key={c} className={`artigos-filtro-btn ${filtroCodigo === c ? 'ativo' : ''}`} style={{ '--cor': CORES_CODIGO[c] }} onClick={() => setFiltroCodigo(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && <Carregando texto="A carregar..." />}
      {!loading && filtrados.length === 0 && (
        <div className="artigos-vazio">
          <p>{artigos.length === 0 ? 'Ainda não guardaste nenhum artigo.' : 'Nada encontrado.'}</p>
        </div>
      )}

      <div className="artigos-lista">
        {filtrados.map((a) => (
          <ArtigoCard
            key={a.id}
            artigo={a}
            onAtualizar={(d) => atualizar(a.id, d)}
            onApagar={() => apagar(a.id)}
            aparecesEm={ondeAparece(a.numero, { anotacoes, casos })}
            onIrPara={(item) => navigate(item.tipo === 'anotacoes' ? `/anotacoes/${item.id}` : `/casos/${item.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function FormNovoArtigo({ onGuardar }) {
  const [codigo, setCodigo] = useState('CC');
  const [numero, setNumero] = useState('');
  const [epigrafe, setEpigrafe] = useState('');
  const [notaPessoal, setNotaPessoal] = useState('');
  const [dificuldade, setDificuldade] = useState(1);
  const [aGuardar, setAGuardar] = useState(false);

  async function guardar() {
    if (!numero.trim()) return;
    setAGuardar(true);
    await onGuardar({ codigo, numero: numero.trim(), epigrafe: epigrafe.trim(), notaPessoal: notaPessoal.trim(), dificuldade });
    setAGuardar(false);
  }

  return (
    <div className="artigos-form-novo">
      <div className="artigos-form-novo__codigos">
        {CODIGOS.map((c) => (
          <button key={c} className={`artigos-chip-codigo ${codigo === c ? 'ativo' : ''}`} style={{ '--cor': CORES_CODIGO[c] }} onClick={() => setCodigo(c)}>{c}</button>
        ))}
      </div>
      <div className="artigos-form-novo__linha">
        <input className="artigos-form-novo__numero" placeholder="Nº artigo" value={numero} onChange={(e) => setNumero(e.target.value)} autoFocus />
        <input className="artigos-form-novo__epigrafe" placeholder="Epígrafe (ex: Boa fé)" value={epigrafe} onChange={(e) => setEpigrafe(e.target.value)} />
      </div>
      <TextareaRevista className="artigos-form-novo__textarea" placeholder="A tua nota sobre este artigo..." rows={2} value={notaPessoal} onValor={setNotaPessoal} />
      <div className="artigos-form-novo__linha">
        <div className="artigos-form-novo__dificuldade">
          {[1, 2, 3].map((d) => (
            <button key={d} className={`artigos-dot-btn ${dificuldade >= d ? 'ativo' : ''}`} onClick={() => setDificuldade(d)} aria-label={`Dificuldade ${d} de 3`} aria-pressed={dificuldade >= d}>●</button>
          ))}
        </div>
        <button className="artigos-form-novo__guardar" onClick={guardar} disabled={aGuardar || !numero.trim()}>
          {aGuardar ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function ArtigoCard({ artigo, onAtualizar, onApagar, aparecesEm = [], onIrPara }) {
  const [aEditar, setAEditar] = useState(false);
  const [notaPessoal, setNotaPessoal] = useState(artigo.notaPessoal || '');
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const cor = CORES_CODIGO[artigo.codigo] || '#b8963e';

  async function guardarEdicao() {
    await onAtualizar({ notaPessoal });
    setAEditar(false);
  }

  return (
    <div className="artigo-card" style={{ '--cor': cor }}>
      <div className="artigo-card__topo">
        <span className="artigo-card__numero">Art. {artigo.numero} {artigo.codigo}</span>
        <div className="artigo-card__dificuldade">
          {[1, 2, 3].map((d) => (
            <button key={d} className={`artigos-dot-btn ${artigo.dificuldade >= d ? 'ativo' : ''}`} onClick={() => onAtualizar({ dificuldade: d })} aria-label={`Dificuldade ${d} de 3`} aria-pressed={artigo.dificuldade >= d}>●</button>
          ))}
        </div>
      </div>
      {artigo.epigrafe && <h3 className="artigo-card__epigrafe">{artigo.epigrafe}</h3>}
      {aEditar ? (
        <>
          <TextareaRevista className="artigo-card__textarea" rows={3} value={notaPessoal} onValor={setNotaPessoal} />
          <div className="artigo-card__acoes-edicao">
            <button className="artigo-card__btn-guardar" onClick={guardarEdicao}>Guardar</button>
            <button className="artigo-card__btn-cancelar" onClick={() => { setNotaPessoal(artigo.notaPessoal || ''); setAEditar(false); }}>Cancelar</button>
          </div>
        </>
      ) : (
        artigo.notaPessoal && <p className="artigo-card__nota">{artigo.notaPessoal}</p>
      )}
      {aparecesEm.length > 0 && (
        <p className="artigo-card__backlinks">
          Onde já usei este artigo: {aparecesEm.map((item, i) => (
            <span key={item.tipo + item.id}>
              {i > 0 && ', '}
              <button className="artigo-card__backlink" onClick={() => onIrPara(item)}>{item.titulo}</button>
            </span>
          ))}
        </p>
      )}
      <div className="artigo-card__rodape">
        {!aEditar && <button className="artigo-card__link" onClick={() => setAEditar(true)}>{artigo.notaPessoal ? 'Editar nota' : '+ Nota'}</button>}
        {!confirmarApagar ? (
          <button className="artigo-card__link artigo-card__link--apagar" onClick={() => setConfirmarApagar(true)}>Apagar</button>
        ) : (
          <span className="artigo-card__confirmar">Apagar? <button className="artigo-card__link" onClick={onApagar}>Sim</button> / <button className="artigo-card__link" onClick={() => setConfirmarApagar(false)}>Não</button></span>
        )}
      </div>
    </div>
  );
}
