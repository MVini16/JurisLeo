// fallback de carregamento das rotas — o "legen... dary" a pulsar enquanto a página chega
import { lerPreferencias } from '../services/preferenciasBrincadeiras.js';
import { BARNEY } from '../data/easterEggs.js';
import './BarneyCarregar.css';

export default function BarneyCarregar() {
  const brincadeira = lerPreferencias().barney;
  return (
    <div className="rota-carregar" role="status" aria-label="A carregar">
      {brincadeira ? (
        <span className="barney-carregar">
          <span>{BARNEY.inicio}</span>
          <span className="barney-carregar__pontos" aria-hidden="true"><i /><i /><i /></span>
          <span className="barney-carregar__fim">{BARNEY.fim}</span>
        </span>
      ) : 'A carregar...'}
    </div>
  );
}
