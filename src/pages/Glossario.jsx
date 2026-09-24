// glossário de termos jurídicos — pesquisar, dominar, editar
import { useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useGlossario } from '../hooks/useGlossario.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Glossario.css';
import Carregando from '../components/animacoes/Carregando.jsx';
import TextareaRevista from '../components/TextareaRevista.jsx';

export default function Glossario() {
  const { darkMode } = useTheme();
  const { termos, loading, adicionar, atualizar, apagar } = useGlossario();
  const [pesquisa, setPesquisa] = useState('');
  const [filtroCadeira, setFiltroCadeira] = useState('todas');
  const [soPorDominar, setSoPorDominar] = useState(false);
  const [formAberto, setFormAberto] = useState(false);

  const filtrados = termos.filter((t) => {
    if (filtroCadeira !== 'todas' && t.cadeiraId !== filtroCadeira) return false;
    if (soPorDominar && t.dominado) return false;
    if (pesquisa.trim() && !t.termo.toLowerCase().includes(pesquisa.toLowerCase())) return false;
    return true;
  });

  const dominados = termos.filter((t) => t.dominado).length;

  return (
    <div className={`glossario-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" />
      <header className="glossario-header">
        <div>
          <h1 className="glossario-titulo">Glossário</h1>
          <span className="glossario-contador">{dominados} de {termos.length} dominados</span>
        </div>
        <button className="glossario-btn-novo" onClick={() => setFormAberto((f) => !f)}>{formAberto ? 'Fechar' : '+ Novo termo'}</button>
      </header>

      {formAberto && <FormNovoTermo onGuardar={async (d) => { await adicionar(d); setFormAberto(false); }} />}

      <input className="glossario-pesquisa" placeholder="Pesquisar termo..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />

      <div className="glossario-filtros">
        <button className={`glossario-filtro-btn ${filtroCadeira === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroCadeira('todas')}>Todas</button>
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`glossario-filtro-btn ${filtroCadeira === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setFiltroCadeira(c.id)}>
            {c.abrev}
          </button>
        ))}
        <button className={`glossario-filtro-btn glossario-filtro-btn--dominar ${soPorDominar ? 'ativo' : ''}`} onClick={() => setSoPorDominar((v) => !v)}>
          Só por dominar
        </button>
      </div>

      {loading && <Carregando texto="A carregar..." />}
      {!loading && filtrados.length === 0 && (
        <div className="glossario-vazio">
          <p>{termos.length === 0 ? 'Ainda não tens termos no glossário.' : 'Nada encontrado.'}</p>
        </div>
      )}

      <div className="glossario-lista">
        {filtrados.map((t) => (
          <TermoCard key={t.id} termo={t} onAtualizar={(d) => atualizar(t.id, d)} onApagar={() => apagar(t.id)} />
        ))}
      </div>
    </div>
  );
}

function FormNovoTermo({ onGuardar }) {
  const [termo, setTermo] = useState('');
  const [significado, setSignificado] = useState('');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [aGuardar, setAGuardar] = useState(false);

  async function guardar() {
    if (!termo.trim() || !significado.trim()) return;
    setAGuardar(true);
    await onGuardar({ termo: termo.trim(), significado: significado.trim(), cadeiraId });
    setAGuardar(false);
  }

  return (
    <div className="glossario-form-novo">
      <input className="glossario-form-novo__input" placeholder="Termo (ex: prescrição)" value={termo} onChange={(e) => setTermo(e.target.value)} autoFocus />
      <TextareaRevista className="glossario-form-novo__textarea" placeholder="Significado, em palavras tuas..." rows={2} value={significado} onValor={setSignificado} />
      <div className="glossario-form-novo__linha">
        <div className="glossario-form-novo__cadeiras">
          {cadeirasS1.map((c) => (
            <button key={c.id} className={`glossario-chip-cadeira ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>
              {c.abrev}
            </button>
          ))}
        </div>
        <button className="glossario-form-novo__guardar" onClick={guardar} disabled={aGuardar || !termo.trim() || !significado.trim()}>
          {aGuardar ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function TermoCard({ termo, onAtualizar, onApagar }) {
  const [aEditar, setAEditar] = useState(false);
  const [significado, setSignificado] = useState(termo.significado);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const cor = coresCadeiras[termo.cadeiraId] || '#b8963e';

  async function guardarEdicao() {
    await onAtualizar({ significado });
    setAEditar(false);
  }

  return (
    <div className={`termo-card ${termo.dominado ? 'dominado' : ''}`} style={{ '--cor': cor }}>
      <div className="termo-card__topo">
        <span className="termo-card__cadeira">{abrevCadeiras[termo.cadeiraId]}</span>
        <button className={`termo-card__dominado ${termo.dominado ? 'ativo' : ''}`} onClick={() => onAtualizar({ dominado: !termo.dominado })}>
          {termo.dominado ? '✓ Dominado' : 'Por dominar'}
        </button>
      </div>
      <h3 className="termo-card__termo">{termo.termo}</h3>
      {aEditar ? (
        <>
          <TextareaRevista className="termo-card__textarea" rows={3} value={significado} onValor={setSignificado} />
          <div className="termo-card__acoes-edicao">
            <button className="termo-card__btn-guardar" onClick={guardarEdicao}>Guardar</button>
            <button className="termo-card__btn-cancelar" onClick={() => { setSignificado(termo.significado); setAEditar(false); }}>Cancelar</button>
          </div>
        </>
      ) : (
        <p className="termo-card__significado">{termo.significado}</p>
      )}

      <div className="termo-card__rodape">
        {!aEditar && <button className="termo-card__link" onClick={() => setAEditar(true)}>Editar</button>}
        {!confirmarApagar ? (
          <button className="termo-card__link termo-card__link--apagar" onClick={() => setConfirmarApagar(true)}>Apagar</button>
        ) : (
          <span className="termo-card__confirmar">
            Apagar? <button className="termo-card__link" onClick={onApagar}>Sim</button> / <button className="termo-card__link" onClick={() => setConfirmarApagar(false)}>Não</button>
          </span>
        )}
      </div>
    </div>
  );
}
