// quem quer ser jurista: escolhes, confirmas ("resposta final?"), há suspense e só depois se revela. três ajudas
// (50/50, pergunta ao Vini, saltar), patamares que guardam o que já subiste e a opção de desistir com o que tens
import { useMemo, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { ESCADA, PATAMARES, PONTOS_POR_DEGRAU, meiaMeia, pistaDoVini, pontosDoJurista, tituloGarantido } from '../../services/jogos.js';
import { terminarJogada } from '../../services/jogosLocal.js';
import { tocarSom } from '../../services/som.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { LETRAS, vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'jurista');
const SUSPENSE_MS = 1500;
const SUBIR_MS = 1300;

export default function JogoJurista({ ronda, skin, aoSair, aoOutraVez, sugerirPausa, diario = false }) {
  // 10 degraus (ou menos, se houver poucas perguntas) e a que sobra fica de reserva para "saltar"
  const degraus = diario ? ronda.length : Math.min(10, ronda.length >= 11 ? 10 : ronda.length);
  const [lista, setLista] = useState(() => ronda.slice(0, degraus));
  const [reserva, setReserva] = useState(() => ronda[degraus] ?? null);
  const [nivel, setNivel] = useState(0);
  const [marcada, setMarcada] = useState(null); // escolhida mas ainda por confirmar
  const [bloqueada, setBloqueada] = useState(false); // confirmada: suspense e revelação
  const [revelada, setRevelada] = useState(false);
  const [subiu, setSubiu] = useState(false);
  const [escondidas, setEscondidas] = useState([]);
  const [pista, setPista] = useState('');
  const [ajudas, setAjudas] = useState({ meia: true, vini: true, saltar: true });
  const [fim, setFim] = useState(null);

  const pergunta = lista[nivel];
  const pontos = nivel * PONTOS_POR_DEGRAU;
  const falhadas = useMemo(() => (fim?.resultado === 'falhou' ? [lista[fim.nivel]] : []), [fim, lista]);

  function terminar(nivelFinal, resultado) {
    const pts = pontosDoJurista({ nivel: nivelFinal, resultado, degraus });
    const meta = terminarJogada('jurista', { pontos: pts, perfeita: resultado === 'completou', diario });
    setFim({ nivel: nivelFinal, resultado, pts, meta, garantido: resultado === 'completou' ? ESCADA[degraus - 1] : tituloGarantido(nivelFinal) });
  }

  function confirmar() {
    if (marcada === null || bloqueada) return;
    setBloqueada(true);
    tocarSom('suspense');
    vibrar(10);
    setTimeout(() => {
      const certa = marcada === pergunta.certa;
      setRevelada(true);
      tocarSom(certa ? 'certo' : 'errado');
      vibrar(certa ? 14 : [8, 40, 8]);
      if (!certa) { setTimeout(() => terminar(nivel, 'falhou'), 1700); return; }
      if (nivel + 1 >= degraus) { setTimeout(() => terminar(nivel + 1, 'completou'), 1500); return; }
      setSubiu(true);
      setTimeout(() => {
        setNivel((n) => n + 1);
        setMarcada(null); setBloqueada(false); setRevelada(false); setSubiu(false); setEscondidas([]); setPista('');
      }, SUBIR_MS);
    }, SUSPENSE_MS);
  }

  function desistir() {
    if (bloqueada || nivel === 0) return;
    terminar(nivel, 'desistiu');
  }

  function usarMeia() {
    if (!ajudas.meia || bloqueada) return;
    const esconder = meiaMeia(pergunta);
    setEscondidas(esconder);
    if (esconder.includes(marcada)) setMarcada(null);
    setAjudas((a) => ({ ...a, meia: false }));
  }
  function usarVini() {
    if (!ajudas.vini || bloqueada) return;
    setPista(pistaDoVini(pergunta));
    setAjudas((a) => ({ ...a, vini: false }));
  }
  function usarSaltar() {
    if (!ajudas.saltar || bloqueada || !reserva) return;
    setLista((l) => l.map((p, i) => (i === nivel ? reserva : p)));
    setReserva(null);
    setMarcada(null); setEscondidas([]); setPista('');
    setAjudas((a) => ({ ...a, saltar: false }));
  }

  if (fim) {
    const destaque = fim.resultado === 'completou' ? (diario ? 'Audiência cumprida!' : 'Ministra da Justiça!') : fim.resultado === 'desistiu' ? `Desististe como ${ESCADA[Math.max(0, fim.nivel - 1)]}` : fim.garantido;
    const resumo = fim.resultado === 'completou' ? 'Subiste a escada toda sem falhar.' : fim.resultado === 'desistiu' ? `Ficas com ${fim.pts} pontos. Podias ter arriscado mais.` : `Falhaste no degrau ${fim.nivel + 1} de ${degraus}.`;
    const revisao = falhadas.map((p) => ({ titulo: p.pergunta, certa: `${p.opcoes[p.certa]}. ${p.explicacao}`, fonte: p.fonte }));
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={diario ? 'Audiência do dia' : JOGO.nome} meta={fim.meta} sugerirPausa={sugerirPausa}
        destaque={destaque} resumo={resumo} revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!pergunta) return null;

  const valeAgora = pontosDoJurista({ nivel, resultado: 'desistiu', degraus });
  const falhaCom = pontosDoJurista({ nivel, resultado: 'falhou', degraus });

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={diario ? 'Audiência do dia' : JOGO.nome} pontos={pontos} subtitulo={`Degrau ${nivel + 1} de ${degraus}: ${ESCADA[nivel]}`} aoSair={aoSair}>
      <ol className="jg-escada" aria-label="Escada de carreira">
        {Array.from({ length: degraus }).map((_, i) => (
          <li key={i} className={`${i < nivel ? 'feito' : ''}${i === nivel ? ' agora' : ''}${PATAMARES.includes(i) ? ' patamar' : ''}`} title={ESCADA[i]} />
        ))}
      </ol>
      <p className="jg-risco">
        {nivel === 0 ? 'Responde bem para subires o primeiro degrau.' : `Se falhares, ficas com ${falhaCom} pontos. Se desistires, levas ${valeAgora}.`}
      </p>

      <div className="jg-ajudas">
        <button type="button" className="jg-ajuda" disabled={!ajudas.meia || bloqueada} onClick={usarMeia}>50/50</button>
        <button type="button" className="jg-ajuda" disabled={!ajudas.vini || bloqueada} onClick={usarVini}>Pergunta ao Vini</button>
        <button type="button" className="jg-ajuda" disabled={!ajudas.saltar || bloqueada || !reserva} onClick={usarSaltar}>Saltar</button>
      </div>

      <article key={pergunta.id} className="jg-cartao jg-entra">
        <span className="jg-etiqueta">{pergunta.dela ? 'A tua pergunta' : 'Pergunta'}</span>
        <p className="jg-texto">{pergunta.pergunta}</p>
      </article>
      {pista && <p className="jg-pista" role="status">{pista}</p>}

      <div className="jg-opcoes" role="group" aria-label="Respostas">
        {pergunta.opcoes.map((op, i) => {
          const escondida = escondidas.includes(i);
          let estado = '';
          if (revelada) estado = i === pergunta.certa ? ' certa' : i === marcada ? ' errada' : '';
          else if (bloqueada && i === marcada) estado = ' suspense';
          else if (i === marcada) estado = ' marcada';
          return (
            <button key={i} type="button" className={`jg-opcao${estado}${escondida ? ' escondida' : ''}`} disabled={escondida || bloqueada} onClick={() => { setMarcada(i); tocarSom('tic'); }}>
              <b>{LETRAS[i]}</b><span>{op}</span>
            </button>
          );
        })}
      </div>

      {subiu && <p className="jg-sobe" role="status">Degrau superado: {ESCADA[nivel + 1] ?? ESCADA[nivel]}!</p>}

      {!bloqueada && (
        <div className="jg-confirmar">
          <button type="button" className="jg-botao jg-botao--forte" disabled={marcada === null} onClick={confirmar}>{marcada === null ? 'Escolhe uma resposta' : 'Resposta final'}</button>
          {nivel > 0 && <button type="button" className="jg-botao" onClick={desistir}>Desistir e levar {valeAgora}</button>}
        </div>
      )}
      {bloqueada && !revelada && <p className="jg-suspense" role="status">A resposta é...</p>}
    </Moldura>
  );
}
