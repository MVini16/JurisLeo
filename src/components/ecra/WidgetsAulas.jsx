// widgets das aulas de hoje: aula agora, carteira de cadeiras, aquecimento e janelas livres
// recebem as aulas já lidas pelo dashboard (contexto), para não abrir escutas repetidas
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { aulaAgoraESeguinte, paraMinutos } from '../../services/ocorrencias.js';
import { proximaPratica, linhaDoDia, horaDeMinutos } from '../../services/widgets.js';
import { estadoFaltas } from '../../services/faltas.js';
import { getCadeira } from '../../data/dadosLeonor.js';
import { useFaltas } from '../../hooks/useFaltas.js';
import PerguntaFimDoDia from '../PerguntaFimDoDia.jsx';

const minutosDe = (d) => d.getHours() * 60 + d.getMinutes();
const tipo = (aula) => (aula.tipoAula === 'pratica' ? 'Prática' : 'Teórica');

// anel pequeno dos minutos que faltam para a aula acabar
function AnelMinutos({ faltam, total }) {
  const r = 27;
  const c = 2 * Math.PI * r;
  const fracao = total > 0 ? 1 - faltam / total : 0;
  return (
    <div className="ew-anel" aria-label={`faltam ${faltam} minutos`}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ew-anel__fundo" />
        <circle cx="32" cy="32" r={r} className="ew-anel__cheio" strokeDasharray={c} strokeDashoffset={c * (1 - fracao)} />
      </svg>
      <b>{faltam}<small>min</small></b>
    </div>
  );
}

export function WidgetAula({ tamanho, contexto }) {
  const { aulasHoje, agora, marcarAula } = contexto;
  if (aulasHoje.length === 0) return null;
  const { emCurso, seguinte } = aulaAgoraESeguinte(aulasHoje, agora);

  // as aulas acabaram: ao fim da tarde pergunta se correram todas
  if (!emCurso && !seguinte) {
    return <PerguntaFimDoDia aulasHoje={aulasHoje} onMarcar={marcarAula} />;
  }

  const aula = emCurso || seguinte;
  const cadeira = getCadeira(aula.cadeira);
  const ini = paraMinutos(aula.horaInicio);
  const fim = paraMinutos(aula.horaFim);
  const faltamFim = Math.max(0, fim - minutosDe(agora));
  const faltamInicio = Math.max(0, ini - minutosDe(agora));
  const depois = emCurso ? seguinte : null;

  if (tamanho === 'pequeno') {
    return (
      <div className="ew ew--escuro ew-aula-mini">
        <span className="ew-vivo">{emCurso ? 'agora' : `daqui a ${faltamInicio} min`}</span>
        <h3>{cadeira?.abrev || aula.titulo}</h3>
        <p>{aula.sala || tipo(aula)}{emCurso ? ` · faltam ${faltamFim} min` : ` · ${aula.horaInicio}`}</p>
        {emCurso && <div className="ew-barra ew-barra--claro"><i style={{ width: `${Math.round((1 - faltamFim / Math.max(1, fim - ini)) * 100)}%` }} /></div>}
      </div>
    );
  }

  return (
    <div className="ew ew--escuro ew-aula">
      <div className="ew-aula__topo">
        <div>
          <span className="ew-vivo">{emCurso ? `a decorrer · ${tipo(aula).toLowerCase()}` : `a seguir · daqui a ${faltamInicio} min`}</span>
          <h3>{cadeira?.nome || aula.titulo}</h3>
          <p>{[aula.sala, emCurso ? `até às ${aula.horaFim}` : `às ${aula.horaInicio}`].filter(Boolean).join(' · ')}</p>
        </div>
        {emCurso && <AnelMinutos faltam={faltamFim} total={fim - ini} />}
      </div>
      {depois && (
        <div className="ew-aula__rodape">
          <i style={{ background: getCadeira(depois.cadeira)?.cor }} />
          <span>A seguir: <b>{getCadeira(depois.cadeira)?.abrev || depois.titulo}</b></span>
          <span className="ew-num">{depois.horaInicio}{depois.sala ? ` · ${depois.sala}` : ''}</span>
        </div>
      )}
    </div>
  );
}

// estado de uma aula para o passe: agora, a seguir, passada, e o que ela marcou
function estadoDoPasse(aula, agora, idSeguinte) {
  const m = minutosDe(agora);
  if (aula.estadoAula === 'fui') return { texto: 'presente ✓', passada: true };
  if (aula.estadoAula === 'faltei') return { texto: 'faltei', passada: true };
  if (aula.estadoAula === 'cancelada') return { texto: 'cancelada', passada: true };
  if (m >= paraMinutos(aula.horaInicio) && m < paraMinutos(aula.horaFim)) return { texto: 'agora', agora: true };
  if (m >= paraMinutos(aula.horaFim)) return { texto: 'acabou', passada: true };
  if (aula.ocorrenciaId === idSeguinte) return { texto: 'a seguir' };
  return { texto: aula.sala || aula.horaInicio };
}

export function WidgetCarteira({ tamanho, contexto }) {
  const { aulasHoje, agora } = contexto;
  const navigate = useNavigate();
  const { cadeiras, faltasDados } = useFaltas();
  const [aberto, setAberto] = useState(null);
  if (aulasHoje.length === 0) return null;

  const { seguinte } = aulaAgoraESeguinte(aulasHoje, agora);
  const aulas = aulasHoje.map((a) => ({ aula: a, estado: estadoDoPasse(a, agora, seguinte?.ocorrenciaId) }));

  if (tamanho === 'pequeno') {
    return (
      <Link to="/horario" className="ew ew-carteira-mini">
        <span className="ew-rotulo">Hoje · {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}</span>
        <ul>
          {aulas.map(({ aula, estado }) => (
            <li key={aula.ocorrenciaId || aula.id} className={estado.passada ? 'passada' : ''}>
              <i style={{ background: getCadeira(aula.cadeira)?.cor }} />
              <span className="ew-num">{aula.horaInicio}</span> {getCadeira(aula.cadeira)?.abrev || aula.titulo}
            </li>
          ))}
        </ul>
      </Link>
    );
  }

  // o passe aberto por defeito é o da aula de agora, senão o da seguinte, senão o último
  const idPadrao = (aulas.find((x) => x.estado.agora) || aulas.find((x) => x.aula.ocorrenciaId === seguinte?.ocorrenciaId) || aulas.at(-1)).aula.ocorrenciaId;
  const idAberto = aberto ?? idPadrao;
  // o aberto vai para o fim da pilha, para se ver inteiro
  const ordenadas = [...aulas.filter((x) => x.aula.ocorrenciaId !== idAberto), ...aulas.filter((x) => x.aula.ocorrenciaId === idAberto)];

  return (
    <div className="ew-carteira" role="list" aria-label="Aulas de hoje">
      {ordenadas.map(({ aula, estado }) => {
        const cadeira = getCadeira(aula.cadeira);
        const docCadeira = cadeiras.find((c) => c.id === aula.cadeira);
        const faltas = docCadeira && faltasDados[aula.cadeira]
          ? estadoFaltas({ aulasPraticasPrevistas: docCadeira.aulasPraticasPrevistas ?? cadeira?.aulasPraticasPrevistas, ...faltasDados[aula.cadeira] })
          : null;
        const eAberto = aula.ocorrenciaId === idAberto;
        return (
          <button
            key={aula.ocorrenciaId || aula.id}
            type="button"
            role="listitem"
            className={`ew-passe ${eAberto ? 'aberto' : ''} ${estado.passada ? 'passada' : ''}`}
            style={{ '--cor': cadeira?.cor || 'var(--gold)' }}
            aria-expanded={eAberto}
            onClick={() => (eAberto ? navigate(`/cadeiras/${aula.cadeira}`) : setAberto(aula.ocorrenciaId))}
          >
            <span className="ew-passe__topo">
              <span>
                <b className="ew-passe__nome">{cadeira?.nome || aula.titulo}</b>
                <span className="ew-passe__sub">{tipo(aula)} · {aula.horaInicio}</span>
              </span>
              <span className="ew-passe__estado">{estado.texto}</span>
            </span>
            <span className="ew-passe__dados">
              <span><small>Faltas</small><b className={`ew-semaforo ew-semaforo--${faltas?.semaforo || 'sem'}`}>{faltas ? `pode mais ${faltas.faltasRestantesSemestre}` : '—'}</b></span>
              <span><small>Sala</small><b>{aula.sala || '—'}</b></span>
              <span><small>Regente</small><b className="ew-passe__regente">{cadeira?.regente || '—'}</b></span>
            </span>
            <span className="ew-passe__rodape">
              <span>Método {cadeira?.metodo || '—'}</span>
              <span>{eAberto ? 'toca para abrir a cadeira ›' : ''}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function WidgetAquecimento({ tamanho, contexto }) {
  const pratica = proximaPratica(contexto.aulasHoje, contexto.agora);
  if (!pratica) return null;
  const cadeira = getCadeira(pratica.aula.cadeira);
  const cartoes = `/flashcards?cadeira=${pratica.aula.cadeira}&baralho=1`;

  if (tamanho === 'pequeno') {
    return (
      <div className="ew ew-aquecimento" style={{ '--cor': cadeira?.cor }}>
        <span className="ew-rotulo">Aquecimento</span>
        <h3>{cadeira?.abrev} às {pratica.aula.horaInicio}</h3>
        <Link className="ew-aquecimento__botao" to={cartoes}>5 min</Link>
      </div>
    );
  }
  return (
    <div className="ew ew-aquecimento" style={{ '--cor': cadeira?.cor }}>
      <span className="ew-rotulo">Daqui a {pratica.faltam} min · prática</span>
      <h3>{cadeira?.nome || pratica.aula.titulo}</h3>
      <p>Revê os cartões desta cadeira e as tuas perguntas para o stor antes de entrar.</p>
      <div className="ew-aquecimento__botoes">
        <Link className="ew-aquecimento__botao" to={cartoes}>Rever cartões</Link>
        <Link className="ew-aquecimento__botao ew-aquecimento__botao--2" to="/fichas/perguntas">Perguntas</Link>
      </div>
    </div>
  );
}

export function WidgetJanelas({ contexto }) {
  const linha = linhaDoDia(contexto.aulasHoje);
  if (!linha) return null;
  const agora = minutosDe(contexto.agora);
  const maior = [...linha.furos].sort((a, b) => b.minutos - a.minutos)[0];

  return (
    <Link to="/horario" className="ew ew-janelas">
      <span className="ew-rotulo">Hoje · {linha.furos.length === 0 ? 'sem furos' : `${linha.furos.length} ${linha.furos.length === 1 ? 'janela livre' : 'janelas livres'}`}</span>
      <div className="ew-linha" aria-hidden="true">
        {linha.blocos.map((b) => (
          <i key={b.aula.ocorrenciaId || b.ini} className={b.fim <= agora ? 'passado' : ''} style={{ left: `${b.esquerda}%`, width: `${b.largura}%`, background: getCadeira(b.aula.cadeira)?.cor }} />
        ))}
        {linha.furos.map((f) => <i key={f.inicio} className="livre" style={{ left: `${f.esquerda}%`, width: `${f.largura}%` }} />)}
        {agora > linha.inicio && agora < linha.fim && <span className="ew-linha__agora" style={{ left: `${((agora - linha.inicio) / (linha.fim - linha.inicio)) * 100}%` }} />}
      </div>
      <div className="ew-linha__legenda ew-num">
        <span>{horaDeMinutos(linha.inicio)}</span>
        <span>{maior ? `${horaDeMinutos(maior.inicio)}–${horaDeMinutos(maior.fim)} · ${maior.minutos} min livres` : 'aulas seguidas'}</span>
        <span>{horaDeMinutos(linha.fim)}</span>
      </div>
    </Link>
  );
}
