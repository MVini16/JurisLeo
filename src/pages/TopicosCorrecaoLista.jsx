// lista de comparações com tópicos de correção, uma por prova
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useTopicosCorrecaoLista } from '../hooks/useTopicosCorrecao.js';
import { contarTopicos } from '../services/topicosCorrecao.js';
import { coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './TopicosCorrecao.css';

export default function TopicosCorrecaoLista() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { itens, loading } = useTopicosCorrecaoLista();

  return (
    <div className={`tc-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <header className="tc-header">
        <div>
          <h1 className="tc-titulo">Tópicos de Correção</h1>
          <p className="tc-sub">Compara a tua resposta com os tópicos publicados: o que reclamar e o que rever.</p>
        </div>
        <button className="tc-btn-novo" onClick={() => navigate('/topicos-correcao/novo')}>+ Novo</button>
      </header>

      {loading && <Carregando texto="A carregar..." tipo="templo" />}

      {!loading && itens.length === 0 && (
        <EstadoVazio
          titulo="Ainda não comparaste nenhuma correção."
          texto="Quando saírem os tópicos de correção de uma prova, cria uma comparação aqui."
          acao={{ texto: 'Criar a primeira', fn: () => navigate('/topicos-correcao/novo') }}
        />
      )}

      <ul className="tc-lista">
        {itens.map((item) => {
          const contagem = contarTopicos(item.topicos || []);
          return (
            <li key={item.id}>
              <button className="tc-item" style={{ '--cor': coresCadeiras[item.cadeiraId] || '#b8963e' }} onClick={() => navigate(`/topicos-correcao/${item.id}`)}>
                <span className="tc-item__cadeira">{abrevCadeiras[item.cadeiraId] || '—'}</span>
                <span className="tc-item__titulo">{item.titulo || 'Sem título'}</span>
                <span className="tc-item__contagem">{contagem.tinha} a reclamar · {contagem.faltou} a rever</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
