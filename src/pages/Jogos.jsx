// o ecrã dos minijogos: escolhe-se o jogo, de onde vêm as perguntas e a cadeira. as perguntas dela são os flashcards
import { useMemo, useRef, useState } from 'react';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import ModalPergunta from '../components/jogos/ModalPergunta.jsx';
import JogoVF from '../components/jogos/JogoVF.jsx';
import JogoJurista from '../components/jogos/JogoJurista.jsx';
import JogoCaso from '../components/jogos/JogoCaso.jsx';
import JogoPares from '../components/jogos/JogoPares.jsx';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { usePreferencias } from '../hooks/usePreferencias.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { CASOS, ESCOLHA_MULTIPLA, JOGOS, PARES, VERDADEIRO_FALSO } from '../data/jogos.js';
import { FONTES, montarRonda } from '../services/jogos.js';
import { lerRecordes } from '../services/jogosLocal.js';
import { skinValida } from '../services/jogosSkins.js';
import '../components/jogos/Jogos.css';
import './Jogos.css';

const BANCO = { vf: VERDADEIRO_FALSO, escolha: ESCOLHA_MULTIPLA, casos: CASOS, pares: PARES };
const COMPONENTES = { vf: JogoVF, jurista: JogoJurista, caso: JogoCaso, pares: JogoPares };

export default function Jogos() {
  const prefs = usePreferencias();
  const { flashcards } = useFlashcards();
  const [fonte, setFonte] = useState('mistura');
  const [cadeiraId, setCadeiraId] = useState('todas');
  const [ativo, setAtivo] = useState(null); // { id, ronda, chave }
  const [criar, setCriar] = useState(false);
  const [aviso, setAviso] = useState('');
  const [recordes, setRecordes] = useState(() => lerRecordes());
  const jogadas = useRef(0);

  // quantas perguntas há para cada jogo com o que está escolhido (para avisar quando não há nenhuma)
  const disponiveis = useMemo(() => Object.fromEntries(JOGOS.map((j) => [j.id, montarRonda(j.id, { banco: BANCO, flashcards, fonte, cadeiraId, aleatorio: () => 0 }).length])), [flashcards, fonte, cadeiraId]);

  function jogar(id) {
    const ronda = montarRonda(id, { banco: BANCO, flashcards, fonte, cadeiraId });
    if (ronda.length === 0) { setAviso('Não há perguntas com estas escolhas. Muda a fonte ou a cadeira.'); return; }
    setAviso('');
    jogadas.current += 1;
    setAtivo({ id, ronda, chave: jogadas.current });
  }

  function sair() { setAtivo(null); setRecordes(lerRecordes()); }

  const Jogo = ativo ? COMPONENTES[ativo.id] : null;
  const minhas = flashcards.length;

  return (
    <div className="jogos-pagina">
      <BotaoVoltar />
      <header className="jogos-cab">
        <h1>Jogos</h1>
        <p>Estuda a jogar. As perguntas são do Claude e tuas.</p>
      </header>

      <section aria-label="Escolhas">
        <p className="jogos-rotulo">Perguntas</p>
        <div className="jogos-chips" role="radiogroup" aria-label="De onde vêm as perguntas">
          {FONTES.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={fonte === f.id} className={`jogos-chip ${fonte === f.id ? 'ativo' : ''}`} onClick={() => setFonte(f.id)}>{f.rotulo}</button>
          ))}
        </div>
        <p className="jogos-rotulo">Cadeira</p>
        <div className="jogos-chips">
          <button type="button" className={`jogos-chip ${cadeiraId === 'todas' ? 'ativo' : ''}`} onClick={() => setCadeiraId('todas')}>Todas</button>
          {cadeirasS1.map((c) => (
            <button key={c.id} type="button" className={`jogos-chip ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
          ))}
        </div>
      </section>

      {aviso && <p className="jogos-aviso" role="status">{aviso}</p>}

      <div className="jogos-grelha">
        {JOGOS.map((j) => (
          <article key={j.id} className="jogos-cartao" style={{ '--cor': j.cor }}>
            <span className="jogos-cartao__tag">{j.curta}</span>
            <h2>{j.nome}</h2>
            <p>{j.descricao}</p>
            <p className="jogos-cartao__recorde">
              {recordes[j.id] ? `Recorde: ${recordes[j.id].melhor} · ${recordes[j.id].jogadas} ${recordes[j.id].jogadas === 1 ? 'jogada' : 'jogadas'}` : 'Ainda não jogaste'}
            </p>
            <button type="button" className="jogos-botao jogos-botao--forte" disabled={disponiveis[j.id] === 0} onClick={() => jogar(j.id)}>
              {disponiveis[j.id] === 0 ? 'Sem perguntas' : 'Jogar'}
            </button>
          </article>
        ))}
      </div>

      <section className="jogos-minhas">
        <h2>As tuas perguntas</h2>
        <p>{minhas === 0 ? 'Ainda não tens flashcards.' : `Tens ${minhas} ${minhas === 1 ? 'flashcard' : 'flashcards'}. Todos entram nos jogos.`} Cria perguntas com resposta certa e respostas erradas para os jogos ficarem ainda melhores.</p>
        <button type="button" className="jogos-botao" onClick={() => setCriar(true)}>Criar uma pergunta</button>
      </section>

      {criar && <ModalPergunta cadeiraInicial={cadeiraId} aoFechar={() => setCriar(false)} aoGuardada={() => { setCriar(false); setAviso('Pergunta guardada. Já podes jogar com ela.'); }} />}

      {Jogo && <Jogo key={ativo.chave} ronda={ativo.ronda} skin={skinValida(prefs.jogosSkin)} aoSair={sair} aoOutraVez={() => jogar(ativo.id)} />}
    </div>
  );
}
