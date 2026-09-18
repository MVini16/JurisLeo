// os quatro botões de estado de uma aula: fui, faltei, o stor faltou, foi cancelada
// tocar outra vez no estado atual desfaz a marcação
import { ROTULOS_ESTADO_AULA } from '../data/estadosAula.js';
import './BotoesEstadoAula.css';

export default function BotoesEstadoAula({ estado, onEscolher, desativados = false }) {
  return (
    <div className="botoes-estado" role="group" aria-label="Como correu a aula">
      {Object.entries(ROTULOS_ESTADO_AULA).map(([id, r]) => (
        <button
          key={id}
          className={`botoes-estado__btn botoes-estado__btn--${id} ${estado === id ? 'ativo' : ''}`}
          onClick={() => onEscolher(estado === id ? 'porMarcar' : id)}
          disabled={desativados}
          aria-pressed={estado === id}
        >
          <span aria-hidden="true">{r.icone}</span> {r.texto}
        </button>
      ))}
    </div>
  );
}
