// pergunta uma vez por dia, ao fim da tarde: "as aulas de hoje correram todas?"
// aparece só se ainda houver aulas de hoje por marcar
import { useEffect, useState } from 'react';
import { chaveData } from '../data/feriados.js';
import { getCadeira } from '../data/dadosLeonor.js';
import BotoesEstadoAula from './BotoesEstadoAula.jsx';
import './PerguntaFimDoDia.css';

const HORA_DA_PERGUNTA = 18;

function jaDispensou(chave) {
  try { return localStorage.getItem(`jurisleo-pergunta-aulas-${chave}`) === '1'; } catch { return false; }
}

function dispensar(chave) {
  try { localStorage.setItem(`jurisleo-pergunta-aulas-${chave}`, '1'); } catch { /* sem localstorage, sem problema */ }
}

export default function PerguntaFimDoDia({ aulasHoje, onMarcar }) {
  const [agora, setAgora] = useState(new Date());
  const [dispensada, setDispensada] = useState(false);
  const [erro, setErro] = useState('');
  const chave = chaveData(agora);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const pendentes = aulasHoje.filter((o) => o.estadoAula === 'porMarcar');
  if (agora.getHours() < HORA_DA_PERGUNTA || pendentes.length === 0 || dispensada || jaDispensou(chave)) return null;

  async function marcar(o, estado) {
    setErro('');
    try {
      await onMarcar(o, estado);
    } catch {
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
  }

  async function fuiATodas() {
    setErro('');
    try {
      for (const o of pendentes) await onMarcar(o, 'fui');
    } catch {
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
  }

  return (
    <div className="card card-pergunta anim-entrada" style={{ '--delay': '0.2s' }}>
      <div className="card-header">
        <span className="card-icon">🌆</span>
        <span className="card-titulo">As aulas de hoje correram todas?</span>
      </div>

      <button className="pergunta-todas" onClick={fuiATodas}>Sim, fui a todas</button>

      <ul className="pergunta-lista">
        {pendentes.map((o) => (
          <li key={o.ocorrenciaId} className="pergunta-item">
            <span className="pergunta-item__nome" style={{ color: getCadeira(o.cadeira)?.cor }}>
              {getCadeira(o.cadeira)?.abrev || o.titulo} · {o.tipoAula === 'pratica' ? 'Prática' : 'Teórica'} · {o.horaInicio}
            </span>
            <BotoesEstadoAula estado={o.estadoAula} onEscolher={(estado) => marcar(o, estado)} />
          </li>
        ))}
      </ul>

      {erro && <p className="pergunta-erro" role="alert">{erro}</p>}
      <button className="pergunta-depois" onClick={() => { dispensar(chave); setDispensada(true); }}>Agora não</button>
    </div>
  );
}
