// ecrã inicial das notas: a estante de cadernos, os separadores por vista e a lista de páginas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import Estante from '../components/Estante.jsx';
import {
  CADERNO_LIVRE, ABAS_NOTAS, filtrarNotas, contarPorAba, contarPorCaderno,
  cadernoDaNota, seccaoDaNota, previewTexto, dataCurta,
} from '../services/cadernos.js';
import { cadeirasS1, idsCadeiras, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Anotacoes.css';

const ROTULOS_ABA = { todas: 'Todas', fav: 'Favoritas', rasc: 'Rascunhos', freq: 'Frequência' };
const VAZIO_POR_ABA = {
  todas: 'Ainda não tens páginas. Escolhe um caderno na estante ou toca em "+ Nova".',
  fav: 'Ainda não marcaste nenhuma página como favorita. A estrela está no topo de cada página.',
  rasc: 'Não tens rascunhos. Tudo o que escreveste está dado como pronto.',
  freq: 'Ainda não há perguntas para a frequência. Cria uma secção "Perguntas para frequência" num caderno.',
};

export default function Anotacoes() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { anotacoes, loading } = useAnotacoes();
  const [aba, setAba] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');

  const contagemAbas = contarPorAba(anotacoes, idsCadeiras);
  const contagemCadernos = contarPorCaderno(anotacoes, idsCadeiras);
  const cadernos = [
    ...cadeirasS1.map((c) => ({ id: c.id, nome: c.nome, ab: c.abrev, cor: c.cor, total: contagemCadernos[c.id] })),
    { id: CADERNO_LIVRE, nome: 'Caderno Livre', ab: 'Livre', cor: 'var(--gold)', total: contagemCadernos[CADERNO_LIVRE], livre: true },
  ];

  const visiveis = filtrarNotas(anotacoes, { aba, pesquisa, idsConhecidos: idsCadeiras });
  const posicaoAba = ABAS_NOTAS.indexOf(aba);

  return (
    <div className={`anotacoes-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="anotacoes-header">
        <div>
          <h1 className="anotacoes-titulo">Notas</h1>
          <span className="anotacoes-contador">{anotacoes.length} {anotacoes.length === 1 ? 'página' : 'páginas'} em {cadernos.length} cadernos</span>
        </div>
        <button className="anotacoes-btn-nova" onClick={() => navigate('/anotacoes/nova')}>+ Nova</button>
      </header>

      <input
        className="anotacoes-pesquisa"
        type="search"
        placeholder="Pesquisar por título, texto ou tag..."
        aria-label="Pesquisar nas notas"
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      <p className="anotacoes-etiqueta">Cadernos</p>
      <Estante cadernos={cadernos} onAbrir={(id) => navigate(`/cadernos/${id}`)} />

      <div className="notas-abas" role="tablist" aria-label="Ver páginas">
        {ABAS_NOTAS.map((a) => (
          <button key={a} role="tab" aria-selected={aba === a} className="notas-aba" onClick={() => setAba(a)}>
            <span>{ROTULOS_ABA[a]}</span>
            <small>{contagemAbas[a]}</small>
          </button>
        ))}
        <span className="notas-abas__ind" style={{ left: `${posicaoAba * 25}%` }} />
      </div>

      {loading && <p className="anotacoes-vazio">A carregar...</p>}

      {!loading && visiveis.length === 0 && (
        <div className="anotacoes-vazio">
          <p>{pesquisa.trim() ? 'Nada encontrado.' : VAZIO_POR_ABA[aba]}</p>
        </div>
      )}

      <div className="anotacoes-lista" key={`${aba}-${pesquisa}`}>
        {visiveis.map((a, i) => {
          const cadernoId = cadernoDaNota(a, idsCadeiras);
          return (
            <button
              key={a.id}
              className="anotacao-card"
              style={{ '--cor': coresCadeiras[cadernoId] || 'var(--gold)', '--i': i }}
              onClick={() => navigate(`/anotacoes/${a.id}`)}
            >
              <div className="anotacao-card__topo">
                <span className="anotacao-card__cadeira">{abrevCadeiras[cadernoId] || 'Livre'}</span>
                <span className="anotacao-card__tipo">{seccaoDaNota(a, cadernoId)}</span>
                {a.favorita && <span className="anotacao-card__estrela" aria-label="Favorita">★</span>}
                {a.rascunho && <span className="anotacao-card__rascunho">rascunho</span>}
              </div>
              <h3 className="anotacao-card__titulo">{a.titulo || 'Sem título'}</h3>
              <p className="anotacao-card__snippet">{previewTexto(a, 120)}</p>
              <span className="anotacao-card__data">{dataCurta(a.atualizadoEm)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
