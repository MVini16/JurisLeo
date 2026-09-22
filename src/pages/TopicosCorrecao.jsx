// uma comparação: cola os tópicos de correção, marca tinha/faltou, vê o que reclamar e o que rever
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useTopicosCorrecao } from '../hooks/useTopicosCorrecao.js';
import { linhasParaTopicos, marcarTopico, contarTopicos, pontosParaReclamar, pontosParaRever, PRAZO_RECURSO_DIAS_UTEIS } from '../services/topicosCorrecao.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './TopicosCorrecao.css';

export default function TopicosCorrecao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { item, loading, novo, criar, guardar, apagar } = useTopicosCorrecao(id);

  if (!novo && loading) return <div className="tc-pagina"><Carregando texto="A carregar..." tipo="templo" /></div>;
  if (!novo && !item) return <div className="tc-pagina"><p className="tc-sub">Esta comparação já não existe.</p></div>;

  return (
    <div className={`tc-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/topicos-correcao" texto="‹ Tópicos de Correção" />
      {novo ? (
        <FormularioNovo criar={criar} onCriado={(novoId) => navigate(`/topicos-correcao/${novoId}`, { replace: true })} />
      ) : (
        <Comparacao item={item} guardar={guardar} apagar={apagar} onApagado={() => navigate('/topicos-correcao')} />
      )}
    </div>
  );
}

function FormularioNovo({ criar, onCriado }) {
  const [titulo, setTitulo] = useState('');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [texto, setTexto] = useState('');
  const [aCriar, setACriar] = useState(false);

  async function handleCriar() {
    if (!titulo.trim() || !texto.trim()) return;
    setACriar(true);
    const novoId = await criar({ titulo: titulo.trim(), cadeiraId, topicos: linhasParaTopicos(texto) });
    setACriar(false);
    if (novoId) onCriado(novoId);
  }

  return (
    <>
      <h1 className="tc-titulo">Nova comparação</h1>
      <input className="tc-input" placeholder="Título (ex: Frequência DA I)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

      <div className="tc-cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`tc-cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>

      <label className="tc-campo">
        <span className="tc-label">Tópicos de correção (um por linha)</span>
        <textarea className="tc-textarea" rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={'Cola aqui a lista, um tópico por linha:\nNoção de contrato\nRequisitos de validade\n...'} />
      </label>

      <button className="tc-btn-guardar" onClick={handleCriar} disabled={aCriar || !titulo.trim() || !texto.trim()}>
        {aCriar ? 'A criar...' : 'Criar e começar a marcar'}
      </button>
    </>
  );
}

function Comparacao({ item, guardar, apagar, onApagado }) {
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const topicos = item.topicos || [];
  const contagem = contarTopicos(topicos);
  const reclamar = pontosParaReclamar(topicos);
  const rever = pontosParaRever(topicos);

  function marcar(indice, tinha) {
    guardar({ topicos: marcarTopico(topicos, indice, tinha) });
  }

  return (
    <>
      <h1 className="tc-titulo">{item.titulo}</h1>
      <p className="tc-sub">{contagem.tinha} a reclamar · {contagem.faltou} a rever{contagem.porMarcar > 0 ? ` · ${contagem.porMarcar} por marcar` : ''}</p>

      <ul className="tc-topicos">
        {topicos.map((t, i) => (
          <li key={i} className="tc-topico">
            <span className="tc-topico__texto">{t.texto}</span>
            <div className="tc-topico__opcoes">
              <button className={`tc-opcao tc-opcao--tinha ${t.tinha === true ? 'ativo' : ''}`} onClick={() => marcar(i, true)}>Tinha</button>
              <button className={`tc-opcao tc-opcao--faltou ${t.tinha === false ? 'ativo' : ''}`} onClick={() => marcar(i, false)}>Faltou</button>
            </div>
          </li>
        ))}
      </ul>

      {reclamar.length > 0 && (
        <section className="tc-resultado tc-resultado--reclamar">
          <h2>O que reclamar</h2>
          <p className="tc-resultado__nota">Tens {PRAZO_RECURSO_DIAS_UTEIS} dias úteis após a publicitação da nota para pedires recurso (art. 29.º), fundamentado ponto a ponto.</p>
          <ul>{reclamar.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}

      {rever.length > 0 && (
        <section className="tc-resultado tc-resultado--rever">
          <h2>O que rever</h2>
          <ul>{rever.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}

      <div className="tc-acoes">
        {confirmarApagar ? (
          <div className="tc-confirmar">
            <span>Apagar esta comparação?</span>
            <button onClick={async () => { await apagar(); onApagado(); }}>Sim</button>
            <button onClick={() => setConfirmarApagar(false)}>Não</button>
          </div>
        ) : (
          <button className="tc-btn-apagar" onClick={() => setConfirmarApagar(true)}>Apagar</button>
        )}
      </div>
    </>
  );
}
