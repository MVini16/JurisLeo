// aula a decorrer e aula seguinte, com sala e docente — o uso mais frequente da app entre as 14h e as 18h
import { useEffect, useState } from 'react';
import { aulaAgoraESeguinte } from '../services/ocorrencias.js';
import { getCadeira } from '../data/dadosLeonor.js';
import './CartaoAulaAgora.css';

function LinhaAula({ rotulo, aula, destaque = false }) {
  const cadeira = getCadeira(aula.cadeira);
  return (
    <div className={`agora-linha ${destaque ? 'agora-linha--destaque' : ''}`} style={{ '--cor': cadeira?.cor }}>
      <span className="agora-linha__rotulo">{rotulo}</span>
      <span className="agora-linha__corpo">
        <strong className="agora-linha__abrev">{cadeira?.abrev || aula.titulo}</strong>
        <span className="agora-linha__tipo">{aula.tipoAula === 'pratica' ? 'Prática' : 'Teórica'}</span>
      </span>
      <span className="agora-linha__detalhe">
        {aula.horaInicio}–{aula.horaFim}
        {aula.sala ? ` · ${aula.sala}` : ''}
        {aula.docente ? ` · ${aula.docente}` : ''}
      </span>
    </div>
  );
}

export default function CartaoAulaAgora({ aulasHoje }) {
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // sem aulas hoje não há nada a mostrar aqui — o cartão "Aulas de Hoje" já diz isso
  if (aulasHoje.length === 0) return null;

  const { emCurso, seguinte } = aulaAgoraESeguinte(aulasHoje, agora);

  return (
    <div className="card card-agora anim-entrada" style={{ '--delay': '0.15s' }}>
      <div className="card-header">
        <span className="card-icon">⏱️</span>
        <span className="card-titulo">Agora</span>
      </div>

      {!emCurso && !seguinte ? (
        <p className="card-vazio">As aulas de hoje já acabaram. Bom trabalho! 🎉</p>
      ) : (
        <div className="agora-lista">
          {emCurso && <LinhaAula rotulo="A decorrer" aula={emCurso} destaque />}
          {seguinte && <LinhaAula rotulo="A seguir" aula={seguinte} />}
        </div>
      )}
    </div>
  );
}
