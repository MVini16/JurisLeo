// as cartas do feed: cada tipo de conteúdo é uma carta em ecrã inteiro com a cor da cadeira (estilo "cartaz")
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coresCadeiras, nomesCadeiras, nomeCurtoCadeira } from '../../data/dadosLeonor.js';
import { ESTADOS_AULA } from '../../data/estadosAula.js';
import { chaveAula } from '../../services/presencas.js';
import Icone from '../icones/Icone.jsx';
import './Cartas.css';

function vibrar(ms) {
  try { navigator.vibrate?.(ms); } catch { /* sem vibração */ }
}

// moldura comum: fundo na cor da cadeira, etiqueta no topo e ações ao lado
function Moldura({ cadeiraId, rotulo, ativa, guardada, onGuardar, onAbrir, tipo, children }) {
  const cor = coresCadeiras[cadeiraId] || 'var(--burgundy)';
  return (
    <section className={`fc-carta fc-carta--${tipo} ${ativa ? 'ativa' : ''}`} style={{ '--cor': cor }} onDoubleClick={onGuardar}>
      <div className="fc-carta__fundo" aria-hidden="true" />
      <header className="fc-carta__cabeca">
        <span className="fc-carta__rotulo">{rotulo}</span>
        {cadeiraId && <span className="fc-carta__cadeira">{nomeCurtoCadeira(cadeiraId)}</span>}
      </header>
      <div className="fc-carta__corpo">{children}</div>
      <div className="fc-carta__lado">
        {onGuardar && (
          <button type="button" className={`fc-acao ${guardada ? 'on' : ''}`} onClick={onGuardar} aria-pressed={!!guardada} aria-label={guardada ? 'Tirar dos guardados' : 'Guardar'}>
            <Icone nome="guardar" tamanho={26} ativo={!!guardada} /><span>{guardada ? 'Guardada' : 'Guardar'}</span>
          </button>
        )}
        {onAbrir && (
          <button type="button" className="fc-acao" onClick={onAbrir} aria-label="Abrir na app">
            <Icone nome="abrir" tamanho={26} /><span>Abrir</span>
          </button>
        )}
      </div>
    </section>
  );
}

export function CartaFlashcard({ carta, onResponder, ...resto }) {
  const navigate = useNavigate();
  const [virado, setVirado] = useState(false);
  const [feito, setFeito] = useState(null);
  const f = carta.item;

  function responder(acertou) {
    if (feito !== null) return;
    vibrar(acertou ? 12 : [8, 40, 8]);
    setFeito(acertou);
    onResponder(carta, acertou);
  }

  return (
    <Moldura tipo="flashcard" cadeiraId={carta.cadeiraId} rotulo="Flashcard" onAbrir={() => navigate('/flashcards')} {...resto}>
      <button type="button" className={`fc-virar ${virado ? 'virado' : ''}`} onClick={() => setVirado((v) => !v)} aria-label={virado ? 'Ver a pergunta' : 'Ver a resposta'}>
        <span className="fc-virar__miolo">
          <span className="fc-virar__face"><b>{f.frente}</b><small>toca para ver a resposta</small></span>
          <span className="fc-virar__face fc-virar__face--tras"><b>{f.tras}</b></span>
        </span>
      </button>
      <div className={`fc-resp ${virado ? 'visivel' : ''}`}>
        <button type="button" className={`fc-resp__bt errado ${feito === false ? 'feito' : ''}`} onClick={() => responder(false)} disabled={!virado || feito !== null}>
          <Icone nome="naosabia" tamanho={22} /> Não sabia
        </button>
        <button type="button" className={`fc-resp__bt certo ${feito === true ? 'feito' : ''}`} onClick={() => responder(true)} disabled={!virado || feito !== null}>
          <Icone nome="sabia" tamanho={22} /> Sabia
        </button>
      </div>
    </Moldura>
  );
}

// verdadeiro ou falso e escolha múltipla partilham o desenho: opções, feedback e explicação com a fonte
export function CartaPergunta({ carta, onResponder, ...resto }) {
  const navigate = useNavigate();
  const [escolha, setEscolha] = useState(null);
  const p = carta.item;
  const vf = carta.tipo === 'vf';
  const opcoes = vf ? ['Verdadeiro', 'Falso'] : p.opcoes;
  const certa = vf ? (p.verdade ? 0 : 1) : p.certa;

  function escolher(i) {
    if (escolha !== null) return;
    vibrar(i === certa ? 12 : [8, 40, 8]);
    setEscolha(i);
    onResponder(carta, i === certa);
  }

  return (
    <Moldura tipo={carta.tipo} cadeiraId={carta.cadeiraId} rotulo={vf ? 'Verdadeiro ou falso' : 'Escolha múltipla'} onAbrir={() => navigate('/jogos')} {...resto}>
      <h2 className="fc-titulo">{vf ? p.afirmacao : p.pergunta}</h2>
      <div className={`fc-opcoes ${vf ? 'duas' : ''}`}>
        {opcoes.map((o, i) => (
          <button key={o} type="button" disabled={escolha !== null}
            className={`fc-opcao ${escolha !== null && i === certa ? 'certa' : ''} ${escolha === i && i !== certa ? 'errada' : ''}`} onClick={() => escolher(i)}>
            {o}
          </button>
        ))}
      </div>
      {escolha !== null && (
        <p className="fc-feedback" role="status">
          <b>{escolha === certa ? 'Certo.' : 'Não era essa.'}</b> {p.explicacao} {p.fonte && <small>Fonte: {p.fonte}. Confirma no código ou no manual.</small>}
        </p>
      )}
    </Moldura>
  );
}

export function CartaGlossario({ carta, ...resto }) {
  const navigate = useNavigate();
  const t = carta.item;
  return (
    <Moldura tipo="glossario" cadeiraId={carta.cadeiraId} rotulo="Glossário" onAbrir={() => navigate('/glossario')} {...resto}>
      <Icone nome="livro" tamanho={40} className="fc-grande" />
      <h2 className="fc-titulo fc-titulo--termo">{t.termo}</h2>
      <p className="fc-texto">{t.significado}</p>
    </Moldura>
  );
}

// a aula de hoje (ou de um dia passado) por marcar: os mesmos estados do calendário
export function CartaAula({ carta, marca, onMarcar, ...resto }) {
  const navigate = useNavigate();
  const ev = carta.evento;
  const data = ev.data instanceof Date ? ev.data : null;
  const quando = data ? `${String(data.getDate()).padStart(2, '0')}-${String(data.getMonth() + 1).padStart(2, '0')}` : '';
  return (
    <Moldura tipo="aula" cadeiraId={carta.cadeiraId} rotulo="Aula por marcar" onAbrir={() => navigate('/calendario')} {...resto}>
      <Icone nome="calendario" tamanho={40} className="fc-grande" />
      <h2 className="fc-titulo">{ev.titulo}</h2>
      <p className="fc-texto">{quando} às {ev.horaInicio}{ev.sala ? `, sala ${ev.sala}` : ''}. Como correu?</p>
      <div className="fc-opcoes">
        {ESTADOS_AULA.map((e) => (
          <button key={e.id} type="button" className={`fc-opcao ${marca?.estado === e.id ? 'certa' : ''}`} onClick={() => { vibrar(12); onMarcar(ev, { estado: e.id }); }} disabled={!!marca}>
            {e.rotulo}
          </button>
        ))}
      </div>
      {marca && <p className="fc-feedback" role="status"><b>Marcado.</b> Podes corrigir no calendário ({chaveAula(ev) ? 'aula guardada' : ''}).</p>}
    </Moldura>
  );
}

// avisos: faltas em risco, frequência a chegar, tarefa a vencer
export function CartaAviso({ carta, ...resto }) {
  const navigate = useNavigate();
  if (carta.tipo === 'faltas') {
    const a = carta.alerta;
    return (
      <Moldura tipo="aviso" cadeiraId={carta.cadeiraId} rotulo="Faltas" onAbrir={() => navigate('/faltas')} {...resto}>
        <Icone nome="escudo" tamanho={40} className="fc-grande" />
        <h2 className="fc-titulo">{a.excluida ? `${nomesCadeiras[a.cadeiraId]}: em risco de exclusão` : `${nomesCadeiras[a.cadeiraId]}: atenção às faltas`}</h2>
        <p className="fc-texto">{a.dadas} aulas práticas dadas, {a.injustificadas} faltas injustificadas e {a.justificadas} justificadas.</p>
        <button type="button" className="fc-cta" onClick={() => navigate('/faltas')}>Ver as faltas</button>
      </Moldura>
    );
  }
  if (carta.tipo === 'frequencia') {
    const f = carta.frequencia;
    return (
      <Moldura tipo="aviso" cadeiraId={carta.cadeiraId} rotulo="Frequência" onAbrir={() => navigate('/calendario')} {...resto}>
        <Icone nome="alvo" tamanho={40} className="fc-grande" viva />
        <h2 className="fc-titulo">{f.dias === 0 ? 'É hoje' : f.dias === 1 ? 'É amanhã' : `Daqui a ${f.dias} dias`}</h2>
        <p className="fc-texto">{f.titulo}{f.data ? ` · ${f.data}` : ''}</p>
        <button type="button" className="fc-cta" onClick={() => navigate('/flashcards', { state: { rever: carta.cadeiraId || 'todas' } })}>Rever agora</button>
      </Moldura>
    );
  }
  return (
    <Moldura tipo="aviso" cadeiraId={carta.cadeiraId} rotulo="Tarefa a vencer" onAbrir={() => navigate('/tarefas')} {...resto}>
      <Icone nome="relogio" tamanho={40} className="fc-grande" />
      <h2 className="fc-titulo">{carta.tarefa.titulo}</h2>
      <p className="fc-texto">Prazo: {carta.tarefa.prazo}</p>
      <button type="button" className="fc-cta" onClick={() => navigate('/tarefas')}>Abrir as tarefas</button>
    </Moldura>
  );
}
