// lista de anotações de aula
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Anotacoes.css';

function formatarData(timestamp) {
  const d = timestamp?.toDate?.();
  if (!d) return '';
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

export default function Anotacoes() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { anotacoes, loading } = useAnotacoes();
  const [filtroCadeira, setFiltroCadeira] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');

  const filtradas = anotacoes.filter((a) => {
    if (filtroCadeira !== 'todas' && a.cadeiraId !== filtroCadeira) return false;
    if (pesquisa.trim()) {
      const alvo = `${a.titulo} ${a.conteudo}`.toLowerCase();
      if (!alvo.includes(pesquisa.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className={`anotacoes-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="anotacoes-header">
        <div>
          <h1 className="anotacoes-titulo">Anotações</h1>
          <span className="anotacoes-contador">{anotacoes.length} no total</span>
        </div>
        <button className="anotacoes-btn-nova" onClick={() => navigate('/anotacoes/nova')}>+ Nova</button>
      </header>

      <input
        className="anotacoes-pesquisa"
        type="text"
        placeholder="Pesquisar por título ou conteúdo..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      <div className="anotacoes-filtros">
        <button className={`anotacoes-filtro-btn ${filtroCadeira === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroCadeira('todas')}>
          Todas
        </button>
        {cadeirasS1.map((c) => (
          <button
            key={c.id}
            className={`anotacoes-filtro-btn ${filtroCadeira === c.id ? 'ativo' : ''}`}
            style={{ '--cor': c.cor }}
            onClick={() => setFiltroCadeira(c.id)}
          >
            {c.abrev}
          </button>
        ))}
      </div>

      {loading && <p className="anotacoes-vazio">A carregar...</p>}

      {!loading && filtradas.length === 0 && (
        <div className="anotacoes-vazio">
          <p>{anotacoes.length === 0 ? 'Ainda não tens anotações nenhumas.' : 'Nada encontrado.'}</p>
          {anotacoes.length === 0 && <span>Toca em "+ Nova" para escreveres a primeira.</span>}
        </div>
      )}

      <div className="anotacoes-lista">
        {filtradas.map((a) => (
          <button key={a.id} className="anotacao-card" style={{ '--cor': coresCadeiras[a.cadeiraId] || '#b8963e' }} onClick={() => navigate(`/anotacoes/${a.id}`)}>
            <div className="anotacao-card__topo">
              <span className="anotacao-card__cadeira">{abrevCadeiras[a.cadeiraId] || '—'}</span>
              <span className="anotacao-card__tipo">{a.tipo === 'pratica' ? 'Prática' : 'Teórica'}</span>
              {a.favorita && <span className="anotacao-card__estrela">★</span>}
              {a.rascunho && <span className="anotacao-card__rascunho">rascunho</span>}
            </div>
            <h3 className="anotacao-card__titulo">{a.titulo || 'Sem título'}</h3>
            <p className="anotacao-card__snippet">{(a.conteudo || '').slice(0, 120)}</p>
            <span className="anotacao-card__data">{formatarData(a.atualizadoEm)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
