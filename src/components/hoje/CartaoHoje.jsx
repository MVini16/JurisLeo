// o bloco "Hoje" no topo do dashboard, em quatro versões (série e meta, stories, desafio, barra).
// lê os flashcards e as tarefas que a app já usa; a série e a meta do dia vêm de localStorage
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '../../hooks/useFlashcards.js';
import { usePreferencias } from '../../hooks/usePreferencias.js';
import { cadeirasS1 } from '../../data/dadosLeonor.js';
import { lerDiasDeEstudo, lerRespondidasDeHoje } from '../../services/estudoLocal.js';
import { diaDe, serieDeDias } from '../../services/modoEstudo.js';
import {
  META_DIARIA, desafioDoDia, progressoDaMeta, prontosPorCadeira, tarefasAVencer, totalProntos, varianteHojeValida,
} from '../../services/hoje.js';
import './CartaoHoje.css';

const RAIO = 36;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function diasTexto(n) { return `${n} ${n === 1 ? 'dia seguido' : 'dias seguidos'}`; }

export default function CartaoHoje({ tarefas }) {
  const prefs = usePreferencias();
  const variante = varianteHojeValida(prefs.hojeVisual);
  const navigate = useNavigate();
  const { flashcards, loading } = useFlashcards();
  const [desafioVirado, setDesafioVirado] = useState(false);

  // a data de hoje fixa-se quando o cartão aparece, para as contas não mudarem a meio da renderização
  const [hoje] = useState(() => diaDe(Date.now()));
  const [agora] = useState(() => new Date());
  const serie = useMemo(() => serieDeDias(lerDiasDeEstudo(), hoje), [hoje]);
  const respondidas = useMemo(() => lerRespondidasDeHoje(hoje), [hoje]);
  const prontos = useMemo(() => totalProntos(flashcards, agora), [flashcards, agora]);
  const porCadeira = useMemo(() => prontosPorCadeira(flashcards, agora), [flashcards, agora]);
  const aVencer = useMemo(() => tarefasAVencer(tarefas, hoje).length, [tarefas, hoje]);
  const desafio = useMemo(() => desafioDoDia(flashcards, hoje), [flashcards, hoje]);

  if (variante === 'nenhum') return null;

  const irRever = () => navigate('/flashcards');

  if (variante === 'serie') {
    const progresso = progressoDaMeta(respondidas);
    return (
      <section className="hoje cartao-hoje" aria-label="Hoje">
        <h2 className="hoje-titulo">Hoje</h2>
        <div className="hoje-anel">
          <svg viewBox="0 0 90 90" role="img" aria-label={`${Math.min(respondidas, META_DIARIA)} de ${META_DIARIA} flashcards hoje`}>
            <circle className="hoje-anel__fundo" cx="45" cy="45" r={RAIO} />
            <circle className="hoje-anel__meta" cx="45" cy="45" r={RAIO} strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)} />
            <text x="45" y="53">{Math.min(respondidas, META_DIARIA)}/{META_DIARIA}</text>
          </svg>
          <div className="hoje-anel__texto">
            <span className={`hoje-serie ${serie > 0 ? 'pulsa' : ''}`}><b aria-hidden="true">●</b> {serie > 0 ? diasTexto(serie) : 'Começa a tua série hoje'}</span>
            <p>
              {respondidas >= META_DIARIA
                ? 'Meta de hoje cumprida. Boa, Leonor.'
                : `Faltam ${META_DIARIA - respondidas} flashcards para a meta de hoje.`}
            </p>
          </div>
        </div>
        <button type="button" className="hoje-botao" onClick={irRever}>{prontos > 0 ? 'Continuar a rever' : 'Ver os flashcards'}</button>
      </section>
    );
  }

  if (variante === 'stories') {
    return (
      <section className="hoje cartao-hoje" aria-label="Para rever">
        <h2 className="hoje-titulo">Para rever</h2>
        <div className="hoje-stories">
          {cadeirasS1.map((c) => {
            const n = porCadeira[c.id] || 0;
            return (
              <button key={c.id} type="button" className={`hoje-story ${n > 0 ? 'novo' : ''}`} style={{ '--c': c.cor }} onClick={irRever} aria-label={`${c.abrev}: ${n > 0 ? `${n} para rever` : 'em dia'}`}>
                <i>{c.abrev}{n > 0 && <em>{n}</em>}</i>
                <span>{n > 0 ? 'Rever' : 'Em dia'}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (variante === 'desafio') {
    return (
      <section className="hoje cartao-hoje" aria-label="Desafio do dia">
        <h2 className="hoje-titulo">Desafio do dia</h2>
        {desafio ? (
          <button type="button" className={`hoje-desafio ${desafioVirado ? 'vira' : ''}`} onClick={() => setDesafioVirado((v) => !v)} aria-label={desafioVirado ? 'Resposta. Toca para ver a pergunta' : 'Pergunta. Toca para ver a resposta'}>
            <span className="hoje-desafio__miolo">
              <span className="hoje-desafio__face"><b>{desafio.frente}</b><small>Toca para ver a resposta</small></span>
              <span className="hoje-desafio__face hoje-desafio__face--tras"><b>{desafio.tras}</b></span>
            </span>
          </button>
        ) : (
          <p className="hoje-vazio">{loading ? 'A preparar o desafio...' : 'Cria o primeiro flashcard e o desafio do dia aparece aqui.'}</p>
        )}
      </section>
    );
  }

  return (
    <section className="hoje hoje-barra" aria-label="Hoje">
      <div className="hoje-pilula"><b>{serie}</b><small>{serie === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
      <button type="button" className="hoje-pilula" onClick={irRever}><b>{prontos}</b><small>para rever</small></button>
      <button type="button" className="hoje-pilula" onClick={() => navigate('/tarefas')}><b>{aVencer}</b><small>{aVencer === 1 ? 'tarefa a vencer' : 'tarefas a vencer'}</small></button>
    </section>
  );
}
