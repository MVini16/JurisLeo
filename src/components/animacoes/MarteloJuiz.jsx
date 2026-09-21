// martelo de juiz que bate ao concluir uma tarefa — desenhado em SVG, dura menos de um segundo
import { useId } from 'react';

export default function MarteloJuiz() {
  const id = useId();
  return (
    <span className="martelo" aria-hidden="true">
      <svg viewBox="0 0 60 60" fill="none">
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="60">
            <stop offset="0" stopColor="var(--gold-claro)" />
            <stop offset="0.5" stopColor="var(--gold)" />
            <stop offset="1" stopColor="var(--gold-escuro)" />
          </linearGradient>
        </defs>
        {/* base onde o martelo bate */}
        <rect x="14" y="50" width="32" height="6" rx="2" fill={`url(#${id})`} />
        <ellipse className="martelo__onda" cx="30" cy="50" rx="12" ry="3" stroke={`url(#${id})`} strokeWidth="1.5" />
        {/* cabo e cabeça, a rodar à volta da mão */}
        <g className="martelo__cabo">
          <line x1="14" y1="46" x2="40" y2="20" stroke={`url(#${id})`} strokeWidth="3.4" strokeLinecap="round" />
          <rect x="30" y="8" width="22" height="12" rx="3" transform="rotate(45 41 14)" fill={`url(#${id})`} />
        </g>
      </svg>
    </span>
  );
}
