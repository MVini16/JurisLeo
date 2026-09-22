// editor de um caso prático — a estrutura clássica de resolução
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCaso } from '../hooks/useCaso.js';
import { useCasos } from '../hooks/useCasos.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { ondeAparece } from '../services/backlinks.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import './Caso.css';
import Carregando from '../components/animacoes/Carregando.jsx';

const ESTADOS = [
  { id: 'porResolver', label: 'Por resolver' },
  { id: 'resolvido', label: 'Resolvido' },
  { id: 'corrigido', label: 'Corrigido' },
  { id: 'duvida', label: 'Com dúvida' },
];

const CAMPOS_ESTRUTURA = [
  { chave: 'factos', label: 'Factos', placeholder: 'O que aconteceu, quem são as partes...' },
  { chave: 'questao', label: 'Questão jurídica', placeholder: 'O que está mesmo em causa resolver?' },
  { chave: 'enquadramento', label: 'Enquadramento', placeholder: 'Normas e institutos aplicáveis...' },
  { chave: 'subsuncao', label: 'Subsunção', placeholder: 'Aplicar as normas aos factos...' },
  { chave: 'conclusao', label: 'Conclusão', placeholder: 'A tua resposta final...' },
];

export default function Caso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { caso, loading, novo, criar, guardar, apagar } = useCaso(id);
  const { casos } = useCasos();
  const { anotacoes } = useAnotacoes();

  if (!novo && loading) return <div className="caso-editor"><Carregando texto="A carregar..." tipo="templo" /></div>;
  if (!novo && !caso) return <div className="caso-editor"><p className="caso-editor__loading">Caso não encontrado.</p></div>;

  const aparecesEm = novo || !caso?.titulo ? [] : ondeAparece(caso.titulo, { anotacoes, casos }, { tipo: 'casos', id });

  return (
    <div className={`caso-editor ${darkMode ? 'dark' : ''}`}>
      <Formulario key={id} caso={caso} novo={novo} criar={criar} guardar={guardar} apagar={apagar} onVoltar={() => navigate('/casos')} aparecesEm={aparecesEm} onIrPara={(item) => navigate(item.tipo === 'anotacoes' ? `/anotacoes/${item.id}` : `/casos/${item.id}`)} />
    </div>
  );
}

function Formulario({ caso, novo, criar, guardar, apagar, onVoltar, aparecesEm = [], onIrPara }) {
  const [titulo, setTitulo] = useState(caso?.titulo || '');
  const [cadeiraId, setCadeiraId] = useState(caso?.cadeiraId || cadeirasS1[0].id);
  const [enunciado, setEnunciado] = useState(caso?.enunciado || '');
  const [estrutura, setEstrutura] = useState(caso?.estrutura || { factos: '', questao: '', enquadramento: '', subsuncao: '', conclusao: '' });
  const [estado, setEstado] = useState(caso?.estado || 'porResolver');
  const [notaDoProfessor, setNotaDoProfessor] = useState(caso?.notaDoProfessor || '');
  const [duvidas, setDuvidas] = useState(caso?.duvidas || []);
  const [novaDuvida, setNovaDuvida] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  function dadosAtuais() {
    return { titulo: titulo.trim(), cadeiraId, enunciado, estrutura, estado, notaDoProfessor, duvidas };
  }

  async function handleGuardar() {
    if (!titulo.trim()) return;
    setGuardando(true);
    if (novo) {
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

  function adicionarDuvida() {
    if (!novaDuvida.trim()) return;
    setDuvidas((d) => [...d, novaDuvida.trim()]);
    setNovaDuvida('');
  }

  function removerDuvida(i) {
    setDuvidas((d) => d.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <BotaoVoltar destino="/casos" texto="‹ Casos Práticos" />

      <input className="caso-editor__titulo" placeholder="Título do caso" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

      <div className="caso-editor__cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`caso-editor__cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>

      <label className="caso-editor__campo">
        <span className="caso-editor__label">Enunciado</span>
        <textarea className="caso-editor__textarea" rows={4} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Cola aqui o enunciado do caso..." />
      </label>

      {CAMPOS_ESTRUTURA.map((campo) => (
        <label key={campo.chave} className="caso-editor__campo">
          <span className="caso-editor__label">{campo.label}</span>
          <textarea
            className="caso-editor__textarea"
            rows={3}
            value={estrutura[campo.chave] || ''}
            onChange={(e) => setEstrutura((prev) => ({ ...prev, [campo.chave]: e.target.value }))}
            placeholder={campo.placeholder}
          />
        </label>
      ))}

      <div className="caso-editor__campo">
        <span className="caso-editor__label">Estado</span>
        <div className="caso-editor__estados">
          {ESTADOS.map((e) => (
            <button key={e.id} className={`caso-editor__estado-btn ${estado === e.id ? 'ativo' : ''}`} onClick={() => setEstado(e.id)}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="caso-editor__campo">
        <span className="caso-editor__label">Dúvidas por esclarecer</span>
        <div className="caso-editor__duvidas">
          {duvidas.map((d, i) => (
            <div key={i} className="caso-editor__duvida-chip">
              <span>{d}</span>
              <button onClick={() => removerDuvida(i)}>✕</button>
            </div>
          ))}
        </div>
        <div className="caso-editor__duvida-add">
          <input
            className="caso-editor__duvida-input"
            placeholder="Escreve uma dúvida e prime Enter"
            value={novaDuvida}
            onChange={(e) => setNovaDuvida(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarDuvida(); } }}
          />
          <button className="caso-editor__duvida-btn" onClick={adicionarDuvida}>+</button>
        </div>
      </div>

      <label className="caso-editor__campo">
        <span className="caso-editor__label">Nota / feedback do professor</span>
        <textarea className="caso-editor__textarea" rows={2} value={notaDoProfessor} onChange={(e) => setNotaDoProfessor(e.target.value)} placeholder="O que o professor disse na correção..." />
      </label>

      {aparecesEm.length > 0 && (
        <div className="caso-editor__campo">
          <span className="caso-editor__label">Onde este caso já apareceu</span>
          <div className="caso-editor__duvidas">
            {aparecesEm.map((item) => (
              <button key={item.tipo + item.id} className="caso-editor__duvida-chip" onClick={() => onIrPara(item)}>
                <span>{item.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="caso-editor__acoes">
        {!novo && (
          confirmarApagar ? (
            <div className="caso-editor__confirmar">
              <span>Apagar este caso?</span>
              <button className="caso-editor__btn-sim" onClick={handleApagar}>Sim</button>
              <button className="caso-editor__btn-nao" onClick={() => setConfirmarApagar(false)}>Não</button>
            </div>
          ) : (
            <button className="caso-editor__btn-apagar" onClick={() => setConfirmarApagar(true)}>Apagar</button>
          )
        )}
        <button className="caso-editor__btn-guardar" onClick={handleGuardar} disabled={guardando || !titulo.trim()}>
          {guardando ? 'A guardar...' : guardado ? '✓ Guardado' : novo ? 'Criar caso' : 'Guardar'}
        </button>
      </div>
    </>
  );
}
