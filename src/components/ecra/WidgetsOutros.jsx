// widgets do dia a dia: tempo, tarefas, caixa de entrada e ferramentas
// e os cartões antigos (bem-estar, missões, horas, balanço), que entram tal como estavam
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase.js';
import { semEsperar } from '../../services/escritas.js';
import { separarDias, iconeTempo } from '../../services/apis/ipma.js';
import { dataNatural, dataDeChave } from '../../services/datas.js';
import { useTempo } from '../../hooks/useTempo.js';
import { useTarefas } from '../../hooks/useTarefas.js';
import { useCaixaEntrada } from '../../hooks/useCaixaEntrada.js';
import { useModulos } from '../../hooks/useModulos.js';
import { MODULOS } from '../../data/modulos.js';
import { ICONES_FERRAMENTAS } from '../../data/widgets.js';
import { getCadeira } from '../../data/dadosLeonor.js';
import { faiscas, gsap, movimentoPermitido } from './movimento.js';
import CartaoTempo from '../CartaoTempo.jsx';
import CartaoBemEstar from '../CartaoBemEstar.jsx';
import CartaoMissoesDoDia from '../CartaoMissoesDoDia.jsx';
import CartaoHorasPorRegistar from '../CartaoHorasPorRegistar.jsx';
import CartaoBalancoDomingo from '../CartaoBalancoDomingo.jsx';

const EMOJI_TEMPO = { sol: '☀️', solNuvem: '⛅', nuvem: '☁️', chuva: '🌧️', trovoada: '⛈️', nevoeiro: '🌫️' };

export function WidgetTempo({ tamanho }) {
  const { previsao, agora } = useTempo();
  if (tamanho === 'largo') return <CartaoTempo />;
  const { principal } = separarDias(previsao, new Date(agora));
  // sem previsão guardada nem rede, fica o lugar marcado para a grelha não ficar com um buraco
  if (!principal) {
    return (
      <div className="ew ew-tempo">
        <span className="ew-rotulo">Lisboa</span>
        <span className="ew-tempo__icone" aria-hidden="true">☁️</span>
        <span className="ew-tempo__texto">Sem dados do tempo agora</span>
      </div>
    );
  }
  return (
    <div className="ew ew-tempo">
      <span className="ew-rotulo">Lisboa</span>
      <b className="ew-tempo__graus ew-num">{principal.max === null ? '–' : `${Math.round(principal.max)}°`}</b>
      <span className="ew-tempo__icone" aria-hidden="true">{EMOJI_TEMPO[iconeTempo(principal.tipo)]}</span>
      <span className="ew-tempo__texto">{principal.descricao ?? ''}</span>
      <span className="ew-tempo__texto ew-num">Mín. {principal.min === null ? '–' : `${Math.round(principal.min)}°`}{principal.chuva ? ` · chuva ${Math.round(principal.chuva)}%` : ''}</span>
    </div>
  );
}

// ordena pelo prazo, sem prazo no fim
function pendentesPorPrazo(tarefas) {
  return tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));
}

function LinhaTarefa({ tarefa, agora }) {
  const [feita, setFeita] = useState(false);
  const linha = useRef(null);
  const cadeira = getCadeira(tarefa.cadeira);
  const prazo = tarefa.prazo ? dataDeChave(tarefa.prazo) : null;
  const urgente = prazo && prazo - agora < 2 * 86400000;

  function concluir(e) {
    e.preventDefault();
    if (feita) return;
    setFeita(true);
    faiscas(e.currentTarget);
    const gravar = () => {
      const userId = getAuth().currentUser?.uid;
      if (userId) semEsperar(updateDoc(doc(db, 'users', userId, 'tarefas', tarefa.id), { concluida: true }));
    };
    // deixa ver o risco e as faíscas antes de a tarefa sair da lista
    if (movimentoPermitido() && linha.current) {
      gsap.to(linha.current, { opacity: 0, x: 24, height: 0, marginTop: 0, delay: 0.55, duration: 0.3, ease: 'power2.in', onComplete: gravar });
    } else {
      gravar();
    }
  }

  return (
    <li ref={linha} className="ew-tarefa">
      <button type="button" className={`ew-circulo ${feita ? 'feito' : ''}`} onClick={concluir} aria-label={`Concluir ${tarefa.titulo}`} />
      <span className={`ew-tarefa__texto ${feita ? 'riscado' : ''}`}>
        {tarefa.titulo}
        {cadeira && <small style={{ color: cadeira.cor }}>{cadeira.abrev}</small>}
      </span>
      {prazo && <span className={`ew-etiqueta ${urgente ? 'urgente' : ''}`}>{dataNatural(prazo, agora)}</span>}
    </li>
  );
}

export function WidgetTarefas({ tamanho, contexto }) {
  const { tarefas } = useTarefas();
  const pendentes = pendentesPorPrazo(tarefas);

  if (tamanho === 'pequeno') {
    const proxima = pendentes.find((t) => t.prazo);
    return (
      <Link to="/tarefas" className="ew">
        <span className="ew-rotulo">Tarefas</span>
        <b className="ew-grande ew-num">{pendentes.length}</b>
        <span className="ew-legenda">{pendentes.length === 0 ? 'nada pendente ✓' : proxima ? `a próxima: ${dataNatural(dataDeChave(proxima.prazo), contexto.agora)}` : 'por fazer'}</span>
      </Link>
    );
  }
  return (
    <div className="ew ew-tarefas">
      <div className="ew-cabeca">
        <span className="ew-rotulo">Para fazer · {pendentes.length}</span>
        <Link to="/tarefas" className="ew-ver">Ver todas</Link>
      </div>
      {pendentes.length === 0 ? (
        <p className="ew-legenda">Nada pendente. Aproveita. 🎉</p>
      ) : (
        <ul className="ew-lista">
          {pendentes.slice(0, contexto.emBaixo ? 2 : 4).map((t) => <LinhaTarefa key={t.id} tarefa={t} agora={contexto.agora} />)}
        </ul>
      )}
    </div>
  );
}

export function WidgetCaixa() {
  const { itens, juntar, apagar, passarATarefa } = useCaixaEntrada();
  const [texto, setTexto] = useState('');
  const lista = useRef(null);

  function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    juntar(texto);
    setTexto('');
    // a linha nova entra por cima
    requestAnimationFrame(() => {
      const primeira = lista.current?.firstElementChild;
      if (primeira && movimentoPermitido()) gsap.from(primeira, { y: -10, opacity: 0, duration: 0.35, ease: 'power2.out' });
    });
  }

  return (
    <div className="ew ew-caixa">
      <span className="ew-rotulo">Caixa de entrada{itens.length ? ` · ${itens.length} por arrumar` : ''}</span>
      <form className="ew-caixa__campo" onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Uma ideia, uma dúvida, uma tarefa..." enterKeyHint="done" aria-label="Escrever na caixa de entrada" />
        <button type="submit" aria-label="Guardar na caixa de entrada">↵</button>
      </form>
      {itens.length > 0 && (
        <ul className="ew-caixa__itens" ref={lista}>
          {itens.slice(0, 4).map((item) => (
            <li key={item.id}>
              <span>{item.texto}</span>
              <button type="button" onClick={() => passarATarefa(item)} aria-label={`Passar "${item.texto}" a tarefa`}>→ tarefa</button>
              <button type="button" onClick={() => apagar(item.id)} aria-label={`Apagar "${item.texto}"`}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WidgetFerramentas() {
  const { ativos } = useModulos();
  const ligadas = MODULOS.filter((m) => m.categoria === 'ferramentas' && ativos[m.id]).slice(0, 8);
  if (ligadas.length === 0) {
    return <Link to="/definicoes" className="ew"><span className="ew-legenda">Não tens ferramentas ligadas. Liga as que quiseres em Definições.</span></Link>;
  }
  return (
    <nav className="ew-apps" aria-label="As tuas ferramentas">
      {ligadas.map((m) => (
        <Link key={m.id} to={m.rota} className="ew-app">
          <span className="ew-app__icone" aria-hidden="true">{ICONES_FERRAMENTAS[m.id] || '•'}</span>
          <span className="ew-app__nome">{m.nome}</span>
        </Link>
      ))}
    </nav>
  );
}

// os cartões que já existiam entram tal como estão, com o aspeto novo dado pelo css do ecrã
export function WidgetBemEstar() { return <CartaoBemEstar />; }
export function WidgetMissoes() { return <CartaoMissoesDoDia />; }
export function WidgetHorasPorRegistar() { return <CartaoHorasPorRegistar />; }
export function WidgetBalancoDomingo() { return <CartaoBalancoDomingo />; }
