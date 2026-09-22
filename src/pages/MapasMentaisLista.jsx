// lista de mapas mentais, um por cadeira ou tema
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useMapasMentaisLista } from '../hooks/useMapasMentais.js';
import { coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './MapaMental.css';

export default function MapasMentaisLista() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { mapas, loading } = useMapasMentaisLista();

  return (
    <div className={`mm-lista-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <header className="mm-lista-header">
        <div>
          <h1 className="mm-lista-titulo">Mapas Mentais</h1>
          <p className="mm-lista-sub">Caixas e setas, por cadeira ou tema.</p>
        </div>
        <button className="mm-lista-btn-novo" onClick={() => navigate('/mapas-mentais/novo')}>+ Novo</button>
      </header>

      {loading && <Carregando texto="A carregar..." tipo="templo" />}

      {!loading && mapas.length === 0 && (
        <EstadoVazio
          titulo="Ainda não tens mapas mentais."
          texto="Um esquema com caixas e setas — por exemplo, a responsabilidade civil."
          acao={{ texto: 'Criar o primeiro', fn: () => navigate('/mapas-mentais/novo') }}
        />
      )}

      <ul className="mm-lista-grelha">
        {mapas.map((m) => (
          <li key={m.id}>
            <button className="mm-lista-card" style={{ '--cor': coresCadeiras[m.cadeiraId] || '#b8963e' }} onClick={() => navigate(`/mapas-mentais/${m.id}`)}>
              <span className="mm-lista-card__cadeira">{abrevCadeiras[m.cadeiraId] || '—'}</span>
              <span className="mm-lista-card__titulo">{m.titulo || 'Sem título'}</span>
              <span className="mm-lista-card__contagem">{(m.nos || []).length} nós</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
