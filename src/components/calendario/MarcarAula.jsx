// marcar como correu cada aula: fui, faltei, falta justificada, o professor faltou, não houve aula
// usado no detalhe do evento do calendário; as etiquetas aparecem também nas listas e vistas
import { useState } from 'react';
import { ESTADOS_AULA, ROTULO_CURTO, MOTIVO_DOENCA } from '../../data/estadosAula.js';
import { motivosFalta, PRAZO_COMPROVATIVO_HORAS } from '../../data/motivosFalta.js';
import { jaPodeMarcar } from '../../services/presencas.js';
import './MarcarAula.css';

// chip pequeno com o estado, para pôr ao lado do título da aula
export function EtiquetaAula({ marca }) {
  if (!marca) return null;
  return <span className={`aula-chip aula-chip--${marca.estado}`}>{ROTULO_CURTO[marca.estado]}</span>;
}

export default function MarcarAula({ evento, marca, onMarcar, onLimpar }) {
  const [estado, setEstado] = useState(marca?.estado || '');
  const [motivo, setMotivo] = useState(marca?.motivo || '');
  const [comprovativo, setComprovativo] = useState(!!marca?.comprovativo);
  const [nota, setNota] = useState(marca?.nota || '');
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState('');

  if (!evento.cadeira) return null;

  if (!jaPodeMarcar(evento)) {
    return (
      <div className="marcar-aula">
        <p className="marcar-aula__titulo">Presença</p>
        <p className="marcar-aula__ajuda">Só podes marcar depois de a aula começar.</p>
      </div>
    );
  }

  const justificada = estado === 'faltei-justificada';
  const escolhido = ESTADOS_AULA.find((e) => e.id === estado);
  const incompleto = !estado || (justificada && !motivo);
  const alterado = !marca || marca.estado !== estado || (marca.motivo || '') !== (justificada ? motivo : '')
    || !!marca.comprovativo !== (justificada && comprovativo) || (marca.nota || '') !== nota.trim();

  function escolher(id) {
    setEstado(id);
    setErro('');
  }

  // atalho: estive doente = falta justificada com o motivo da lista oficial
  function estiveDoente() {
    setEstado('faltei-justificada');
    setMotivo(MOTIVO_DOENCA);
    setErro('');
  }

  async function guardar() {
    setAGuardar(true);
    setErro('');
    try {
      await onMarcar({ estado, motivo, comprovativo, nota });
    } catch {
      setErro('Não consegui guardar. Tenta outra vez.');
    }
    setAGuardar(false);
  }

  async function limpar() {
    setAGuardar(true);
    try {
      await onLimpar();
      setEstado(''); setMotivo(''); setComprovativo(false); setNota('');
    } catch {
      setErro('Não consegui limpar. Tenta outra vez.');
    }
    setAGuardar(false);
  }

  return (
    <div className="marcar-aula">
      <p className="marcar-aula__titulo">Como correu esta aula?</p>
      <p className="marcar-aula__ajuda">
        {evento.contaFalta
          ? 'Esta aula é prática: o que marcares entra na conta das faltas da cadeira.'
          : 'Esta aula é teórica: fica registada, mas não conta para as faltas.'}
      </p>

      <div className="marcar-aula__opcoes">
        {ESTADOS_AULA.map((e) => (
          <button key={e.id} type="button" className={`marcar-aula__op marcar-aula__op--${e.id} ${estado === e.id ? 'ativo' : ''}`} onClick={() => escolher(e.id)}>
            {e.rotulo}
          </button>
        ))}
        <button type="button" className="marcar-aula__op marcar-aula__op--atalho" onClick={estiveDoente}>Estive doente</button>
      </div>

      {escolhido && <p className="marcar-aula__ajuda">{escolhido.ajuda}</p>}

      {justificada && (
        <div className="marcar-aula__justificacao">
          <label className="marcar-aula__label" htmlFor="motivo-falta">Motivo</label>
          <select id="motivo-falta" className="marcar-aula__campo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="">Escolhe o motivo</option>
            {motivosFalta.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <label className="marcar-aula__check">
            <input type="checkbox" checked={comprovativo} onChange={(e) => setComprovativo(e.target.checked)} />
            <span>Já entreguei o comprovativo</span>
          </label>
          {!comprovativo && <p className="marcar-aula__aviso">Os comprovativos têm de ser entregues até às {PRAZO_COMPROVATIVO_HORAS}h do dia útil seguinte. Sem eles a falta pode não ser aceite.</p>}
        </div>
      )}

      {estado && (
        <>
          <label className="marcar-aula__label" htmlFor="nota-aula">Nota (opcional)</label>
          <textarea id="nota-aula" className="marcar-aula__campo marcar-aula__nota" rows={2} maxLength={300} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: a professora avisou por email, aula dada online..." />
        </>
      )}

      {erro && <p className="marcar-aula__erro">{erro}</p>}

      <div className="marcar-aula__acoes">
        <button type="button" className="marcar-aula__guardar" onClick={guardar} disabled={aGuardar || incompleto || !alterado}>
          {aGuardar ? 'A guardar...' : marca && !alterado ? 'Guardado' : 'Guardar'}
        </button>
        {marca && <button type="button" className="marcar-aula__limpar" onClick={limpar} disabled={aGuardar}>Limpar marca</button>}
      </div>
    </div>
  );
}
