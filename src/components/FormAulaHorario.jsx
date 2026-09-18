// formulário para adicionar, mover ou apagar uma aula do horário semanal
import { useState } from 'react';
import { cadeirasS1, temposLetivos } from '../data/dadosLeonor.js';
import './FormAulaHorario.css';

const DIAS = [
  { n: 1, rotulo: 'Seg' },
  { n: 2, rotulo: 'Ter' },
  { n: 3, rotulo: 'Qua' },
  { n: 4, rotulo: 'Qui' },
  { n: 5, rotulo: 'Sex' },
];

export default function FormAulaHorario({ aula, inicial, aulas, onGuardar, onApagar, onFechar }) {
  const [cadeira, setCadeira] = useState(aula?.cadeira || inicial?.cadeira || cadeirasS1[0].id);
  const [tipoAula, setTipoAula] = useState(aula?.tipoAula || (aula?.contaFalta ? 'pratica' : aula ? 'teorica' : 'pratica'));
  const [dia, setDia] = useState(aula?.diaSemana || inicial?.diaSemana || 1);
  const [tempo, setTempo] = useState(
    () => temposLetivos.find((t) => t.inicio === (aula?.horaInicio || inicial?.horaInicio))?.id || 1
  );
  const [sala, setSala] = useState(aula?.sala || '');
  const [docente, setDocente] = useState(aula?.docente || '');
  const [aGuardar, setAGuardar] = useState(false);
  const [aApagar, setAApagar] = useState(false);
  const [erro, setErro] = useState('');

  const slot = temposLetivos.find((t) => t.id === tempo);
  const ocupada = aulas.find((a) => a.id !== aula?.id && a.diaSemana === dia && a.horaInicio === slot.inicio);

  async function guardar() {
    setAGuardar(true);
    setErro('');
    const c = cadeirasS1.find((x) => x.id === cadeira);
    try {
      await onGuardar({
        titulo: `${c.abrev} · ${tipoAula === 'pratica' ? 'Prática' : 'Teórica'}`,
        cadeira,
        tipoAula,
        diaSemana: dia,
        horaInicio: slot.inicio,
        horaFim: slot.fim,
        sala: sala.trim(),
        docente: docente.trim(),
      });
    } catch {
      setAGuardar(false);
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
  }

  async function apagar() {
    setAGuardar(true);
    try {
      await onApagar();
    } catch {
      setAGuardar(false);
      setErro('Não consegui apagar agora. Tenta outra vez daqui a pouco.');
    }
  }

  return (
    <div className="form-aula-overlay" onClick={onFechar}>
      <div className="form-aula" role="dialog" aria-modal="true" aria-label={aula ? 'Editar aula' : 'Nova aula'} onClick={(e) => e.stopPropagation()}>
        <div className="form-aula__handle" />
        <h2 className="form-aula__titulo">{aula ? 'Editar aula' : 'Nova aula'}</h2>

        <p className="form-aula__label">Cadeira</p>
        <div className="form-aula__opcoes">
          {cadeirasS1.map((c) => (
            <button key={c.id} className={`form-aula__chip ${cadeira === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeira(c.id)}>
              {c.abrev}
            </button>
          ))}
        </div>

        <p className="form-aula__label">Tipo</p>
        <div className="form-aula__opcoes">
          <button className={`form-aula__chip ${tipoAula === 'teorica' ? 'ativo' : ''}`} onClick={() => setTipoAula('teorica')}>Teórica</button>
          <button className={`form-aula__chip ${tipoAula === 'pratica' ? 'ativo' : ''}`} onClick={() => setTipoAula('pratica')}>Prática</button>
        </div>

        <p className="form-aula__label">Dia</p>
        <div className="form-aula__opcoes">
          {DIAS.map((d) => (
            <button key={d.n} className={`form-aula__chip ${dia === d.n ? 'ativo' : ''}`} onClick={() => setDia(d.n)}>{d.rotulo}</button>
          ))}
        </div>

        <p className="form-aula__label">Tempo</p>
        <div className="form-aula__opcoes">
          {temposLetivos.map((t) => (
            <button key={t.id} className={`form-aula__chip ${tempo === t.id ? 'ativo' : ''}`} onClick={() => setTempo(t.id)}>
              {t.inicio}–{t.fim}
            </button>
          ))}
        </div>

        {ocupada && (
          <p className="form-aula__aviso">
            Já tens {ocupada.titulo} neste tempo. Podes guardar na mesma, mas ficam duas aulas em cima uma da outra.
          </p>
        )}

        <label className="form-aula__label" htmlFor="form-aula-sala">Sala</label>
        <input id="form-aula-sala" className="form-aula__input" value={sala} onChange={(e) => setSala(e.target.value)} placeholder="Ex.: 12.02" />

        <label className="form-aula__label" htmlFor="form-aula-docente">Docente</label>
        <input id="form-aula-docente" className="form-aula__input" value={docente} onChange={(e) => setDocente(e.target.value)} placeholder="Opcional" />

        <p className="form-aula__nota">As marcações de "fui" e "faltei" já feitas ficam como estão.</p>
        {erro && <p className="form-aula__erro" role="alert">{erro}</p>}

        <div className="form-aula__botoes">
          {aula && !aApagar && (
            <button className="form-aula__btn form-aula__btn--sec" onClick={() => setAApagar(true)}>Apagar</button>
          )}
          {aula && aApagar && (
            <button className="form-aula__btn form-aula__btn--perigo" onClick={apagar} disabled={aGuardar}>Sim, apagar esta aula</button>
          )}
          <button className="form-aula__btn form-aula__btn--sec" onClick={onFechar}>Cancelar</button>
          <button className="form-aula__btn form-aula__btn--pri" onClick={guardar} disabled={aGuardar}>
            {aGuardar ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
