// flashcards com repetição espaçada
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { estaPronto, ordenarPorPrioridade } from '../services/repeticaoEspacada.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { useBarney } from '../hooks/useBarney.jsx';
import { usePreferencias } from '../hooks/usePreferencias.js';
import SessaoVertical from '../components/estudo/SessaoVertical.jsx';
import SessaoStory from '../components/estudo/SessaoStory.jsx';
import { varianteValida } from '../services/modoEstudo.js';
import { anunciarEstudoConcluido } from '../services/eventosApp.js';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Flashcards.css';

export default function Flashcards() {
  const { darkMode } = useTheme();
  const { flashcards, loading, adicionar, apagar, registarResposta } = useFlashcards();
  const [filtroCadeira, setFiltroCadeira] = useState('todas');
  const [formAberto, setFormAberto] = useState(false);
  // a fila fica congelada quando a revisão começa (as respostas mudam os cartões prontos a meio da sessão)
  const [filaSessao, setFilaSessao] = useState(null);
  const { elemento: barney, disparar: dispararBarney } = useBarney();
  const prefs = usePreferencias();
  const location = useLocation();
  const [arrancou, setArrancou] = useState(false);

  const prontos = flashcards.filter((f) => estaPronto(f));
  const filtrados = flashcards.filter((f) => filtroCadeira === 'todas' || f.cadeiraId === filtroCadeira);
  const filaRevisao = ordenarPorPrioridade(prontos.filter((f) => filtroCadeira === 'todas' || f.cadeiraId === filtroCadeira));

  // vindo do Dashboard (toque num story ou em "continuar a rever"), começa logo a revisão dessa cadeira
  const pedido = location.state?.rever;
  if (pedido && !arrancou && !loading) {
    const doPedido = ordenarPorPrioridade(prontos.filter((f) => pedido === 'todas' || f.cadeiraId === pedido));
    setArrancou(true);
    if (pedido !== 'todas') setFiltroCadeira(pedido);
    if (doPedido.length > 0) setFilaSessao(doPedido);
  }

  return (
    <div className={`flashcards-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      {barney}
      <header className="flashcards-header">
        <div>
          <h1 className="flashcards-titulo">Flashcards</h1>
          <span className="flashcards-contador">{flashcards.length} no total</span>
        </div>
        <button className="flashcards-btn-novo" onClick={() => setFormAberto((f) => !f)}>{formAberto ? 'Fechar' : '+ Novo'}</button>
      </header>

      <div className="flashcards-revisao-card">
        <div>
          <strong>{prontos.length}</strong> pronto{prontos.length === 1 ? '' : 's'} para rever hoje
        </div>
        <button className="flashcards-btn-revisao" onClick={() => setFilaSessao(filaRevisao)} disabled={filaRevisao.length === 0}>
          ▶ Começar revisão
        </button>
      </div>

      {formAberto && <FormNovoFlashcard onGuardar={async (d) => { await adicionar(d); setFormAberto(false); }} />}

      <div className="flashcards-filtros">
        <button className={`flashcards-filtro-btn ${filtroCadeira === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroCadeira('todas')}>Todas</button>
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`flashcards-filtro-btn ${filtroCadeira === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setFiltroCadeira(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>

      {loading && <p className="flashcards-vazio">A carregar...</p>}
      {!loading && filtrados.length === 0 && <p className="flashcards-vazio">Ainda não tens flashcards aqui. Toca em "+ Novo" para começares.</p>}

      <div className="flashcards-lista">
        {filtrados.map((f) => (
          <FlashcardMini key={f.id} flashcard={f} onApagar={() => apagar(f.id)} />
        ))}
      </div>

      {filaSessao && (varianteValida(prefs.estudoVisual) === 'story' ? (
        <SessaoStory
          fila={filaSessao}
          todos={flashcards}
          onResponder={registarResposta}
          onFechar={() => setFilaSessao(null)}
          onConcluir={() => { dispararBarney('flashcards'); anunciarEstudoConcluido(); }}
        />
      ) : (
        <SessaoVertical
          fila={filaSessao}
          variante={prefs.estudoVisual}
          onResponder={registarResposta}
          onFechar={() => setFilaSessao(null)}
          onConcluir={() => { dispararBarney('flashcards'); anunciarEstudoConcluido(); }}
        />
      ))}
    </div>
  );
}

function FormNovoFlashcard({ onGuardar }) {
  const [frente, setFrente] = useState('');
  const [tras, setTras] = useState('');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [aGuardar, setAGuardar] = useState(false);

  async function guardar() {
    if (!frente.trim() || !tras.trim()) return;
    setAGuardar(true);
    await onGuardar({ frente: frente.trim(), tras: tras.trim(), cadeiraId });
    setAGuardar(false);
  }

  return (
    <div className="flashcards-form-novo">
      <div className="flashcards-form-novo__cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`flashcards-chip-cadeira ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
        ))}
      </div>
      <textarea className="flashcards-form-novo__textarea" placeholder="Frente — a pergunta" rows={2} value={frente} onChange={(e) => setFrente(e.target.value)} autoFocus />
      <textarea className="flashcards-form-novo__textarea" placeholder="Trás — a resposta" rows={2} value={tras} onChange={(e) => setTras(e.target.value)} />
      <button className="flashcards-form-novo__guardar" onClick={guardar} disabled={aGuardar || !frente.trim() || !tras.trim()}>
        {aGuardar ? 'A guardar...' : 'Guardar'}
      </button>
    </div>
  );
}

function FlashcardMini({ flashcard, onApagar }) {
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const cor = coresCadeiras[flashcard.cadeiraId] || '#b8963e';
  const pronto = estaPronto(flashcard);

  return (
    <div className="flashcard-mini" style={{ '--cor': cor }}>
      <div className="flashcard-mini__topo">
        <span className="flashcard-mini__cadeira">{abrevCadeiras[flashcard.cadeiraId]}</span>
        <span className={`flashcard-mini__estado ${pronto ? 'pronto' : ''}`}>{pronto ? 'Pronto a rever' : 'Ainda não'}</span>
      </div>
      <p className="flashcard-mini__frente">{flashcard.frente}</p>
      <div className="flashcard-mini__niveis">
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={`flashcard-mini__nivel-dot ${(flashcard.nivel ?? 0) >= n ? 'ativo' : ''}`} />
        ))}
      </div>
      <div className="flashcard-mini__rodape">
        {!confirmarApagar ? (
          <button className="flashcard-mini__link" onClick={() => setConfirmarApagar(true)}>Apagar</button>
        ) : (
          <span className="flashcard-mini__confirmar">Apagar? <button className="flashcard-mini__link" onClick={onApagar}>Sim</button> / <button className="flashcard-mini__link" onClick={() => setConfirmarApagar(false)}>Não</button></span>
        )}
      </div>
    </div>
  );
}
