// o modo social: um feed vertical de cartas de estudo (flashcards, perguntas, glossário, aulas por marcar, avisos),
// com mais peso ao que está em atraso. a meta do dia fecha com o ecrã "já chegaste" e ela escolhe se continua
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { useGlossario } from '../hooks/useGlossario.js';
import { useTarefas } from '../hooks/useTarefas.js';
import { useCalendario } from '../hooks/useCalendario.js';
import { usePresencas } from '../hooks/usePresencas.js';
import { useFaltasTodas } from '../hooks/useFaltasTodas.js';
import { VERDADEIRO_FALSO, ESCOLHA_MULTIPLA } from '../data/jogos.js';
import { META_DIARIA } from '../services/hoje.js';
import { montarFeed, precisaDeMais } from '../services/feed.js';
import { chaveAula, aulasPorMarcar } from '../services/presencas.js';
import { diaDe, serieDeDias } from '../services/modoEstudo.js';
import { lerDiasDeEstudo, registarEstudoDeHoje, contarRespostaDeHoje } from '../services/estudoLocal.js';
import {
  lerRegistoDoFeed, guardarRegistoDoFeed, somarResposta, acabouDeCumprirMeta, maisCartas, metaAtual,
  lerGuardados, guardarGuardados, alternarGuardado,
} from '../services/feedLocal.js';
import { CartaFlashcard, CartaPergunta, CartaGlossario, CartaAula, CartaAviso } from '../components/feed/Cartas.jsx';
import FimDaMeta from '../components/feed/FimDaMeta.jsx';
import AlternarModo from '../components/feed/AlternarModo.jsx';
import Icone from '../components/icones/Icone.jsx';
import './Feed.css';

const RAIO = 11;
const CIRC = 2 * Math.PI * RAIO;

// a próxima frequência (evento do tipo frequência no futuro), para a carta de aviso
function proximaFrequencia(eventos, agora) {
  const futuras = eventos
    .filter((e) => e.tipo === 'frequencia')
    .map((e) => ({ e, d: e.data instanceof Date ? e.data : e.data?.toDate?.() }))
    .filter(({ d }) => d && d >= new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()))
    .sort((a, b) => a.d - b.d);
  if (futuras.length === 0) return null;
  const { e, d } = futuras[0];
  const dias = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())) / 86400000);
  return { dias, titulo: e.titulo, cadeiraId: e.cadeira, data: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}` };
}

export default function Feed() {
  const navigate = useNavigate();
  const [hoje] = useState(() => diaDe(Date.now()));
  const { flashcards, loading: aCarregarFc, registarResposta } = useFlashcards();
  const { termos, loading: aCarregarGl } = useGlossario();
  const { tarefas } = useTarefas();
  const { eventos, loading: aCarregarCal } = useCalendario();
  const { marcas, carregado: marcasCarregadas, marcar } = usePresencas();
  const faltas = useFaltasTodas(true);

  const [cartas, setCartas] = useState(null);
  const [indice, setIndice] = useState(0);
  const [registo, setRegisto] = useState(() => lerRegistoDoFeed(hoje));
  const [guardados, setGuardados] = useState(lerGuardados);
  const [serie, setSerie] = useState(() => serieDeDias(lerDiasDeEstudo(), hoje));
  const [fim, setFim] = useState(false);
  const lote = useRef(0);
  const aPedir = useRef(false);
  const rolo = useRef(null);

  const pronto = !aCarregarFc && !aCarregarGl && !aCarregarCal && marcasCarregadas;
  const dadosFeed = useMemo(() => ({
    flashcards, termos, tarefas, hoje,
    vf: VERDADEIRO_FALSO, em: ESCOLHA_MULTIPLA,
    aulasPorMarcar: aulasPorMarcar(eventos, marcas).reverse(),
    alertasFaltas: faltas,
    frequencia: proximaFrequencia(eventos, new Date()),
  }), [flashcards, termos, tarefas, hoje, eventos, marcas, faltas]);

  // o primeiro lote monta-se uma vez, quando os dados chegam; depois não se mexe (para a ordem não saltar ao responder)
  if (pronto && cartas === null) setCartas(montarFeed({ ...dadosFeed, lote: 0 }).cartas);

  // mais cartas quando ela se aproxima do fim da lista
  useEffect(() => {
    if (!cartas || aPedir.current || !precisaDeMais(indice, cartas.length)) return;
    aPedir.current = true;
    lote.current += 1;
    const novas = montarFeed({ ...dadosFeed, lote: lote.current }).cartas;
    setCartas((atual) => [...atual, ...novas]);
    aPedir.current = false;
  }, [indice, cartas, dadosFeed]);

  // qual carta está à vista (a que ocupa mais de metade do ecrã)
  const observar = useCallback((no) => {
    if (!no) return undefined;
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) setIndice(Number(e.target.dataset.i)); });
    }, { root: rolo.current, threshold: 0.6 });
    no.querySelectorAll('[data-i]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!cartas) return undefined;
    return observar(rolo.current);
  }, [cartas, observar]);

  function contarResposta(carta) {
    const novo = somarResposta(registo, hoje);
    guardarRegistoDoFeed(novo);
    setRegisto(novo);
    if (carta.tipo === 'flashcard') contarRespostaDeHoje(hoje);
    setSerie(registarEstudoDeHoje());
    if (acabouDeCumprirMeta(novo)) setTimeout(() => setFim(true), 1100);
  }

  function responder(carta, acertou) {
    if (carta.tipo === 'flashcard') Promise.resolve(registarResposta(carta.item, acertou)).catch(() => { /* volta amanhã */ });
    contarResposta(carta);
  }

  function guardar(chave) {
    const novos = alternarGuardado(guardados, chave);
    setGuardados(novos);
    guardarGuardados(novos);
    try { navigator.vibrate?.(10); } catch { /* sem vibração */ }
  }

  function maisCinco() {
    const novo = maisCartas(registo, hoje);
    guardarRegistoDoFeed(novo);
    setRegisto(novo);
    setFim(false);
  }

  const meta = metaAtual(registo, META_DIARIA);
  const progresso = Math.min(1, registo.respondidas / meta);

  function desenhar(carta, i) {
    const comuns = { ativa: i === indice, guardada: guardados.includes(carta.chave), onGuardar: () => guardar(carta.chave) };
    let corpo;
    if (carta.tipo === 'flashcard') corpo = <CartaFlashcard carta={carta} onResponder={responder} {...comuns} />;
    else if (carta.tipo === 'vf' || carta.tipo === 'em') corpo = <CartaPergunta carta={carta} onResponder={responder} {...comuns} />;
    else if (carta.tipo === 'glossario') corpo = <CartaGlossario carta={carta} {...comuns} />;
    else if (carta.tipo === 'aula') corpo = <CartaAula carta={carta} marca={marcas[chaveAula(carta.evento)]} onMarcar={marcar} {...comuns} />;
    else corpo = <CartaAviso carta={carta} {...comuns} />;
    return <div key={carta.chave} data-i={i} className="feed-slot">{corpo}</div>;
  }

  return (
    <div className="feed-pagina">
      <header className="feed-topo">
        <AlternarModo compacto />
        <div className="feed-topo__meta" aria-label={`${registo.respondidas} de ${meta} cartas hoje`}>
          <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
            <circle cx="14" cy="14" r={RAIO} className="feed-anel__fundo" />
            <circle cx="14" cy="14" r={RAIO} className="feed-anel__valor" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progresso)} />
          </svg>
          <span>{Math.min(registo.respondidas, meta)}/{meta}</span>
        </div>
        <div className="feed-topo__serie"><Icone nome="chama" tamanho={20} viva={serie > 0} /><span>{serie}</span></div>
      </header>

      {cartas === null && <div className="feed-vazio"><Icone nome="feed" tamanho={44} viva /><p>A preparar o teu feed...</p></div>}

      {cartas !== null && cartas.length === 0 && (
        <div className="feed-vazio">
          <Icone nome="cartas" tamanho={48} />
          <h2>Ainda não há nada para o feed</h2>
          <p>Cria flashcards ou termos do glossário e eles aparecem aqui.</p>
          <button type="button" onClick={() => navigate('/flashcards')}>Criar flashcards</button>
        </div>
      )}

      {cartas !== null && cartas.length > 0 && (
        <div className="feed-rolo" ref={rolo}>
          {cartas.map(desenhar)}
        </div>
      )}

      {fim && (
        <FimDaMeta
          respondidas={registo.respondidas}
          serie={serie}
          onMais={maisCinco}
          onDia={() => navigate('/dashboard')}
          onSair={() => setFim(false)}
        />
      )}
    </div>
  );
}
