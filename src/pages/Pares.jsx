// jogo de pares: liga a pergunta à resposta dos teus cartões. sem pontos nem ligas, só o tempo e os erros.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { montarJogo, podeJogar, ehPar, textoDoTempo, MINIMO_DE_CARTOES } from '../services/pares.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './Pares.css';

function Jogo({ flashcards, onOutraVez }) {
  const [jogo] = useState(() => montarJogo(flashcards));
  const [escolhida, setEscolhida] = useState(null);
  const [certos, setCertos] = useState([]);
  const [erradas, setErradas] = useState([]);
  const [erros, setErros] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [aCorrer, setACorrer] = useState(false);
  const inicio = useRef(0);

  const terminou = jogo.pares > 0 && certos.length === jogo.pares;

  useEffect(() => {
    if (!aCorrer || terminou) return undefined;
    inicio.current = performance.now();
    const intervalo = setInterval(() => setSegundos((performance.now() - inicio.current) / 1000), 250);
    return () => clearInterval(intervalo);
  }, [aCorrer, terminou]);

  function tocar(peca) {
    if (terminou || certos.includes(peca.par) || erradas.length) return;
    if (!aCorrer) setACorrer(true);
    if (!escolhida) { setEscolhida(peca); return; }
    if (escolhida.id === peca.id) { setEscolhida(null); return; }

    if (ehPar(escolhida, peca)) {
      setCertos((c) => [...c, peca.par]);
      setEscolhida(null);
    } else {
      setErros((e) => e + 1);
      setErradas([escolhida.id, peca.id]);
      setEscolhida(null);
      setTimeout(() => setErradas([]), 600);
    }
  }

  return (
    <>
      <p className="pares-estado" aria-live="polite">
        {terminou
          ? `Feito em ${textoDoTempo(segundos)}, com ${erros} ${erros === 1 ? 'erro' : 'erros'}.`
          : `${certos.length} de ${jogo.pares} pares · ${textoDoTempo(segundos)}${erros ? ` · ${erros} ${erros === 1 ? 'erro' : 'erros'}` : ''}`}
      </p>

      <ul className="pares-grelha">
        {jogo.pecas.map((p) => {
          const feito = certos.includes(p.par);
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`pares-peca pares-peca--${p.lado} ${escolhida?.id === p.id ? 'escolhida' : ''} ${feito ? 'feita' : ''} ${erradas.includes(p.id) ? 'errada' : ''}`}
                onClick={() => tocar(p)}
                disabled={feito}
                aria-pressed={escolhida?.id === p.id}
              >
                {p.texto}
              </button>
            </li>
          );
        })}
      </ul>

      {terminou && (
        <div className="pares-fim">
          <p>Bom trabalho. Sabes estes {jogo.pares} pares.</p>
          <button type="button" className="pares-botao" onClick={onOutraVez}>Jogar outra vez</button>
        </div>
      )}
    </>
  );
}

export default function Pares() {
  const navigate = useNavigate();
  const { flashcards, loading } = useFlashcards();
  const [ronda, setRonda] = useState(0);

  return (
    <div className="pares-pagina">
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <h1 className="pares-titulo">Jogo de pares</h1>
      <p className="pares-sub">Liga cada pergunta à sua resposta.</p>

      {loading ? (
        <Carregando texto="A carregar os teus cartões..." />
      ) : !podeJogar(flashcards) ? (
        <EstadoVazio
          titulo={`Precisas de pelo menos ${MINIMO_DE_CARTOES} cartões.`}
          texto="Os cartões têm de ter frente e verso curtos. Cria alguns nos Flashcards e volta."
          acao={{ texto: 'Ir aos flashcards', fn: () => navigate('/flashcards') }}
        />
      ) : (
        <Jogo key={ronda} flashcards={flashcards} onOutraVez={() => setRonda((r) => r + 1)} />
      )}
    </div>
  );
}
