// ecrã de carregamento com uma frase do Barney ou do Damon, que muda de tempos a tempos, e uma animação de cada um.
// `compacto` serve dentro de uma página; sem ele ocupa o ecrã (o fallback das rotas)
import { useEffect, useState } from 'react';
import { usePreferencias } from '../hooks/usePreferencias.js';
import { frasesDoEstilo, proximaFrase } from '../data/carregamento.js';
import './EcraCarregar.css';

function Gravata() {
  return (
    <svg className="carr-icone carr-gravata" viewBox="0 0 40 56" width="44" height="62" aria-hidden="true">
      <path className="carr-gravata__no" d="M14 4h12l-3 8h-6z" />
      <path className="carr-gravata__corpo" d="M17 12h6l5 30-8 10-8-10z" />
    </svg>
  );
}

function Copo() {
  return (
    <svg className="carr-icone carr-copo" viewBox="0 0 48 56" width="48" height="56" aria-hidden="true">
      <path className="carr-copo__vidro" d="M8 6h32l-3 40a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4z" />
      <path className="carr-copo__licor" d="M10.5 24h27l-1.5 22a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" />
      <circle className="carr-copo__brilho" cx="35" cy="12" r="2" />
    </svg>
  );
}

export default function EcraCarregar({ compacto = false }) {
  const estilo = usePreferencias().carregamento;
  const frases = frasesDoEstilo(estilo);
  const [indice, setIndice] = useState(() => proximaFrase(frases, -1));

  useEffect(() => {
    if (frases.length < 2) return undefined;
    const relogio = setInterval(() => setIndice((i) => proximaFrase(frases, i)), 3200);
    return () => clearInterval(relogio);
  }, [frases.length, estilo]); // eslint-disable-line react-hooks/exhaustive-deps

  const frase = frases[indice];
  if (!frase) {
    return <div className={`carr ${compacto ? 'carr--compacto' : ''}`} role="status"><p className="carr-simples">A carregar...</p></div>;
  }

  return (
    <div className={`carr carr--${frase.autor} ${compacto ? 'carr--compacto' : ''}`} role="status" aria-live="polite">
      <div className="carr-cena">
        {frase.autor === 'barney' ? <Gravata /> : <Copo />}
        <span className="carr-anel" aria-hidden="true" />
      </div>
      <p className="carr-frase" key={indice}>{frase.texto}</p>
      <span className="carr-assina">{frase.autor === 'barney' ? 'Barney' : 'Damon'}</span>
      <span className="carr-barra" aria-hidden="true"><i /></span>
    </div>
  );
}
