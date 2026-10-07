// quem quer ser jurista: dez degraus, três ajudas (50/50, pergunta ao Vini, saltar) e patamares que guardam o que já subiste
import { useMemo, useState } from 'react';
import { JOGOS } from '../../data/jogos.js';
import { ESCADA, PATAMARES, meiaMeia, pistaDoVini, tituloGarantido } from '../../services/jogos.js';
import { guardarJogada } from '../../services/jogosLocal.js';
import { FimDeJogo, Moldura } from './Moldura.jsx';
import { LETRAS, vibrar } from './utilJogos.js';

const JOGO = JOGOS.find((j) => j.id === 'jurista');
const PONTOS_POR_DEGRAU = 100;

export default function JogoJurista({ ronda, skin, aoSair, aoOutraVez }) {
  // 10 degraus (ou menos, se houver poucas perguntas) e a que sobra fica de reserva para "saltar"
  const degraus = Math.min(10, ronda.length >= 11 ? 10 : ronda.length);
  const [lista, setLista] = useState(() => ronda.slice(0, degraus));
  const [reserva, setReserva] = useState(() => ronda[degraus] ?? null);
  const [nivel, setNivel] = useState(0);
  const [escolhida, setEscolhida] = useState(null);
  const [escondidas, setEscondidas] = useState([]);
  const [pista, setPista] = useState('');
  const [ajudas, setAjudas] = useState({ meia: true, vini: true, saltar: true });
  const [fim, setFim] = useState(null);

  const pergunta = lista[nivel];
  const pontos = nivel * PONTOS_POR_DEGRAU;
  const falhadas = useMemo(() => (fim?.errou ? [lista[fim.nivel]] : []), [fim, lista]);

  function terminar(nivelFinal, errou, completou) {
    const garantido = completou ? ESCADA[degraus - 1] : tituloGarantido(nivelFinal);
    const pts = (completou ? degraus : nivelFinal) * PONTOS_POR_DEGRAU;
    const { novoRecorde, melhor } = guardarJogada('jurista', pts);
    setFim({ nivel: nivelFinal, errou, completou, garantido, pts, novoRecorde, melhor });
  }

  function escolher(i) {
    if (escolhida !== null || fim) return;
    setEscolhida(i);
    const certa = i === pergunta.certa;
    vibrar(certa ? 12 : [8, 40, 8]);
    setTimeout(() => {
      if (!certa) { terminar(nivel, true, false); return; }
      if (nivel + 1 >= degraus) { terminar(nivel + 1, false, true); return; }
      setNivel((n) => n + 1);
      setEscolhida(null); setEscondidas([]); setPista('');
    }, 1500);
  }

  function usarMeia() {
    if (!ajudas.meia || escolhida !== null) return;
    setEscondidas(meiaMeia(pergunta));
    setAjudas((a) => ({ ...a, meia: false }));
  }
  function usarVini() {
    if (!ajudas.vini || escolhida !== null) return;
    setPista(pistaDoVini(pergunta));
    setAjudas((a) => ({ ...a, vini: false }));
  }
  function usarSaltar() {
    if (!ajudas.saltar || escolhida !== null || !reserva) return;
    setLista((l) => l.map((p, i) => (i === nivel ? reserva : p)));
    setReserva(null);
    setEscondidas([]); setPista('');
    setAjudas((a) => ({ ...a, saltar: false }));
  }

  if (fim) {
    const destaque = fim.completou ? 'Ministra da Justiça!' : fim.garantido;
    const revisao = falhadas.map((p) => ({ titulo: p.pergunta, certa: `${p.opcoes[p.certa]}. ${p.explicacao}`, fonte: p.fonte }));
    return (
      <FimDeJogo
        jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={fim.pts} novoRecorde={fim.novoRecorde} melhor={fim.melhor}
        destaque={destaque}
        resumo={fim.completou ? 'Subiste a escada toda sem falhar.' : `Falhaste no degrau ${fim.nivel + 1} de ${degraus}.`}
        revisao={revisao} aoOutraVez={aoOutraVez} aoSair={aoSair}
      />
    );
  }
  if (!pergunta) return null;

  return (
    <Moldura jogo={JOGO} skin={skin} titulo={JOGO.nome} pontos={pontos} subtitulo={`Degrau ${nivel + 1} de ${degraus}: ${ESCADA[nivel]}`} aoSair={aoSair}>
      <ol className="jg-escada" aria-label="Escada de carreira">
        {Array.from({ length: degraus }).map((_, i) => (
          <li key={i} className={`${i < nivel ? 'feito' : ''}${i === nivel ? ' agora' : ''}${PATAMARES.includes(i) ? ' patamar' : ''}`} title={ESCADA[i]} />
        ))}
      </ol>

      <div className="jg-ajudas">
        <button type="button" className="jg-ajuda" disabled={!ajudas.meia || escolhida !== null} onClick={usarMeia}>50/50</button>
        <button type="button" className="jg-ajuda" disabled={!ajudas.vini || escolhida !== null} onClick={usarVini}>Pergunta ao Vini</button>
        <button type="button" className="jg-ajuda" disabled={!ajudas.saltar || escolhida !== null || !reserva} onClick={usarSaltar}>Saltar</button>
      </div>

      <article key={pergunta.id} className="jg-cartao jg-entra">
        <span className="jg-etiqueta">{pergunta.dela ? 'A tua pergunta' : 'Pergunta'}</span>
        <p className="jg-texto">{pergunta.pergunta}</p>
      </article>
      {pista && <p className="jg-pista" role="status">{pista}</p>}

      <div className="jg-opcoes" role="group" aria-label="Respostas">
        {pergunta.opcoes.map((op, i) => {
          const escondida = escondidas.includes(i);
          const estado = escolhida === null ? '' : i === pergunta.certa ? ' certa' : i === escolhida ? ' errada' : '';
          return (
            <button key={i} type="button" className={`jg-opcao${estado}${escondida ? ' escondida' : ''}`} disabled={escondida || escolhida !== null} onClick={() => escolher(i)}>
              <b>{LETRAS[i]}</b><span>{op}</span>
            </button>
          );
        })}
      </div>
    </Moldura>
  );
}
