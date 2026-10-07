// verdadeiro ou falso de resistência: o relógio ganha 2s por cada certa e perde 4s por cada erro. arrasta o cartão
// (direita é verdadeiro, esquerda é falso) ou usa os botões. as certas passam logo; as erradas mostram a explicação
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { SEGUNDOS_MAX_VF, SEGUNDOS_VF, multiplicadorVF, pontosVF, relogioVF, resultadoVF } from '../../services/jogos.js';
import { terminarJogada } from '../../services/jogosLocal.js';
import { tocarSom } from '../../services/som.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'vf');
const LIMIAR_ARRASTO = 90;

export default function JogoVF({ ronda, skin, aoSair, aoOutraVez, sugerirPausa }) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [feedback, setFeedback] = useState(null); // { certa, pergunta, ganhos }
  const [restante, setRestante] = useState(SEGUNDOS_VF);
  const [fim, setFim] = useState(null);
  const [arrasto, setArrasto] = useState(0);
  const [saltou, setSaltou] = useState(null); // 'v' | 'f' durante a saída do cartão
  const [aArrastar, setAArrastar] = useState(false);
  const inicio = useRef(null);
  const tempo = useRef(SEGUNDOS_VF);
  const ultimas = useRef(respostas);
  const ultimoInteiro = useRef(SEGUNDOS_VF);
  useEffect(() => { ultimas.current = respostas; }, [respostas]);

  const pergunta = ronda[indice];
  const resultado = useMemo(() => resultadoVF(respostas), [respostas]);
  const seguidas = (() => { let n = 0; for (let i = respostas.length - 1; i >= 0 && respostas[i]; i -= 1) n += 1; return n; })();
  const multiplicador = multiplicadorVF(seguidas);

  const terminar = useCallback((lista) => {
    const r = resultadoVF(lista);
    const perfeita = lista.length >= 10 && r.erradas === 0;
    setFim({ ...r, total: lista.length, meta: terminarJogada('vf', { pontos: r.pontos, perfeita }) });
  }, []);

  // o relógio só anda enquanto o cartão está à espera de resposta
  useEffect(() => {
    if (fim || feedback || saltou) return undefined;
    const id = setInterval(() => {
      tempo.current = Math.max(0, +(tempo.current - 0.1).toFixed(1));
      setRestante(tempo.current);
      const inteiro = Math.ceil(tempo.current);
      if (inteiro <= 5 && inteiro !== ultimoInteiro.current && inteiro > 0) tocarSom('tic');
      ultimoInteiro.current = inteiro;
      if (tempo.current <= 0) { clearInterval(id); terminar(ultimas.current); }
    }, 100);
    return () => clearInterval(id);
  }, [fim, feedback, saltou, terminar]);

  const seguinte = useCallback((lista) => {
    if (tempo.current <= 0 || indice + 1 >= ronda.length) { setFeedback(null); setSaltou(null); terminar(lista); return; }
    setFeedback(null);
    setSaltou(null);
    setArrasto(0);
    setIndice((i) => i + 1);
  }, [indice, ronda.length, terminar]);

  const responder = useCallback((escolhida) => {
    if (feedback || fim || saltou || !pergunta) return;
    const certa = escolhida === pergunta.verdade;
    const novas = [...respostas, certa];
    const ganhos = certa ? pontosVF(seguidas + 1) : 0;
    vibrar(certa ? 12 : [8, 40, 8]);
    tocarSom(certa ? 'certo' : 'errado');
    if (certa && multiplicadorVF(seguidas + 1) > multiplicador) setTimeout(() => tocarSom('combo'), 160);
    tempo.current = relogioVF(tempo.current, certa);
    setRestante(tempo.current);
    setRespostas(novas);
    setSaltou(escolhida ? 'v' : 'f');
    setFeedback({ certa, pergunta, ganhos });
    // certa: passa logo (o fluxo é o que vicia); errada: pára para ler a explicação
    if (certa) setTimeout(() => seguinte(novas), 650);
  }, [feedback, fim, saltou, pergunta, respostas, seguidas, multiplicador, seguinte]);

  // arrastar o cartão
  const aoPremir = (e) => { inicio.current = e.clientX; setAArrastar(true); e.currentTarget.setPointerCapture?.(e.pointerId); };
  const aoMover = (e) => { if (inicio.current !== null) setArrasto(e.clientX - inicio.current); };
  const aoSoltar = () => {
    if (inicio.current === null) return;
    inicio.current = null;
    setAArrastar(false);
    if (arrasto > LIMIAR_ARRASTO) responder(true);
    else if (arrasto < -LIMIAR_ARRASTO) responder(false);
    else setArrasto(0);
  };

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') { aoSair(); return; }
      if (feedback) { if (!feedback.certa && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); seguinte(ultimas.current); } return; }
      if (e.key === 'ArrowRight') responder(true);
      if (e.key === 'ArrowLeft') responder(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [feedback, responder, seguinte, aoSair]);

  if (fim) {
    const revisao = ronda.slice(0, respostas.length).map((p, i) => ({ p, certa: respostas[i] })).filter((x) => !x.certa)
      .map(({ p }) => ({ titulo: p.afirmacao, certa: `${p.verdade ? 'Verdadeiro' : 'Falso'}. ${p.explicacao}`, fonte: p.fonte }));
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} meta={fim.meta} sugerirPausa={sugerirPausa}
        destaque={`${fim.certas} de ${fim.total} certas`}
        resumo={`Melhor série: ${fim.melhorSerie} seguidas.`}
        revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!pergunta) return null;

  const fracao = restante / SEGUNDOS_MAX_VF;
  const rotacao = Math.max(-14, Math.min(14, arrasto / 12));
  const inclinacao = saltou === 'v' ? 420 : saltou === 'f' ? -420 : arrasto;
  const estiloCartao = { transform: `translateX(${inclinacao}px) rotate(${saltou ? (saltou === 'v' ? 14 : -14) : rotacao}deg)`, transition: aArrastar ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)' };

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={resultado.pontos} subtitulo={`${respostas.length} respondidas · x${multiplicador}`} aoSair={aoSair}>
      <div className="jg-relogio" role="timer" aria-label={`${Math.ceil(restante)} segundos`}>
        <i style={{ width: `${fracao * 100}%` }} className={restante <= 8 ? 'urgente' : ''} />
        <span>{Math.ceil(restante)}s</span>
      </div>
      <div className="jg-multi" aria-hidden="true">
        {[1, 2, 3, 4].map((m) => <i key={m} className={multiplicador >= m ? 'ligado' : ''} />)}
        <span key={multiplicador} className="jg-multi__x">x{multiplicador}</span>
        {seguidas >= 2 && <span className="jg-multi__serie">{seguidas} seguidas</span>}
      </div>

      <div className="jg-palco">
        <span className="jg-dica-lado jg-dica-lado--f" style={{ opacity: Math.min(1, Math.max(0, -arrasto) / LIMIAR_ARRASTO) }}>Falso</span>
        <span className="jg-dica-lado jg-dica-lado--v" style={{ opacity: Math.min(1, Math.max(0, arrasto) / LIMIAR_ARRASTO) }}>Verdadeiro</span>
        <article
          key={pergunta.id}
          className={`jg-cartao jg-arrastavel${feedback ? (feedback.certa ? ' certa' : ' errada') : ''}`}
          style={estiloCartao}
          onPointerDown={aoPremir}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
        >
          <span className="jg-etiqueta">{pergunta.dela ? 'A tua pergunta' : 'Afirmação'}</span>
          <p className="jg-texto">{pergunta.afirmacao}</p>
          {feedback && <span className={`jg-carimbo ${feedback.certa ? 'certa' : 'errada'}`}>{feedback.certa ? `+${feedback.ganhos}` : 'Improcedente'}</span>}
        </article>
      </div>

      {feedback && !feedback.certa ? (
        <div className="jg-feedback errada" role="status">
          <b>{feedback.pergunta.verdade ? 'Era verdadeiro.' : 'Era falso.'}</b>
          <p>{feedback.pergunta.explicacao}</p>
          <small>{feedback.pergunta.fonte}</small>
          <button type="button" className="jg-botao jg-botao--forte" onClick={() => seguinte(ultimas.current)}>Seguinte</button>
        </div>
      ) : (
        <div className="jg-duplo">
          <button type="button" className="jg-botao jg-botao--falso" onClick={() => responder(false)} disabled={!!feedback}>Falso</button>
          <button type="button" className="jg-botao jg-botao--verdadeiro" onClick={() => responder(true)} disabled={!!feedback}>Verdadeiro</button>
        </div>
      )}
      <p className="jg-dica">Arrasta o cartão ou usa as setas do teclado.</p>
    </Moldura>
  );
}
