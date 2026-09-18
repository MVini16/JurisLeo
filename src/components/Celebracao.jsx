// celebração: confetti dourado + checkmark + frase, quando uma cadeira fica aprovada
import { useEffect, useState } from 'react';
import { escolherFrase } from '../hooks/useFrase.js';
import './Celebracao.css';

// nota: para escolher uma frase nova a cada celebração, o componente tem de
// remontar — no chamador, renderiza-o condicionalmente (`{ativa && <Celebracao .../>}`)
// em vez de o manter sempre montado com `ativa` a alternar
export default function Celebracao({ ativa = true, nota, onTerminar }) {
  const [frase] = useState(() => escolherFrase(nota >= 16 ? 'posNotaExcelente' : 'posNotaBoa'));

  useEffect(() => {
    const t = setTimeout(onTerminar, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ativa) return null;

  return (
    <div className="celebracao-overlay" onClick={onTerminar}>
      <div className="celebracao-confetti">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="celebracao-confetti__peca" style={{ '--i': i }} />
        ))}
      </div>

      <div className="celebracao-card">
        <svg className="celebracao-check" viewBox="0 0 52 52">
          <circle className="celebracao-check__circulo" cx="26" cy="26" r="24" />
          <path className="celebracao-check__visto" d="M14 27 l8 8 l16-16" />
        </svg>
        <span className="celebracao-nota">{nota}</span>
        <p className="celebracao-frase">{frase}</p>
        <button className="celebracao-saltar" onClick={onTerminar}>Saltar</button>
      </div>
    </div>
  );
}
