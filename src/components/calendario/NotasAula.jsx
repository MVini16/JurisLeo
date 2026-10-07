// o que ela escreve sobre cada aula: sumário, nota, trabalho para casa e dúvida (fica guardado na conta dela)
import { useState } from 'react';
import { CAMPOS_NOTAS_AULA, jaPodeMarcar } from '../../services/presencas.js';
import './MarcarAula.css';

const ROTULOS = {
  sumario: ['Sumário', 'O que foi dado na aula'],
  nota: ['Nota', 'Uma nota rápida sobre a aula'],
  tpc: ['Trabalho para casa', 'O que ficou para fazer'],
  duvida: ['Dúvida', 'O que quero perguntar ao docente'],
};

export default function NotasAula({ evento, notas, onGuardar }) {
  const [campos, setCampos] = useState(() => Object.fromEntries(CAMPOS_NOTAS_AULA.map((c) => [c, notas?.[c] || ''])));
  const [estado, setEstado] = useState('');
  const [novoTopico, setNovoTopico] = useState('');

  if (!evento.cadeira || !jaPodeMarcar(evento)) return null;

  const original = (c) => notas?.[c] || '';
  const alterado = novoTopico.trim() !== '' || CAMPOS_NOTAS_AULA.some((c) => campos[c].trim() !== original(c));

  // o sumário é uma lista de tópicos (um por linha): o que se deu na aula
  const topicos = campos.sumario ? campos.sumario.split('\n').filter((t) => t.trim()) : [];
  function mudarTopicos(lista) {
    setCampos((p) => ({ ...p, sumario: lista.join('\n') }));
    setEstado('');
  }
  function juntarTopico() {
    const t = novoTopico.trim();
    if (!t) return;
    mudarTopicos([...topicos, t]);
    setNovoTopico('');
  }

  async function guardar() {
    setEstado('a guardar');
    try {
      const sumario = novoTopico.trim() ? [...topicos, novoTopico.trim()].join('\n') : campos.sumario;
      await onGuardar({ ...campos, sumario });
      if (novoTopico.trim()) { setCampos((p) => ({ ...p, sumario })); setNovoTopico(''); }
      setEstado('guardado');
    } catch {
      setEstado('erro');
    }
  }

  return (
    <div className="marcar-aula">
      <p className="marcar-aula__titulo">Sumário e notas da aula</p>
      <div className="notas-aula__campo">
        <span className="marcar-aula__label">Sumário: o que demos na aula</span>
        {topicos.length > 0 && (
          <ul className="notas-aula__topicos">
            {topicos.map((t, i) => (
              <li key={`${t}-${i}`}><span>{t}</span><button type="button" aria-label={`Tirar o tópico ${t}`} onClick={() => mudarTopicos(topicos.filter((_, j) => j !== i))}>×</button></li>
            ))}
          </ul>
        )}
        <div className="notas-aula__novo">
          <input className="marcar-aula__campo" type="text" maxLength={200} placeholder="Escreve um tópico e carrega em Enter" value={novoTopico}
            onChange={(e) => setNovoTopico(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); juntarTopico(); } }} />
          <button type="button" className="notas-aula__mais" onClick={juntarTopico} disabled={!novoTopico.trim()}>Juntar</button>
        </div>
      </div>
      {CAMPOS_NOTAS_AULA.filter((c) => c !== 'sumario').map((c) => (
        <div key={c} className="notas-aula__campo">
          <label className="marcar-aula__label" htmlFor={`na-${c}`}>{ROTULOS[c][0]}</label>
          <textarea id={`na-${c}`} className="marcar-aula__campo marcar-aula__nota" rows={2} maxLength={1500}
            placeholder={ROTULOS[c][1]} value={campos[c]} onChange={(e) => { setCampos((p) => ({ ...p, [c]: e.target.value })); setEstado(''); }} />
        </div>
      ))}
      {estado === 'erro' && <p className="marcar-aula__erro">Não consegui guardar. Tenta outra vez.</p>}
      <div className="marcar-aula__acoes">
        <button type="button" className="marcar-aula__guardar" onClick={guardar} disabled={!alterado || estado === 'a guardar'}>
          {estado === 'a guardar' ? 'A guardar...' : estado === 'guardado' && !alterado ? 'Guardado' : 'Guardar sumário e notas'}
        </button>
      </div>
    </div>
  );
}
