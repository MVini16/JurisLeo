// piada do barney (how i met your mother) — três animações:
// suspense (legen... pausa... dary!), carimbo (o "dary" cai como um selo) e segredo (versão grande, com faíscas)
import { useEffect } from 'react';
import { BARNEY } from '../data/easterEggs.js';
import './Barney.css';

const DURACAO_MS = 5200;

function Faiscas({ quantidade }) {
  return Array.from({ length: quantidade }).map((_, i) => (
    <s key={i} className="barney-faisca" style={{ '--a': `${(360 / quantidade) * i}deg`, '--d': `${i % 3}` }} />
  ));
}

export default function Barney({ variante = 'suspense', onTerminar }) {
  useEffect(() => {
    const t = setTimeout(onTerminar, DURACAO_MS);
    return () => clearTimeout(t);
  }, [onTerminar]);

  const carimbo = variante === 'carimbo';

  return (
    <div className={`barney-overlay barney--${variante}`} onClick={onTerminar} role="status" aria-live="polite">
      {!carimbo && <div className="barney-flash" />}
      <div className="barney-corpo">
        {carimbo ? (
          <>
            <span className="barney-1 barney-1--caps">{BARNEY.inicio}…</span>
            <em className="barney-espera">({BARNEY.espera.replace('…', '')})</em>
            <span className="barney-selo">{BARNEY.fim}</span>
          </>
        ) : (
          <>
            <div className="barney-linha">
              <span className="barney-1">{BARNEY.inicio}</span>
              <span className="barney-pontos" aria-hidden="true"><i /><i /><i /></span>
              <span className="barney-3">{BARNEY.fim}</span>
            </div>
            <em className="barney-espera">{BARNEY.espera}</em>
          </>
        )}
      </div>
      {!carimbo && <Faiscas quantidade={variante === 'segredo' ? 20 : 10} />}
    </div>
  );
}
