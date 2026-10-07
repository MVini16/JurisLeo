// verdadeiro ou falso relâmpago: 60 segundos de tempo a pensar (o relógio pára enquanto lê a explicação)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { SEGUNDOS_VF, pontosVF, resultadoVF } from '../../services/jogos.js';
import { guardarJogada } from '../../services/jogosLocal.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'vf');

export default function JogoVF({ ronda, skin, aoSair, aoOutraVez }) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [feedback, setFeedback] = useState(null); // { certa, escolhida, pergunta }
  const [restante, setRestante] = useState(SEGUNDOS_VF);
  const [fim, setFim] = useState(null);
  const [pontosGanhos, setPontosGanhos] = useState(0);

  const pergunta = ronda[indice];
  const resultado = useMemo(() => resultadoVF(respostas), [respostas]);
  const seguidas = (() => { let n = 0; for (let i = respostas.length - 1; i >= 0 && respostas[i]; i -= 1) n += 1; return n; })();

  const terminar = useCallback((lista) => {
    const r = resultadoVF(lista);
    const { novoRecorde, melhor } = guardarJogada('vf', r.pontos);
    setFim({ ...r, novoRecorde, melhor });
  }, []);

  // as respostas mais recentes, para o relógio saber com o que terminar sem depender do render
  const ultimas = useRef(respostas);
  useEffect(() => { ultimas.current = respostas; }, [respostas]);
  const tempo = useRef(SEGUNDOS_VF);

  // o relógio só anda enquanto a pergunta está à espera de resposta
  useEffect(() => {
    if (fim || feedback) return undefined;
    const id = setInterval(() => {
      tempo.current = Math.max(0, +(tempo.current - 0.1).toFixed(1));
      setRestante(tempo.current);
      if (tempo.current <= 0) { clearInterval(id); terminar(ultimas.current); }
    }, 100);
    return () => clearInterval(id);
  }, [fim, feedback, terminar]);

  const responder = useCallback((escolhida) => {
    if (feedback || fim || !pergunta) return;
    const certa = escolhida === pergunta.verdade;
    vibrar(certa ? 12 : [8, 40, 8]);
    const novas = [...respostas, certa];
    setRespostas(novas);
    setPontosGanhos(certa ? pontosVF(seguidas + 1) : 0);
    setFeedback({ certa, escolhida, pergunta });
  }, [feedback, fim, pergunta, respostas, seguidas]);

  const seguinte = useCallback(() => {
    if (indice + 1 >= ronda.length) { setFeedback(null); terminar(respostas); return; }
    setFeedback(null);
    setIndice((i) => i + 1);
  }, [indice, ronda.length, respostas, terminar]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') { aoSair(); return; }
      if (feedback) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seguinte(); } return; }
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
        jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={fim.pontos} novoRecorde={fim.novoRecorde} melhor={fim.melhor}
        destaque={`${fim.certas} de ${respostas.length} certas`}
        resumo={`Melhor série: ${fim.melhorSerie} seguidas.`}
        revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!pergunta) return null;

  const fracao = restante / SEGUNDOS_VF;
  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={resultado.pontos} subtitulo={`${indice + 1} de ${ronda.length}`} aoSair={aoSair}>
      <div className="jg-relogio" role="timer" aria-label={`${Math.ceil(restante)} segundos`}>
        <i style={{ width: `${fracao * 100}%` }} className={fracao < 0.25 ? 'urgente' : ''} />
        <span>{Math.ceil(restante)}s</span>
      </div>
      {seguidas >= 2 && <p key={seguidas} className="jg-combo">Série de {seguidas}</p>}

      <article key={pergunta.id} className={`jg-cartao jg-entra${feedback ? (feedback.certa ? ' certa' : ' errada') : ''}`}>
        <span className="jg-etiqueta">{pergunta.dela ? 'A tua pergunta' : 'Afirmação'}</span>
        <p className="jg-texto">{pergunta.afirmacao}</p>
      </article>

      {feedback ? (
        <div className={`jg-feedback ${feedback.certa ? 'certa' : 'errada'}`} role="status">
          <b>{feedback.certa ? `Certo! +${pontosGanhos}` : 'Falhaste'}</b>
          <p>{feedback.pergunta.verdade ? 'Verdadeiro. ' : 'Falso. '}{feedback.pergunta.explicacao}</p>
          <small>{feedback.pergunta.fonte}</small>
          <button type="button" className="jg-botao jg-botao--forte" onClick={seguinte}>Seguinte</button>
        </div>
      ) : (
        <div className="jg-duplo">
          <button type="button" className="jg-botao jg-botao--falso" onClick={() => responder(false)}>Falso</button>
          <button type="button" className="jg-botao jg-botao--verdadeiro" onClick={() => responder(true)}>Verdadeiro</button>
        </div>
      )}
    </Moldura>
  );
}
