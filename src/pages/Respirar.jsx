// respiração guiada: um círculo que cresce ao inspirar e encolhe ao expirar
import { useEffect, useRef, useState } from 'react';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { faseDaRespiracao, DURACAO_CICLO } from '../services/respiracao.js';
import './Respirar.css';

export default function Respirar() {
  const [aCorrer, setACorrer] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [ciclosFeitos, setCiclosFeitos] = useState(0);
  const inicio = useRef(0);

  useEffect(() => {
    if (!aCorrer) return undefined;
    inicio.current = performance.now();
    const intervalo = setInterval(() => setSegundos((performance.now() - inicio.current) / 1000), 200);
    return () => clearInterval(intervalo);
  }, [aCorrer]);

  const fase = faseDaRespiracao(segundos);

  function comecar() {
    setSegundos(0);
    setCiclosFeitos(0);
    setACorrer(true);
  }

  function terminar() {
    setCiclosFeitos(fase.ciclo);
    setACorrer(false);
  }

  return (
    <div className="resp-pagina">
      <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
      <h1 className="resp-titulo">Respirar</h1>
      <p className="resp-sub">Para quando a cabeça não pára. Um ciclo dura {DURACAO_CICLO} segundos.</p>

      <div className={`resp-cena ${aCorrer ? 'ativa' : ''}`} style={{ '--ciclo': `${DURACAO_CICLO}s` }}>
        <div className="resp-aneis" aria-hidden="true">
          <i /><i /><i />
        </div>
        <div className="resp-circulo" aria-hidden="true" />
        <p className="resp-texto" aria-live="polite">{aCorrer ? fase.texto : 'Pronta?'}</p>
        {aCorrer && <p className="resp-contagem" aria-hidden="true">{Math.ceil(fase.restante)}</p>}
      </div>

      {!aCorrer ? (
        <>
          <button type="button" className="resp-botao" onClick={comecar}>Começar</button>
          {ciclosFeitos > 0 && <p className="resp-final">Fizeste {ciclosFeitos} {ciclosFeitos === 1 ? 'ciclo' : 'ciclos'}. Quando quiseres, volta ao que estavas a fazer.</p>}
        </>
      ) : (
        <button type="button" className="resp-botao resp-botao--fantasma" onClick={terminar}>Terminar</button>
      )}
      <p className="resp-aviso">Um exercício simples para abrandar. Se te sentires mal, fala com alguém em quem confies.</p>
    </div>
  );
}
