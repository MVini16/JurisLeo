// página de tarefas da jurisleo
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import { useTarefas } from '../hooks/useTarefas.js';
import { coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Tarefas.css';
import Carregando from '../components/animacoes/Carregando.jsx';
import MarteloJuiz from '../components/animacoes/MarteloJuiz.jsx';
import TextareaRevista from '../components/TextareaRevista.jsx';

// cores e nomes por cadeira
const CORES_CADEIRA = coresCadeiras;
const NOMES_CADEIRA = abrevCadeiras;

// tipos de tarefa
const TIPOS = [
  { id: 'resumo',      label: 'Resumo',       icon: '📄' },
  { id: 'caso',        label: 'Caso Prático',  icon: '⚖️' },
  { id: 'leitura',     label: 'Leitura',       icon: '📖' },
  { id: 'exercicio',   label: 'Exercício',     icon: '✏️' },
  { id: 'outro',       label: 'Outro',         icon: '📌' },
];

// prioridades
const PRIORIDADES = [
  { id: 'alta',  label: 'Alta',  cor: '#e53935' },
  { id: 'media', label: 'Média', cor: '#f9a825' },
  { id: 'baixa', label: 'Baixa', cor: '#43a047' },
];

// formata data para exibição
function formatarData(dataStr) {
  if (!dataStr) return null;
  const d = new Date(dataStr + 'T00:00:00');
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

// verifica se uma tarefa está atrasada
function estaAtrasada(dataStr) {
  if (!dataStr) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(dataStr + 'T00:00:00');
  return prazo < hoje;
}

export default function Tarefas() {
  const { tarefas, loading } = useTarefas();
  const location = useLocation();
  const [filtro, setFiltro] = useState('todas'); // 'todas' ou id da cadeira
  const [agrupamento, setAgrupamento] = useState('cadeira'); // 'cadeira' ou 'prazo'
  // abre logo o modal se vier do menu + com o pedido de nova tarefa
  const [modalAberto, setModalAberto] = useState(!!location.state?.abrirModal);
  const [tarefaEditar, setTarefaEditar] = useState(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 50);
    return () => clearTimeout(t);
  }, []);

  // filtra tarefas pela cadeira selecionada
  const tarefasFiltradas = tarefas.filter(t =>
    filtro === 'todas' ? true : t.cadeira === filtro
  );

  // separa pendentes das concluídas
  const pendentes = tarefasFiltradas.filter(t => !t.concluida);
  const concluidas = tarefasFiltradas.filter(t => t.concluida);

  // agrupa por cadeira
  function agruparPorCadeira(lista) {
    const grupos = {};
    lista.forEach(t => {
      const chave = t.cadeira || 'outro';
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(t);
    });
    return grupos;
  }

  // agrupa por prazo (hoje, esta semana, mais tarde, sem prazo)
  function agruparPorPrazo(lista) {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const fimSemana = new Date(hoje); fimSemana.setDate(hoje.getDate() + 7);
    const grupos = { 'Atrasadas': [], 'Hoje': [], 'Esta Semana': [], 'Mais Tarde': [], 'Sem Prazo': [] };
    lista.forEach(t => {
      if (!t.prazo) { grupos['Sem Prazo'].push(t); return; }
      const p = new Date(t.prazo + 'T00:00:00');
      if (p < hoje) grupos['Atrasadas'].push(t);
      else if (p.toDateString() === hoje.toDateString()) grupos['Hoje'].push(t);
      else if (p <= fimSemana) grupos['Esta Semana'].push(t);
      else grupos['Mais Tarde'].push(t);
    });
    // remove grupos vazios
    Object.keys(grupos).forEach(k => { if (grupos[k].length === 0) delete grupos[k]; });
    return grupos;
  }

  const grupos = agrupamento === 'cadeira'
    ? agruparPorCadeira(pendentes)
    : agruparPorPrazo(pendentes);

  async function concluirTarefa(tarefa) {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'tarefas', tarefa.id);
    await updateDoc(ref, { concluida: !tarefa.concluida });
  }

  async function apagarTarefa(tarefaId) {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'tarefas', tarefaId));
  }

  return (
    <div className={`tarefas-wrapper ${visivel ? 'visivel' : ''}`}>

      {/* cabeçalho */}
      <div className="tarefas-header anim-entrada" style={{ '--delay': '0s' }}>
        <div className="tarefas-header__esquerda">
          <h1 className="tarefas-titulo">Tarefas</h1>
          <span className="tarefas-contador">
            {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className="tarefas-btn-add" onClick={() => { setTarefaEditar(null); setModalAberto(true); }}>
          + Nova Tarefa
        </button>
      </div>

      {/* filtros por cadeira */}
      <div className="tarefas-filtros anim-entrada" style={{ '--delay': '0.05s' }}>
        <button className={`filtro-btn ${filtro === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltro('todas')}>
          Todas
        </button>
        {Object.entries(NOMES_CADEIRA).map(([id, nome]) => (
          <button
            key={id}
            className={`filtro-btn ${filtro === id ? 'ativo' : ''}`}
            style={{ '--cor': CORES_CADEIRA[id] }}
            onClick={() => setFiltro(id)}
          >
            {nome}
          </button>
        ))}
      </div>

      {/* toggle de agrupamento */}
      <div className="tarefas-agrupamento anim-entrada" style={{ '--delay': '0.1s' }}>
        <button className={`agrup-btn ${agrupamento === 'cadeira' ? 'ativo' : ''}`} onClick={() => setAgrupamento('cadeira')}>
          📚 Por Cadeira
        </button>
        <button className={`agrup-btn ${agrupamento === 'prazo' ? 'ativo' : ''}`} onClick={() => setAgrupamento('prazo')}>
          📅 Por Prazo
        </button>
      </div>

      {/* conteúdo */}
      <div className="tarefas-conteudo">

        {loading && (
          <Carregando texto="A carregar tarefas..." />
        )}

        {!loading && pendentes.length === 0 && concluidas.length === 0 && (
          <div className="tarefas-vazio anim-entrada" style={{ '--delay': '0.2s' }}>
            <span className="tarefas-vazio__icon">📋</span>
            <p>Nenhuma tarefa por aqui.</p>
            <span>Adiciona a primeira! 👆</span>
          </div>
        )}

        {/* grupos de tarefas pendentes */}
        {Object.entries(grupos).map(([grupo, lista], gi) => (
          <div key={grupo} className="tarefas-grupo anim-entrada" style={{ '--delay': `${0.15 + gi * 0.05}s` }}>
            <div className="tarefas-grupo__header">
              {agrupamento === 'cadeira' ? (
                <>
                  <span className="tarefas-grupo__dot" style={{ background: CORES_CADEIRA[grupo] || '#b8963e' }} />
                  <span className="tarefas-grupo__nome">{NOMES_CADEIRA[grupo] || grupo.toUpperCase()}</span>
                </>
              ) : (
                <span className={`tarefas-grupo__nome ${grupo === 'Atrasadas' ? 'atrasado' : ''}`}>{grupo}</span>
              )}
              <span className="tarefas-grupo__count">{lista.length}</span>
            </div>

            <div className="tarefas-grupo__lista">
              {lista.map((tarefa, ti) => (
                <TarefaCard
                  key={tarefa.id}
                  tarefa={tarefa}
                  delay={ti * 0.04}
                  onConcluir={() => concluirTarefa(tarefa)}
                  onEditar={() => { setTarefaEditar(tarefa); setModalAberto(true); }}
                  onApagar={() => apagarTarefa(tarefa.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* secção de concluídas */}
        {concluidas.length > 0 && (
          <SecaoConcluidas
            concluidas={concluidas}
            onConcluir={concluirTarefa}
            onApagar={apagarTarefa}
          />
        )}

      </div>

      {/* modal de criar/editar tarefa */}
      {modalAberto && (
        <ModalTarefa
          tarefaExistente={tarefaEditar}
          onFechar={() => { setModalAberto(false); setTarefaEditar(null); }}
        />
      )}

    </div>
  );
}

// ------------------------------------------------------------------
// card de tarefa individual
// ------------------------------------------------------------------
function TarefaCard({ tarefa, delay, onConcluir, onEditar, onApagar }) {
  const [concluindo, setConcluindo] = useState(false);
  const [martelo, setMartelo] = useState(false);
  const [confirmApagar, setConfirmApagar] = useState(false);
  const cor = CORES_CADEIRA[tarefa.cadeira] || '#b8963e';
  const tipo = TIPOS.find(t => t.id === tarefa.tipo);
  const prioridade = PRIORIDADES.find(p => p.id === tarefa.prioridade);
  const atrasada = estaAtrasada(tarefa.prazo) && !tarefa.concluida;

  async function handleConcluir() {
    setConcluindo(true);
    // ao concluir (não ao desfazer), o martelo de juiz bate
    if (!tarefa.concluida) {
      setMartelo(true);
      setTimeout(() => setMartelo(false), 950);
    }
    await onConcluir();
    setConcluindo(false);
  }

  return (
    <div
      className={`tarefa-card ${tarefa.concluida ? 'concluida' : ''} ${atrasada ? 'atrasada' : ''}`}
      style={{ '--cor': cor, '--delay': `${delay}s` }}
    >
      {martelo && <MarteloJuiz />}

      {/* barra colorida à esquerda */}
      <div className="tarefa-card__barra" style={{ background: cor }} />

      {/* checkbox */}
      <button
        className={`tarefa-card__check ${concluindo ? 'a-concluir' : ''} ${tarefa.concluida ? 'feito' : ''}`}
        onClick={handleConcluir}
        style={{ '--cor': cor }}
      >
        {tarefa.concluida && <span className="check-tick">✓</span>}
      </button>

      {/* conteúdo */}
      <div className="tarefa-card__corpo">
        <div className="tarefa-card__topo">
          <span className="tarefa-card__titulo">{tarefa.titulo}</span>
          {prioridade && (
            <span className="tarefa-card__prioridade" style={{ color: prioridade.cor, borderColor: prioridade.cor }}>
              {prioridade.label}
            </span>
          )}
        </div>

        <div className="tarefa-card__meta">
          {tipo && <span className="tarefa-card__tipo">{tipo.icon} {tipo.label}</span>}
          {tarefa.prazo && (
            <span className={`tarefa-card__prazo ${atrasada ? 'atrasado' : ''}`}>
              📅 {formatarData(tarefa.prazo)}
              {atrasada && ' • Atrasada'}
            </span>
          )}
        </div>

        {tarefa.notas && (
          <p className="tarefa-card__notas">{tarefa.notas}</p>
        )}
      </div>

      {/* acções */}
      <div className="tarefa-card__acoes">
        {!confirmApagar ? (
          <>
            <button className="tarefa-card__btn-editar" onClick={onEditar}>✏️</button>
            <button className="tarefa-card__btn-apagar" onClick={() => setConfirmApagar(true)}>🗑️</button>
          </>
        ) : (
          <div className="tarefa-card__confirmar">
            <button className="tarefa-card__btn-sim" onClick={onApagar}>Sim</button>
            <button className="tarefa-card__btn-nao" onClick={() => setConfirmApagar(false)}>Não</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// secção de tarefas concluídas (colapsável)
// ------------------------------------------------------------------
function SecaoConcluidas({ concluidas, onConcluir, onApagar }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="tarefas-concluidas">
      <button className="tarefas-concluidas__toggle" onClick={() => setAberto(!aberto)}>
        <span>✅ Concluídas ({concluidas.length})</span>
        <span className={`toggle-seta ${aberto ? 'aberto' : ''}`}>›</span>
      </button>
      {aberto && (
        <div className="tarefas-concluidas__lista">
          {concluidas.map((tarefa, i) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              delay={i * 0.03}
              onConcluir={() => onConcluir(tarefa)}
              onEditar={() => {}}
              onApagar={() => onApagar(tarefa.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// modal de criar / editar tarefa
// ------------------------------------------------------------------
function ModalTarefa({ tarefaExistente, onFechar }) {
  const isEditar = !!tarefaExistente;

  const [titulo, setTitulo] = useState(tarefaExistente?.titulo || '');
  const [cadeira, setCadeira] = useState(tarefaExistente?.cadeira || '');
  const [tipo, setTipo] = useState(tarefaExistente?.tipo || 'outro');
  const [prioridade, setPrioridade] = useState(tarefaExistente?.prioridade || 'media');
  const [prazo, setPrazo] = useState(tarefaExistente?.prazo || '');
  const [notas, setNotas] = useState(tarefaExistente?.notas || '');
  const [guardando, setGuardando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function guardar() {
    if (!titulo.trim()) return;
    setGuardando(true);

    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const dados = {
      titulo: titulo.trim(),
      cadeira,
      tipo,
      prioridade,
      prazo,
      notas: notas.trim(),
      concluida: tarefaExistente?.concluida || false,
      atualizadoEm: serverTimestamp(),
    };

    try {
      if (isEditar) {
        // atualiza tarefa existente
        await updateDoc(doc(db, 'users', userId, 'tarefas', tarefaExistente.id), dados);
      } else {
        // cria nova tarefa
        await addDoc(collection(db, 'users', userId, 'tarefas'), {
          ...dados,
          criadoEm: serverTimestamp(),
        });
      }

      setSucesso(true);
      setTimeout(onFechar, 900);
    } catch {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-tarefa" onClick={e => e.stopPropagation()}>

        {/* handle para mobile */}
        <div className="modal-tarefa__handle" />

        <h2 className="modal-tarefa__titulo">
          {isEditar ? '✏️ Editar Tarefa' : '+ Nova Tarefa'}
        </h2>

        {/* título */}
        <div className="modal-campo anim-modal" style={{ '--i': 0 }}>
          <label className="modal-label">Título</label>
          <input
            className="modal-input"
            placeholder="O que tens de fazer?"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            autoFocus
          />
        </div>

        {/* cadeira */}
        <div className="modal-campo anim-modal" style={{ '--i': 1 }}>
          <label className="modal-label">Cadeira</label>
          <div className="modal-opcoes">
            {Object.entries(NOMES_CADEIRA).map(([id, nome]) => (
              <button
                key={id}
                className={`modal-opcao-cadeira ${cadeira === id ? 'ativo' : ''}`}
                style={{ '--cor': CORES_CADEIRA[id] }}
                onClick={() => setCadeira(id)}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>

        {/* tipo */}
        <div className="modal-campo anim-modal" style={{ '--i': 2 }}>
          <label className="modal-label">Tipo</label>
          <div className="modal-opcoes">
            {TIPOS.map(t => (
              <button
                key={t.id}
                className={`modal-opcao-tipo ${tipo === t.id ? 'ativo' : ''}`}
                onClick={() => setTipo(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* prioridade */}
        <div className="modal-campo anim-modal" style={{ '--i': 3 }}>
          <label className="modal-label">Prioridade</label>
          <div className="modal-opcoes">
            {PRIORIDADES.map(p => (
              <button
                key={p.id}
                className={`modal-opcao-prioridade ${prioridade === p.id ? 'ativo' : ''}`}
                style={{ '--cor': p.cor }}
                onClick={() => setPrioridade(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* prazo */}
        <div className="modal-campo anim-modal" style={{ '--i': 4 }}>
          <label className="modal-label">Prazo</label>
          <input
            className="modal-input modal-input--data"
            type="date"
            value={prazo}
            onChange={e => setPrazo(e.target.value)}
          />
        </div>

        {/* notas */}
        <div className="modal-campo anim-modal" style={{ '--i': 5 }}>
          <label className="modal-label">Notas</label>
          <TextareaRevista
            className="modal-textarea"
            placeholder="Notas opcionais..."
            value={notas}
            onValor={setNotas}
            rows={3}
          />
        </div>

        {/* botão guardar */}
        <button
          className={`modal-btn-guardar ${sucesso ? 'sucesso' : ''}`}
          onClick={guardar}
          disabled={guardando || !titulo.trim()}
        >
          {sucesso ? '✓ Guardado!' : guardando ? 'A guardar...' : isEditar ? 'Guardar Alterações' : 'Criar Tarefa'}
        </button>

      </div>
    </div>
  );
}