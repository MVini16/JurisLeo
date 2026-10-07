// os três aspetos do boneco, desenhados em svg (sem imagens). o "vini de toga" usa a aparência de data/boneco.js
import { APARENCIA_DO_VINI } from '../../data/boneco.js';

function CabeloDoVini({ estilo, cor }) {
  if (estilo === 'rapado') {
    return <path d="M19 27 Q19 14 32 14 Q45 14 45 27 Q40 21 32 21 Q24 21 19 27Z" fill={cor} opacity="0.55" />;
  }
  if (estilo === 'cacheado') {
    return (
      <g fill={cor}>
        <circle cx="21" cy="21" r="6" /><circle cx="28" cy="16" r="6.5" /><circle cx="36" cy="16" r="6.5" />
        <circle cx="43" cy="21" r="6" /><circle cx="32" cy="19" r="7" />
      </g>
    );
  }
  return <path d="M18 29 Q16 12 32 12 Q48 12 46 29 Q44 20 38 19 Q30 22 24 19 Q19 21 18 29Z" fill={cor} />;
}

function ViniDeToga({ falando }) {
  const { pele, cabelo, estiloCabelo, oculos, barba, toga } = APARENCIA_DO_VINI;
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Boneco do Vini, de toga" className={falando ? 'boneco-avatar boneco-avatar--fala' : 'boneco-avatar'}>
      <path fill={toga} d="M6 64 Q8 46 22 43 L42 43 Q56 46 58 64Z" />
      <path className="boneco-peitilho" d="M26 43 L32 54 L38 43Z" />
      <path className="boneco-friso" d="M22 43 L32 58 L42 43" fill="none" />
      <rect x="28" y="38" width="8" height="7" rx="3" fill={pele} />
      <circle cx="32" cy="27" r="14" fill={pele} />
      {barba === 'cheia' && <path d="M19 30 Q20 46 32 46 Q44 46 45 30 Q42 39 32 39 Q22 39 19 30Z" fill={cabelo} opacity="0.9" />}
      {barba === 'curta' && <path d="M20 31 Q22 41 32 41 Q42 41 44 31 Q41 36 32 36 Q23 36 20 31Z" fill={cabelo} opacity="0.75" />}
      <CabeloDoVini estilo={estiloCabelo} cor={cabelo} />
      <circle cx="26.5" cy="28" r="1.7" fill="#2A1A12" />
      <circle cx="37.5" cy="28" r="1.7" fill="#2A1A12" />
      {oculos === 'redondos' && (
        <g fill="none" stroke="#2A1A12" strokeWidth="1.2">
          <circle cx="26.5" cy="28" r="4.2" /><circle cx="37.5" cy="28" r="4.2" /><path d="M30.7 28 H33.3" />
        </g>
      )}
      {oculos === 'quadrados' && (
        <g fill="none" stroke="#2A1A12" strokeWidth="1.3">
          <rect x="22" y="24.5" width="9" height="7" rx="1.5" /><rect x="33" y="24.5" width="9" height="7" rx="1.5" /><path d="M31 28 H33" />
        </g>
      )}
      <path d="M27 34 Q32 38.5 37 34" fill="none" stroke="#2A1A12" strokeWidth="1.6" strokeLinecap="round" />
      <path className="boneco-barrete" d="M19 17 L32 11 L45 17 L32 23Z" />
      <path className="boneco-barrete-fio" d="M45 17 L47 25" fill="none" />
    </svg>
  );
}

function Balanca({ falando }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Boneco do Vini, uma balança simpática" className={falando ? 'boneco-avatar boneco-avatar--fala' : 'boneco-avatar'}>
      <path className="boneco-balanca-traco" d="M12 24 H52 M32 14 V50 M20 52 H44" fill="none" />
      <path className="boneco-balanca-traco" d="M12 24 L6 38 H18Z M52 24 L46 38 H58Z" fill="none" />
      <path className="boneco-balanca-prato" d="M6 38 Q12 46 18 38Z M46 38 Q52 46 58 38Z" />
      <circle className="boneco-balanca-cara" cx="32" cy="32" r="9" />
      <circle cx="29" cy="30.5" r="1.3" fill="#2A1A12" /><circle cx="35" cy="30.5" r="1.3" fill="#2A1A12" />
      <path d="M28.5 34 Q32 37 35.5 34" fill="none" stroke="#2A1A12" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BalaoComV({ falando }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Boneco do Vini, um balão com um V" className={falando ? 'boneco-avatar boneco-avatar--fala' : 'boneco-avatar'}>
      <path className="boneco-balao" d="M32 8 C48 8 58 18 58 30 C58 42 48 50 36 50 L26 58 L27 49 C15 47 6 40 6 30 C6 18 16 8 32 8Z" />
      <text x="32" y="38" textAnchor="middle" className="boneco-balao-v">V</text>
    </svg>
  );
}

export default function AvatarBoneco({ aspeto = 'A', falando = false }) {
  if (aspeto === 'B') return <Balanca falando={falando} />;
  if (aspeto === 'C') return <BalaoComV falando={falando} />;
  return <ViniDeToga falando={falando} />;
}
