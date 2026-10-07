// revisão de flashcards à maneira de um story: barras no topo, toque nas laterais, combos, fim com "mais um?".
// a lógica das contas está em services/modoEstudo.js; aqui só há estado e desenho
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cadeirasS1 } from '../../data/dadosLeonor.js';
import {
  barrasDeProgresso, comboAtual, diaDe, direcaoDoGesto, maisCartoes, mensagemFinal, proximoPorResponder, resumoDaSessao, serieDeDias,
} from '../../services/modoEstudo.js';
import { contarRespostaDeHoje, lerDiasDeEstudo, registarEstudoDeHoje } from '../../services/estudoLocal.js';
import './SessaoStory.css';

const TROCA_MS = 240;
const MAIS_CARTOES = 5;

function vibrar(padrao) {
  try { navigator.vibrate?.(padrao); } catch { /* sem vibração */ }
}

export default function SessaoStory({ fila, todos = [], onResponder, onFechar, onConcluir }) {
  const [lista, setLista] = useState(fila);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [respostas, setRespostas] = useState({}); // id -> true | false
  const [ordem, setOrdem] = useState([]); // respostas por ordem, para o combo
  const [troca, setTroca] = useState(null); // 'proximo' | 'anterior' enquanto o cartão sai
  const [entrada, setEntrada] = useState('proximo');
  const [fim, setFim] = useState(false);
  const [confirmarSair, setConfirmarSair] = useState(false);
  const [pontos, setPontos] = useState(0); // contador que muda a cada resposta certa, para repetir a animação
  const [serie, setSerie] = useState(() => serieDeDias(lerDiasDeEstudo(), diaDe(Date.now())));
  const inicioToque = useRef(null);
  const ocupado = useRef(false);

  const atual = lista[indice];
  const cadeira = cadeirasS1.find((c) => c.id === atual?.cadeiraId);
  const respondidas = Object.keys(respostas).length;
  const combo = comboAtual(ordem);
  const barras = useMemo(() => barrasDeProgresso(lista.length, indice), [lista.length, indice]);
  const resumo = useMemo(() => resumoDaSessao(Object.values(respostas)), [respostas]);
  const faltam = lista.length - respondidas;

  // muda de cartão com a animação de saída; `destino` é o índice para onde vai
  const irPara = useCallback((destino, sentido) => {
    if (ocupado.current) return;
    ocupado.current = true;
    setTroca(sentido);
    setTimeout(() => {
      setEntrada(sentido);
      setIndice(destino);
      setVirado(false);
      setTroca(null);
      ocupado.current = false;
    }, TROCA_MS);
  }, []);

  const terminar = useCallback((resultado) => {
    setFim(true);
    setVirado(false);
    onConcluir?.(resultado);
  }, [onConcluir]);

  // depois de responder, vai ao próximo por responder (dando a volta se saltou algum); se não há mais, acaba
  const avancarDe = useCallback((i, novasRespostas) => {
    const proximo = proximoPorResponder(lista, novasRespostas, i + 1);
    if (proximo === -1) terminar(novasRespostas);
    else irPara(proximo, proximo > i ? 'proximo' : 'anterior');
  }, [lista, irPara, terminar]);

  const responder = useCallback((acertou) => {
    if (!atual || ocupado.current) return;
    vibrar(acertou ? 12 : [8, 40, 8]);
    const novas = { ...respostas };
    if (!(atual.id in respostas)) {
      novas[atual.id] = acertou;
      setRespostas(novas);
      setOrdem((o) => [...o, acertou]);
      if (acertou) setPontos((p) => p + 1);
      if (respondidas === 0) setSerie(registarEstudoDeHoje());
      contarRespostaDeHoje(diaDe(Date.now()));
      Promise.resolve(onResponder(atual, acertou)).catch(() => { /* a resposta fica por guardar, o cartão volta amanhã */ });
    }
    avancarDe(indice, novas);
  }, [atual, avancarDe, indice, onResponder, respondidas, respostas]);

  const virar = useCallback(() => {
    if (ocupado.current) return;
    vibrar(8);
    setVirado((v) => !v);
  }, []);

  // sair: se já começou e ainda falta muito, pergunta primeiro (um empurrãozinho para ficar)
  const pedirSaida = useCallback(() => {
    if (fim || respondidas === 0 || faltam <= 0) onFechar();
    else setConfirmarSair(true);
  }, [fim, respondidas, faltam, onFechar]);

  const maisUns = () => {
    const extra = maisCartoes(todos, lista, MAIS_CARTOES);
    if (extra.length === 0) return;
    setLista((l) => [...l, ...extra]);
    setIndice(lista.length);
    setEntrada('proximo');
    setFim(false);
    setVirado(false);
  };

  // toque: nas laterais anda entre cartões, ao centro vira. arrastar para baixo pede para sair
  const aoPremir = (e) => { inicioToque.current = { x: e.clientX, y: e.clientY, t: Date.now() }; };
  const aoSoltar = (e) => {
    const ini = inicioToque.current;
    inicioToque.current = null;
    if (!ini || fim || confirmarSair) return;
    const dx = e.clientX - ini.x;
    const dy = e.clientY - ini.y;
    const dir = direcaoDoGesto({ dx, dy }, 70);
    if (dir === 'baixo') { pedirSaida(); return; }
    if (dir === 'esquerda') { if (indice + 1 < lista.length) irPara(indice + 1, 'proximo'); return; }
    if (dir === 'direita') { if (indice > 0) irPara(indice - 1, 'anterior'); return; }
    if (dir) return;
    const largura = e.currentTarget.getBoundingClientRect().width;
    const fracao = (e.clientX - e.currentTarget.getBoundingClientRect().left) / largura;
    if (fracao < 0.28) { if (indice > 0) irPara(indice - 1, 'anterior'); } else if (fracao > 0.72) { if (indice + 1 < lista.length) irPara(indice + 1, 'proximo'); } else virar();
  };

  // teclado: espaço vira, setas andam, enter acerta, esc pergunta se quer sair
  useEffect(() => {
    const aoTeclar = (e) => {
      if (confirmarSair) { if (e.key === 'Escape') setConfirmarSair(false); return; }
      if (e.key === 'Escape') pedirSaida();
      if (fim) return;
      if (e.key === ' ') { e.preventDefault(); virar(); }
      else if (e.key === 'ArrowRight' && indice + 1 < lista.length) irPara(indice + 1, 'proximo');
      else if (e.key === 'ArrowLeft' && indice > 0) irPara(indice - 1, 'anterior');
      else if (virado && e.key === 'Enter') responder(true);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [confirmarSair, fim, indice, lista.length, virado, irPara, pedirSaida, responder, virar]);

  // trava o scroll da página por baixo
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  const corDaCadeira = cadeira?.cor || '#6B0F1A';
  const haMais = todos.some((c) => !lista.some((l) => l.id === c.id));

  if (fim) {
    return (
      <div className="st st--fim" role="dialog" aria-label="Sessão concluída" style={{ '--cor': corDaCadeira }}>
        <div className="st-confetis" aria-hidden="true">{Array.from({ length: 30 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
        <div className="st-fim">
          <div className="st-fim__anel" style={{ '--p': resumo.percentagem }}><span>{resumo.certas}<small>/{resumo.total}</small></span></div>
          <h2>Já viste tudo</h2>
          <p>{mensagemFinal(resumo)}</p>
          <p className="st-fim__serie">Série: {serie} {serie === 1 ? 'dia seguido' : 'dias seguidos'}</p>
          {haMais && <button type="button" className="st-botao st-botao--forte" onClick={maisUns}>Mais {MAIS_CARTOES} cartões</button>}
          <button type="button" className="st-botao" onClick={onFechar}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!atual) return null;
  const respondido = atual.id in respostas;

  return (
    <div className="st" role="dialog" aria-label="Revisão de flashcards" style={{ '--cor': corDaCadeira }}>
      <div className="st-barras" aria-hidden="true">
        {barras.tipo === 'segmentos'
          ? barras.estados.map((estado, i) => <i key={i} className={estado}><b /></i>)
          : <i className="continua"><b style={{ width: `${barras.fracao * 100}%` }} /></i>}
      </div>

      <header className="st-cab">
        <span className="st-avatar" aria-hidden="true"><i>{cadeira?.abrev ?? 'FC'}</i></span>
        <span className="st-cab__texto">
          <b>{cadeira?.nome ?? 'Flashcards'}</b>
          <small>{indice + 1} de {lista.length}{respondido ? ` · ${respostas[atual.id] ? 'certa' : 'a rever'}` : ''}</small>
        </span>
        {combo >= 2 && <span key={combo} className="st-combo">Combo x{combo}</span>}
        <button type="button" className="st-fechar" onClick={pedirSaida} aria-label="Sair da revisão">✕</button>
      </header>

      <div
        className="st-palco"
        onPointerDown={aoPremir}
        onPointerUp={aoSoltar}
        onPointerCancel={() => { inicioToque.current = null; }}
      >
        <div key={`${atual.id}-${indice}`} className={`st-cartao entra-${entrada}${troca ? ` sai-${troca}` : ''}${virado ? ' virado' : ''}`}>
          <div className="st-face st-face--frente">
            <span className="st-etiqueta">Pergunta</span>
            <p>{atual.frente}</p>
          </div>
          <div className="st-face st-face--tras">
            <span className="st-etiqueta st-etiqueta--resposta">Resposta</span>
            <p>{atual.tras}</p>
          </div>
        </div>
        <span className="st-zona st-zona--esq" aria-hidden="true" />
        <span className="st-zona st-zona--dir" aria-hidden="true" />
      </div>

      {pontos > 0 && <span key={pontos} className="st-mais1" aria-hidden="true">+1</span>}

      <footer className="st-rodape">
        {!virado ? (
          <button type="button" className="st-responder" onClick={virar}>
            <span className="st-dedo" aria-hidden="true" />
            Toca para ver a resposta
          </button>
        ) : (
          <div className="st-escolhas">
            <button type="button" className="st-botao st-botao--errei" onClick={() => responder(false)}>Não sabia</button>
            <button type="button" className="st-botao st-botao--acertei" onClick={() => responder(true)}>Acertei</button>
          </div>
        )}
      </footer>

      {confirmarSair && (
        <div className="st-fundo" onClick={() => setConfirmarSair(false)}>
          <div className="st-sair" role="alertdialog" aria-label="Sair da revisão" onClick={(e) => e.stopPropagation()}>
            <h2>Já vais?</h2>
            <p>Faltam {faltam} {faltam === 1 ? 'cartão' : 'cartões'}. Já fizeste {respondidas}, é pena parar agora.</p>
            <button type="button" className="st-botao st-botao--forte" onClick={() => setConfirmarSair(false)}>Continuar a estudar</button>
            <button type="button" className="st-botao" onClick={onFechar}>Sair mesmo assim</button>
          </div>
        </div>
      )}
    </div>
  );
}
