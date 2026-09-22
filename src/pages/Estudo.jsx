// cronómetro de sessões de estudo
import { useState, useEffect } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useCronometro } from '../hooks/useCronometro.js';
import { useSessoesEstudo } from '../hooks/useSessoesEstudo.js';
import { useTarefas } from '../hooks/useTarefas.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import MensagemCarinhosa from '../components/MensagemCarinhosa.jsx';
import { cadeirasS1, coresCadeiras, nomeCurtoCadeira } from '../data/dadosLeonor.js';
import './Estudo.css';
import Carregando from '../components/animacoes/Carregando.jsx';

const MINUTOS_SESSAO_LONGA = 25;
// preferência deste aparelho: uma sessão por terminar, para oferecer continuar depois de sair
const CHAVE_SESSAO_A_MEIO = 'jurisleo-sessao-a-meio';

function lerSessaoAMeio() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO_A_MEIO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

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
  const { tarefas } = useTarefas();
  const [cadeiraId, setCadeiraId] = useState(null);
  const [tarefaId, setTarefaId] = useState(null);
  const [ultimoResumo, setUltimoResumo] = useState(null);
  // o que ficou a meio antes deste ecrã montar — não o que está a decorrer agora
  const [sessaoAMeio, setSessaoAMeio] = useState(lerSessaoAMeio);

  const iniciado = segundos > 0 || aCorrer;
  const cor = cadeiraId ? coresCadeiras[cadeiraId] : '#b8963e';
  const totalRecente = sessoes.reduce((soma, s) => soma + (s.minutos || 0), 0);
  const tarefasPendentes = tarefas.filter((t) => !t.concluida);

  // guarda o ponto onde vai, enquanto a sessão decorre, para poder oferecer "continuar" se ela sair
  useEffect(() => {
    if (!iniciado) return;
    const snapshot = { cadeiraId, tarefaId, inicioMs: Date.now() - segundos * 1000, pausasFeitas };
    try { localStorage.setItem(CHAVE_SESSAO_A_MEIO, JSON.stringify(snapshot)); } catch { /* sem localStorage, só não oferece continuar */ }
  }, [iniciado, segundos, cadeiraId, tarefaId, pausasFeitas]);

  function continuarSessaoAMeio() {
    if (!sessaoAMeio) return;
    setCadeiraId(sessaoAMeio.cadeiraId);
    setTarefaId(sessaoAMeio.tarefaId);
    const passados = Math.max(0, Math.round((Date.now() - sessaoAMeio.inicioMs) / 1000));
    iniciar({ retomarDe: { inicio: new Date(sessaoAMeio.inicioMs), segundos: passados, pausasFeitas: sessaoAMeio.pausasFeitas } });
    setSessaoAMeio(null);
  }

  function descartarSessaoAMeio() {
    try { localStorage.removeItem(CHAVE_SESSAO_A_MEIO); } catch { /* nada a fazer */ }
    setSessaoAMeio(null);
  }

  async function handleTerminar() {
    const resumo = terminar();
    await registarSessao({ cadeiraId, tarefaId, ...resumo });
    setUltimoResumo(resumo);
    try { localStorage.removeItem(CHAVE_SESSAO_A_MEIO); } catch { /* nada a fazer */ }
    setTimeout(() => setUltimoResumo(null), 3000);
  }

  return (
    <div className={`estudo-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="estudo-header">
        <h1 className="estudo-titulo">Estudo</h1>
        <span className="estudo-subtitulo">{totalRecente} min nas últimas {sessoes.length} sessões</span>
      </header>

      {sessaoAMeio && !iniciado && (
        <div className="estudo-sessao-meio">
          <p>Ficou uma sessão a meio{sessaoAMeio.cadeiraId ? ` (${nomeCurtoCadeira(sessaoAMeio.cadeiraId)})` : ''}. Continuar de onde ficaste?</p>
          <div className="estudo-sessao-meio__acoes">
            <button className="estudo-btn-secundario" onClick={continuarSessaoAMeio}>Continuar</button>
            <button className="estudo-btn-secundario" onClick={descartarSessaoAMeio}>Descartar</button>
          </div>
        </div>
      )}

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

      {tarefasPendentes.length > 0 && (
        <label className="estudo-tarefa">
          <span>Ligar a uma tarefa (opcional)</span>
          <select className="estudo-tarefa__select" value={tarefaId || ''} onChange={(e) => setTarefaId(e.target.value || null)} disabled={iniciado}>
            <option value="">Nenhuma</option>
            {tarefasPendentes.map((t) => (
              <option key={t.id} value={t.id}>{t.titulo}</option>
            ))}
          </select>
        </label>
      )}

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
        {loading && <Carregando texto="A carregar..." />}
        {!loading && sessoes.length === 0 && <p className="estudo-vazio">Ainda não tens sessões registadas.</p>}
        <div className="estudo-historico__lista">
          {sessoes.map((s) => (
            <div key={s.id} className="estudo-sessao" style={{ '--cor': s.cadeiraId ? coresCadeiras[s.cadeiraId] : '#b8963e' }}>
              <span className="estudo-sessao__cadeira">{s.cadeiraId ? nomeCurtoCadeira(s.cadeiraId) : 'Geral'}</span>
              {s.tarefaId && tarefas.find((t) => t.id === s.tarefaId) && (
                <span className="estudo-sessao__tarefa">{tarefas.find((t) => t.id === s.tarefaId).titulo}</span>
              )}
              <span className="estudo-sessao__minutos">{s.minutos} min</span>
              <span className="estudo-sessao__data">{formatarDataHora(s.inicio)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
