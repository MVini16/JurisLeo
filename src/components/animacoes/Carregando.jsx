// animações de carregamento: a balança (listas e blocos pequenos) e o templo (páginas inteiras)
import { useId } from 'react';
import './Carregando.css';

function Balanca() {
  const id = useId();
  return (
    <svg className="cb" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="110" y2="110">
          <stop offset="0" stopColor="var(--gold-claro)" />
          <stop offset="0.5" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--gold-escuro)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="60" y1="22" x2="60" y2="98" />
        <path d="M40 104 H80 M32 111 H88" />
        <g className="cb-feixe">
          <line x1="20" y1="28" x2="100" y2="28" />
          <g className="cb-prato cb-prato-e">
            <path d="M20 28 L8 62 M20 28 L32 62" strokeWidth="1.8" strokeDasharray="1 4.5" />
            <path d="M6 62 Q20 78 34 62 Z" fill={`url(#${id})`} fillOpacity="0.25" />
          </g>
          <g className="cb-prato cb-prato-d">
            <path d="M100 28 L88 62 M100 28 L112 62" strokeWidth="1.8" strokeDasharray="1 4.5" />
            <path d="M86 62 Q100 78 114 62 Z" fill={`url(#${id})`} fillOpacity="0.25" />
          </g>
        </g>
      </g>
      <circle className="cb-pivo" cx="60" cy="28" r="5" fill={`url(#${id})`} />
      <circle cx="60" cy="16" r="3.4" fill={`url(#${id})`} />
    </svg>
  );
}

function Templo() {
  const id = useId();
  return (
    <div className="ct" aria-hidden="true">
      <svg className="ct-frontao" viewBox="0 0 220 60" fill="none">
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="220" y2="60">
            <stop offset="0" stopColor="var(--gold-claro)" />
            <stop offset="0.5" stopColor="var(--gold)" />
            <stop offset="1" stopColor="var(--gold-escuro)" />
          </linearGradient>
        </defs>
        <path d="M4 56 L110 6 L216 56 Z" pathLength="1" stroke={`url(#${id})`} strokeWidth="3" strokeLinejoin="round" fill="color-mix(in srgb, var(--gold) 12%, transparent)" />
        <circle cx="110" cy="34" r="6" stroke={`url(#${id})`} strokeWidth="1.6" />
      </svg>
      <div className="ct-arquitrave" />
      {[0, 1, 2, 3, 4, 5].map((c) => (
        <div key={c} className="ct-coluna" style={{ '--c': c, left: `${14 + c * 37}px` }}>
          <i className="ct-capitel" />
          <i className="ct-base" />
        </div>
      ))}
      <div className="ct-degrau" style={{ '--d': 0 }} />
      <div className="ct-degrau ct-degrau-2" style={{ '--d': 1 }} />
      <div className="ct-degrau ct-degrau-3" style={{ '--d': 2 }} />
      <div className="ct-brilho-caixa"><div className="ct-brilho" /></div>
    </div>
  );
}

// tipo 'balanca' para listas, 'templo' para páginas inteiras
export default function Carregando({ texto = 'A carregar...', tipo = 'balanca' }) {
  return (
    <div className={`carregando carregando--${tipo}`} role="status" aria-live="polite">
      {tipo === 'templo' ? <Templo /> : <Balanca />}
      <p className="carregando-texto">{texto.replace(/\.+$/, '')}</p>
    </div>
  );
}
