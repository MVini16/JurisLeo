// revisão de flashcards em ecrã inteiro, à maneira de um feed: um cartão de cada vez, gestos para virar e responder.
// quatro aspetos (feed, pilha, story, processo) partilham a mesma lógica; só muda o desenho (SessaoVertical.css)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { abrevCadeiras } from '../../data/dadosLeonor.js';
import {
  acaoDoGesto, diaDe, direcaoDoGesto, mensagemFinal, registarDia, resumoDaSessao, serieDeDias, varianteValida,
} from '../../services/modoEstudo.js';
import './SessaoVertical.css';

const CHAVE_DIAS = 'jurisleo-estudo-dias';
const SAIDA_MS = 420;

function lerDias() {
  try { return JSON.parse(localStorage.getItem(CHAVE_DIAS)) || []; } catch { return []; }
}
function guardarDias(dias) {
  try { localStorage.setItem(CHAVE_DIAS, JSON.stringify(dias)); } catch { /* sem localstorage, a série fica só nesta sessão */ }
}
function vibrar(ms) {
  try { navigator.vibrate?.(ms); } catch { /* sem vibração */ }
}

export default function SessaoVertical({ fila, variante: varianteBruta, onResponder, onFechar, onConcluir }) {
  const variante = varianteValida(varianteBruta);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [saida, setSaida] = useState(null); // 'cima' | 'direita' | 'esquerda' | 'carimbo-ok' | 'carimbo-mal'
  const [respostas, setRespostas] = useState({}); // id -> true | false
  const [terminou, setTerminou] = useState(false);
  const [serie, setSerie] = useState(() => serieDeDias(lerDias(), diaDe(Date.now())));
  const [subiuSerie, setSubiuSerie] = useState(false);
  const inicioGesto = useRef(null);
  const ocupado = useRef(false);

  const atual = fila[indice];
  const respondidas = Object.keys(respostas).length;

  const terminar = useCallback((resultado) => {
    const hoje = diaDe(Date.now());
    const dias = registarDia(lerDias(), hoje);
    guardarDias(dias);
    setSerie(serieDeDias(dias, hoje));
    setSubiuSerie(true);
    setTerminou(true);
    onConcluir?.(resultado);
  }, [onConcluir]);

  const avancar = useCallback((novasRespostas) => {
    setSaida(null);
    setVirado(false);
    ocupado.current = false;
    if (indice + 1 >= fila.length) terminar(novasRespostas);
    else setIndice((i) => i + 1);
  }, [fila.length, indice, terminar]);

  const responder = useCallback((acertou) => {
    if (!atual || ocupado.current) return;
    ocupado.current = true;
    vibrar(acertou ? 12 : [8, 40, 8]);
    const novas = { ...respostas };
    if (!(atual.id in respostas)) {
      novas[atual.id] = acertou;
      setRespostas(novas);
      Promise.resolve(onResponder(atual, acertou)).catch(() => { /* a resposta fica por guardar, o cartão volta amanhã */ });
    }
    if (variante === 'processo') setSaida(acertou ? 'carimbo-ok' : 'carimbo-mal');
    else if (variante === 'pilha') setSaida(acertou ? 'direita' : 'esquerda');
    else setSaida('cima');
    setTimeout(() => avancar(novas), variante === 'processo' ? 850 : SAIDA_MS);
  }, [atual, avancar, onResponder, respostas, variante]);

  const virar = useCallback(() => {
    if (ocupado.current) return;
    vibrar(8);
    setVirado((v) => !v);
  }, []);

  // story: toque nas laterais passa para o cartão anterior ou seguinte sem responder
  const irPara = useCallback((delta) => {
    if (ocupado.current) return;
    const novo = indice + delta;
    if (novo < 0) return;
    if (novo >= fila.length) { terminar(respostas); return; }
    setVirado(false);
    setIndice(novo);
  }, [fila.length, indice, respostas, terminar]);

  const aoSoltar = (e) => {
    const inicio = inicioGesto.current;
    inicioGesto.current = null;
    if (!inicio) return;
    const direcao = direcaoDoGesto({ dx: e.clientX - inicio.x, dy: e.clientY - inicio.y });
    if (!direcao) { virar(); return; }
    const acao = acaoDoGesto(variante, direcao, virado);
    if (acao === 'virar') virar();
    else if (acao === 'acertei') responder(true);
    else if (acao === 'errei') responder(false);
  };

  // teclado: espaço vira, setas respondem (a seta para cima só avança depois de virado)
  useEffect(() => {
    if (terminou) return undefined;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFechar();
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); virar(); }
      else if (virado && (e.key === 'ArrowRight' || e.key === 'ArrowUp')) responder(true);
      else if (virado && e.key === 'ArrowLeft') responder(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [terminou, virado, virar, responder, onFechar]);

  // trava o scroll da página por baixo enquanto a sessão está aberta
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  const resumo = useMemo(() => resumoDaSessao(Object.values(respostas)), [respostas]);

  if (terminou) {
    return (
      <div className={`sv sv--${variante}`} role="dialog" aria-label="Sessão concluída">
        <div className="sv-confetis" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
        </div>
        <div className="sv-fim">
          <h2>Sessão concluída</h2>
          <p className="sv-fim__numero">{resumo.certas} de {resumo.total}</p>
          <p>{mensagemFinal(resumo)}</p>
          <p className={`sv-fim__serie ${subiuSerie ? 'sobe' : ''}`}>Série: {serie} {serie === 1 ? 'dia' : 'dias'} seguidos</p>
          <button type="button" className="sv-botao sv-botao--certa" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    );
  }

  if (!atual) return null;

  const classeCartao = `sv-cartao${virado ? ' virado' : ''}${saida ? ` sai-${saida}` : ''}`;

  return (
    <div className={`sv sv--${variante}`} role="dialog" aria-label="Revisão de flashcards">
      {variante === 'story' && (
        <div className="sv-barras" aria-hidden="true">
          {fila.map((f, n) => <i key={f.id} className={n < indice ? 'feito' : n === indice ? 'agora' : ''}><b /></i>)}
        </div>
      )}

      <div className="sv-topo">
        <span className="sv-serie">Série: {serie} {serie === 1 ? 'dia' : 'dias'}</span>
        <span className="sv-contador">{indice + 1} / {fila.length}</span>
        <button type="button" className="sv-fechar" onClick={onFechar} aria-label="Fechar a revisão">✕</button>
      </div>

      {variante === 'pilha' && <><div className="sv-atras sv-atras--2" /><div className="sv-atras" /></>}

      <div
        key={atual.id}
        className={classeCartao}
        onPointerDown={(e) => { inicioGesto.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={aoSoltar}
        onPointerCancel={() => { inicioGesto.current = null; }}
        role="button"
        tabIndex={0}
        aria-label={virado ? 'Resposta. Toca para ver a pergunta' : 'Pergunta. Toca para ver a resposta'}
      >
        <div className="sv-face sv-face--frente">
          <span className="sv-etiqueta">{abrevCadeiras[atual.cadeiraId] || 'Flashcard'}</span>
          <p>{atual.frente}</p>
        </div>
        <div className="sv-face sv-face--tras">
          <span className="sv-etiqueta">Resposta</span>
          <p>{atual.tras}</p>
        </div>
      </div>

      {variante === 'story' && (
        <>
          <button type="button" className="sv-zona sv-zona--esq" onClick={() => irPara(-1)} aria-label="Cartão anterior" />
          <button type="button" className="sv-zona sv-zona--dir" onClick={() => irPara(1)} aria-label="Cartão seguinte" />
        </>
      )}

      {variante === 'processo' && (
        <>
          <span className={`sv-carimbo sv-carimbo--ok${saida === 'carimbo-ok' ? ' bate' : ''}`}>Procedente</span>
          <span className={`sv-carimbo sv-carimbo--mal${saida === 'carimbo-mal' ? ' bate' : ''}`}>Improcedente</span>
        </>
      )}

      {!virado && <p className="sv-dica">Toca no cartão para ver a resposta{variante === 'feed' || variante === 'processo' ? ', ou desliza para cima' : ''}</p>}
      {virado && (
        <div className="sv-acoes">
          <button type="button" className="sv-botao sv-botao--errada" onClick={() => responder(false)}>Não sabia</button>
          <button type="button" className="sv-botao sv-botao--certa" onClick={() => responder(true)}>Acertei</button>
        </div>
      )}
      <span className="sv-escondido" aria-live="polite">{respondidas} respondidas</span>
    </div>
  );
}
