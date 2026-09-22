// modo exame: escolhe um caso do arquivo, 90 minutos no relógio, só o enunciado à vista —
// sem estrutura, sem dúvidas, sem nota do professor. no fim cola o que escreveu.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCasos } from '../hooks/useCasos.js';
import { useCaso } from '../hooks/useCaso.js';
import { coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import { DURACAO_SEGUNDOS, segundosRestantes, formatarTempo } from '../services/modoExame.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Carregando from '../components/animacoes/Carregando.jsx';
import './ModoExame.css';

export default function ModoExame() {
  const navigate = useNavigate();
  const { casos, loading } = useCasos();
  const [casoId, setCasoId] = useState(null);

  if (loading) return <Carregando texto="A carregar..." tipo="templo" />;

  if (!casoId) {
    return (
      <div className="me-pagina">
        <BotaoVoltar destino="/ferramentas" texto="‹ Ferramentas" />
        <h1 className="me-titulo">Modo Exame</h1>
        <p className="me-intro">90 minutos, um caso do arquivo, sem consultar nada — como no dia da prova. No fim colas o que escreveste.</p>

        {casos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não tens casos práticos."
            texto="Cria um caso primeiro, com o enunciado preenchido, para o poderes treinar aqui."
            acao={{ texto: 'Criar um caso', fn: () => navigate('/casos/novo') }}
          />
        ) : (
          <ul className="me-lista">
            {casos.filter((c) => c.enunciado?.trim()).map((c) => (
              <li key={c.id}>
                <button className="me-caso" style={{ '--cor': coresCadeiras[c.cadeiraId] || '#b8963e' }} onClick={() => setCasoId(c.id)}>
                  <span className="me-caso__cadeira">{abrevCadeiras[c.cadeiraId] || '—'}</span>
                  <span className="me-caso__titulo">{c.titulo || 'Sem título'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {casos.length > 0 && casos.every((c) => !c.enunciado?.trim()) && (
          <p className="me-nota">Nenhum dos teus casos tem enunciado preenchido — sem ele não há o que treinar em tempo real.</p>
        )}
      </div>
    );
  }

  return <Cronometro casoId={casoId} onSair={() => setCasoId(null)} />;
}

function Cronometro({ casoId, onSair }) {
  const { caso, loading, guardar } = useCaso(casoId);
  const [fase, setFase] = useState('a_decorrer'); // 'a_decorrer' | 'terminado'
  const inicioRef = useRef(null);
  const [restam, setRestam] = useState(DURACAO_SEGUNDOS);
  const [resposta, setResposta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (fase !== 'a_decorrer') return undefined;
    if (inicioRef.current === null) inicioRef.current = Date.now();
    const tick = () => {
      const r = segundosRestantes(inicioRef.current, Date.now());
      setRestam(r);
      if (r === 0) setFase('terminado');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [fase]);

  if (loading) return <Carregando texto="A carregar..." tipo="templo" />;
  if (!caso) return <EstadoVazio titulo="Este caso já não existe." acao={{ texto: 'Voltar', fn: onSair }} />;

  const cor = coresCadeiras[caso.cadeiraId] || '#b8963e';
  const segundosUsados = DURACAO_SEGUNDOS - restam;

  async function terminarAgora() {
    setFase('terminado');
  }

  async function guardarResposta() {
    setGuardando(true);
    await guardar({
      respostaCronometrada: {
        texto: resposta.trim(),
        segundosUsados,
        terminadoEm: new Date().toISOString(),
      },
    });
    setGuardando(false);
    setGuardado(true);
  }

  if (fase === 'a_decorrer') {
    return (
      <div className="me-pagina me-pagina--cronometro" style={{ '--cor': cor }}>
        <div className="me-cronometro">
          <span className="me-cronometro__label">{restam <= 300 ? 'últimos minutos' : 'tempo restante'}</span>
          <strong className={`me-cronometro__tempo ${restam <= 300 ? 'me-cronometro__tempo--aperto' : ''}`}>{formatarTempo(restam)}</strong>
        </div>

        <div className="me-enunciado">
          <p className="me-enunciado__cadeira">{abrevCadeiras[caso.cadeiraId] || '—'}</p>
          <h2 className="me-enunciado__titulo">{caso.titulo}</h2>
          <p className="me-enunciado__texto">{caso.enunciado}</p>
        </div>

        <button className="me-btn-terminar" onClick={terminarAgora}>Terminar agora</button>
      </div>
    );
  }

  return (
    <div className="me-pagina" style={{ '--cor': cor }}>
      <h1 className="me-titulo">Como te saíste?</h1>
      <p className="me-intro">Usaste {formatarTempo(segundosUsados)} de 90:00. Cola aqui o que escreveste, para poderes comparar depois com a correção.</p>

      {guardado ? (
        <div className="me-guardado">
          <p>✓ Guardado no caso "{caso.titulo}".</p>
          <button className="me-btn-terminar" onClick={onSair}>Voltar ao Modo Exame</button>
        </div>
      ) : (
        <>
          <textarea
            className="me-resposta"
            rows={12}
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            placeholder="Cola ou escreve aqui a tua resposta..."
          />
          <button className="me-btn-terminar" onClick={guardarResposta} disabled={guardando || !resposta.trim()}>
            {guardando ? 'A guardar...' : 'Guardar no caso'}
          </button>
        </>
      )}
    </div>
  );
}
