// cronómetro de sessões de estudo
import { useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useCronometro } from '../hooks/useCronometro.js';
import { useSessoesEstudo } from '../hooks/useSessoesEstudo.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import MensagemCarinhosa from '../components/MensagemCarinhosa.jsx';
import { cadeirasS1, coresCadeiras, nomeCurtoCadeira } from '../data/dadosLeonor.js';
import './Estudo.css';

const MINUTOS_SESSAO_LONGA = 25;

function formatarTempo(segundosTotais) {
  const m = Math.floor(segundosTotais / 60);
  const s = segundosTotais % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatarDataHora(timestamp) {
  const d = timestamp?.toDate?.();
  if (!d) return '';
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${meses[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Estudo() {
  const { darkMode } = useTheme();
  const { segundos, aCorrer, pausasFeitas, iniciar, pausar, retomar, terminar } = useCronometro();
  const { sessoes, loading, registarSessao } = useSessoesEstudo();
  const [cadeiraId, setCadeiraId] = useState(null);
  const [ultimoResumo, setUltimoResumo] = useState(null);

  const iniciado = segundos > 0 || aCorrer;
  const cor = cadeiraId ? coresCadeiras[cadeiraId] : '#b8963e';
  const totalRecente = sessoes.reduce((soma, s) => soma + (s.minutos || 0), 0);

  async function handleTerminar() {
    const resumo = terminar();
    await registarSessao({ cadeiraId, ...resumo });
    setUltimoResumo(resumo);
    setTimeout(() => setUltimoResumo(null), 3000);
  }

  return (
    <div className={`estudo-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="estudo-header">
        <h1 className="estudo-titulo">Estudo</h1>
        <span className="estudo-subtitulo">{totalRecente} min nas últimas {sessoes.length} sessões</span>
      </header>

      <div className="estudo-cadeiras">
        <button className={`estudo-cadeira-btn ${!cadeiraId ? 'ativo' : ''}`} onClick={() => !iniciado && setCadeiraId(null)} disabled={iniciado}>
          Geral
        </button>
        {cadeirasS1.map((c) => (
          <button
            key={c.id}
            className={`estudo-cadeira-btn ${cadeiraId === c.id ? 'ativo' : ''}`}
            style={{ '--cor': c.cor }}
            onClick={() => !iniciado && setCadeiraId(c.id)}
            disabled={iniciado}
          >
            {c.abrev}
          </button>
        ))}
      </div>

      <div className="estudo-cronometro" style={{ '--cor': cor }}>
        <span className="estudo-cronometro__numero">{formatarTempo(segundos)}</span>
        {pausasFeitas > 0 && <span className="estudo-cronometro__pausas">{pausasFeitas} pausa{pausasFeitas === 1 ? '' : 's'}</span>}
      </div>

      <div className="estudo-acoes">
        {!iniciado && (
          <button className="estudo-btn-principal" style={{ '--cor': cor }} onClick={iniciar}>▶ Iniciar</button>
        )}
        {iniciado && aCorrer && (
          <>
            <button className="estudo-btn-secundario" onClick={pausar}>⏸ Pausar</button>
            <button className="estudo-btn-terminar" onClick={handleTerminar}>Terminar</button>
          </>
        )}
        {iniciado && !aCorrer && (
          <>
            <button className="estudo-btn-principal" style={{ '--cor': cor }} onClick={retomar}>▶ Retomar</button>
            <button className="estudo-btn-terminar" onClick={handleTerminar}>Terminar</button>
          </>
        )}
      </div>

      {ultimoResumo && (
        <div className="estudo-resumo">
          <p>✓ Sessão guardada: {ultimoResumo.minutos} min{ultimoResumo.pausasFeitas > 0 ? `, ${ultimoResumo.pausasFeitas} pausa${ultimoResumo.pausasFeitas === 1 ? '' : 's'}` : ''}</p>
          {ultimoResumo.minutos >= MINUTOS_SESSAO_LONGA && (
            <div className="estudo-resumo__mimo">
              <MensagemCarinhosa contexto="sessaoLonga" />
            </div>
          )}
        </div>
      )}

      <section className="estudo-historico">
        <h2 className="estudo-historico__titulo">Sessões recentes</h2>
        {loading && <p className="estudo-vazio">A carregar...</p>}
        {!loading && sessoes.length === 0 && <p className="estudo-vazio">Ainda não tens sessões registadas.</p>}
        <div className="estudo-historico__lista">
          {sessoes.map((s) => (
            <div key={s.id} className="estudo-sessao" style={{ '--cor': s.cadeiraId ? coresCadeiras[s.cadeiraId] : '#b8963e' }}>
              <span className="estudo-sessao__cadeira">{s.cadeiraId ? nomeCurtoCadeira(s.cadeiraId) : 'Geral'}</span>
              <span className="estudo-sessao__minutos">{s.minutos} min</span>
              <span className="estudo-sessao__data">{formatarDataHora(s.inicio)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
