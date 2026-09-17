// lista de casos práticos, com painel de dúvidas por esclarecer
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCasos } from '../hooks/useCasos.js';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Casos.css';

const ROTULO_ESTADO = {
  porResolver: 'Por resolver',
  resolvido: 'Resolvido',
  corrigido: 'Corrigido',
  duvida: 'Com dúvida',
};

export default function Casos() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { casos, loading } = useCasos();
  const [filtroCadeira, setFiltroCadeira] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const duvidasAbertas = casos.flatMap((c) =>
    (c.duvidas || []).map((texto, i) => ({ texto, casoId: c.id, casoTitulo: c.titulo, cadeiraId: c.cadeiraId, i }))
  );

  const filtrados = casos.filter((c) => {
    if (filtroCadeira !== 'todas' && c.cadeiraId !== filtroCadeira) return false;
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    return true;
  });

  return (
    <div className={`casos-pagina ${darkMode ? 'dark' : ''}`}>
      <header className="casos-header">
        <div>
          <h1 className="casos-titulo">Casos Práticos</h1>
          <span className="casos-contador">{casos.length} no total</span>
        </div>
        <button className="casos-btn-novo" onClick={() => navigate('/casos/novo')}>+ Novo</button>
      </header>

      {duvidasAbertas.length > 0 && (
        <div className="casos-duvidas">
          <h2 className="casos-duvidas__titulo">💡 Dúvidas por esclarecer ({duvidasAbertas.length})</h2>
          <div className="casos-duvidas__lista">
            {duvidasAbertas.map((d, idx) => (
              <button key={idx} className="casos-duvida-item" style={{ '--cor': coresCadeiras[d.cadeiraId] || '#b8963e' }} onClick={() => navigate(`/casos/${d.casoId}`)}>
                <span className="casos-duvida-item__cadeira">{abrevCadeiras[d.cadeiraId]}</span>
                <span className="casos-duvida-item__texto">{d.texto}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="casos-filtros">
        <button className={`casos-filtro-btn ${filtroCadeira === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroCadeira('todas')}>Todas</button>
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`casos-filtro-btn ${filtroCadeira === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setFiltroCadeira(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>

      <div className="casos-filtros">
        {['todos', 'porResolver', 'resolvido', 'corrigido', 'duvida'].map((e) => (
          <button key={e} className={`casos-filtro-btn casos-filtro-btn--estado ${filtroEstado === e ? 'ativo' : ''}`} onClick={() => setFiltroEstado(e)}>
            {e === 'todos' ? 'Todos os estados' : ROTULO_ESTADO[e]}
          </button>
        ))}
      </div>

      {loading && <p className="casos-vazio">A carregar...</p>}

      {!loading && filtrados.length === 0 && (
        <div className="casos-vazio">
          <p>{casos.length === 0 ? 'Ainda não tens casos práticos registados.' : 'Nada encontrado com estes filtros.'}</p>
          {casos.length === 0 && <span>Toca em "+ Novo" para começares.</span>}
        </div>
      )}

      <div className="casos-lista">
        {filtrados.map((c) => (
          <button key={c.id} className="caso-card" style={{ '--cor': coresCadeiras[c.cadeiraId] || '#b8963e' }} onClick={() => navigate(`/casos/${c.id}`)}>
            <div className="caso-card__topo">
              <span className="caso-card__cadeira">{abrevCadeiras[c.cadeiraId] || '—'}</span>
              <span className={`caso-card__estado caso-card__estado--${c.estado}`}>{ROTULO_ESTADO[c.estado] || c.estado}</span>
            </div>
            <h3 className="caso-card__titulo">{c.titulo || 'Sem título'}</h3>
            <p className="caso-card__snippet">{(c.enunciado || '').slice(0, 110)}</p>
            {c.duvidas?.length > 0 && <span className="caso-card__duvidas">💡 {c.duvidas.length} dúvida{c.duvidas.length === 1 ? '' : 's'}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
