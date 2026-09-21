// abertura da app: um livro que se abre, com o nome dela e a saudação da hora
// curta = versão rápida para as vezes seguintes no mesmo dia
import { useEffect, useId, useRef, useState } from 'react';
import './AberturaLivro.css';

const FRASES = [
  'O direito é a mais poderosa das forças sociais.',
  'A justiça é a ideia mais elevada da civilização humana.',
  'Conhece as leis, não para as seguir, mas para as compreender.',
  'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
  'A determinação de hoje é a vitória de amanhã.',
];

const TITULO = 'JurisLeo'.split('');
const FOLHAS = [0, 1, 2, 3, 4];

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 19) return 'Boa tarde';
  return 'Boa noite';
}

// balança desenhada a ouro; serve de emblema na capa e na página final
function Emblema({ className }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0" stopColor="var(--gold-escuro)" />
          <stop offset="0.55" stopColor="var(--burgundy)" />
          <stop offset="1" stopColor="var(--gold-escuro)" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="50" y1="12" x2="50" y2="84" />
        <line x1="20" y1="24" x2="80" y2="24" />
        <path d="M20 24 L10 46 M20 24 L30 46 M10 46 Q20 56 30 46 Z" />
        <path d="M80 24 L70 46 M80 24 L90 46 M70 46 Q80 56 90 46 Z" />
        <line x1="34" y1="86" x2="66" y2="86" />
        <line x1="28" y1="92" x2="72" y2="92" />
      </g>
      <circle cx="50" cy="11" r="3.4" fill={`url(#${id})`} />
    </svg>
  );
}

// arte da capa: moldura dupla, cantos, emblema e nome, tudo em ouro
function ArteCapa() {
  const id = useId();
  return (
    <svg viewBox="0 0 200 280" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="280">
          <stop offset="0" stopColor="var(--gold-claro)" />
          <stop offset="0.45" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--gold-escuro)" />
        </linearGradient>
        <path id={`${id}-canto`} d="M18 34 Q18 18 34 18 M18 26 Q26 26 26 18 M30 30 l4 -4 l4 4 l-4 4 z" />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="182" height="262" rx="4" strokeWidth="2" />
        <rect x="15" y="15" width="170" height="250" rx="2" strokeWidth="0.8" />
        <use href={`#${id}-canto`} />
        <use href={`#${id}-canto`} transform="translate(200 0) scale(-1 1)" />
        <use href={`#${id}-canto`} transform="translate(0 280) scale(1 -1)" />
        <use href={`#${id}-canto`} transform="translate(200 280) scale(-1 -1)" />
        <circle cx="100" cy="118" r="52" strokeWidth="0.9" strokeDasharray="2 4" />
        <circle cx="100" cy="118" r="58" strokeWidth="0.6" />
        <g transform="translate(58 76) scale(0.84)" strokeWidth="2.6">
          <line x1="50" y1="12" x2="50" y2="84" />
          <line x1="20" y1="24" x2="80" y2="24" />
          <path d="M20 24 L10 46 M20 24 L30 46 M10 46 Q20 56 30 46 Z" />
          <path d="M80 24 L70 46 M80 24 L90 46 M70 46 Q80 56 90 46 Z" />
          <line x1="34" y1="86" x2="66" y2="86" />
          <line x1="28" y1="92" x2="72" y2="92" />
        </g>
        <line x1="60" y1="208" x2="140" y2="208" strokeWidth="0.9" />
        <line x1="76" y1="252" x2="124" y2="252" strokeWidth="0.9" />
      </g>
      <text x="100" y="234" textAnchor="middle" fontFamily="Georgia, serif" fontSize="17" letterSpacing="4" fill={`url(#${id})`}>JURISLEO</text>
    </svg>
  );
}

export default function AberturaLivro({ curta = false, nome = 'Leonor', onEntrar }) {
  const [saltada, setSaltada] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const canvasRef = useRef(null);
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);
  const v = saltada ? 0.001 : curta ? 0.42 : 1;

  // faíscas e poeira dourada, desenhadas num canvas; param e limpam-se ao sair
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ajustar = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    let particulas = [];
    const rebentar = (fx, fy, n, forca) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const vel = (Math.random() * 5 + 1.5) * forca * dpr;
        particulas.push({ x: canvas.width * fx, y: canvas.height * fy, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel - 1.2 * dpr, r: (Math.random() * 2.6 + 0.8) * dpr, vida: 1, dv: Math.random() * 0.012 + 0.008, g: 0.05 * dpr });
      }
    };
    const poeira = () => {
      particulas.push({ x: Math.random() * canvas.width, y: canvas.height + 10, vx: (Math.random() - 0.5) * 0.5 * dpr, vy: -(Math.random() * 1.1 + 0.4) * dpr, r: (Math.random() * 1.8 + 0.6) * dpr, vida: Math.random() * 0.6 + 0.3, dv: 0.0025, g: 0 });
    };

    const timers = [];
    if (!saltada) {
      timers.push(setTimeout(() => rebentar(0.5, 0.54, 90, 1.3), 2300 * v));
      timers.push(setTimeout(() => rebentar(0.5, 0.2, 70, 1), 3000 * v));
      timers.push(setTimeout(() => rebentar(0.5, 0.2, 30, 0.6), 4400 * v));
    }
    const intervalo = setInterval(poeira, 140);

    let quadro;
    const desenhar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particulas = particulas.filter((p) => p.vida > 0);
      for (const p of particulas) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vida -= p.dv;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 223, 162, ${Math.max(p.vida, 0)})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 1)';
        ctx.shadowBlur = 12 * dpr;
        ctx.fill();
      }
      quadro = requestAnimationFrame(desenhar);
    };
    desenhar();

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(intervalo);
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', ajustar);
    };
  }, [saltada, v]);

  function entrar() {
    setSaindo(true);
    setTimeout(() => onEntrar?.(), 650);
  }

  return (
    <div className={`ab ${saindo ? 'saindo' : ''}`} style={{ '--v': v }}>
      <div className="ab-raios" />
      <div className="ab-luz" />

      <h1 className="ab-titulo" aria-label="JurisLeo">
        {TITULO.map((letra, i) => <span key={i} style={{ '--i': i }} aria-hidden="true">{letra}</span>)}
      </h1>
      <p className="ab-ola">{saudacao()}, {nome}</p>

      <div className="ab-cena" aria-hidden="true">
        <div className="ab-sombra" />
        <div className="ab-flutua">
          <div className="ab-livro">
            <div className="ab-face ab-couro ab-costas" />
            <div className="ab-face ab-lombada" />
            <div className="ab-face ab-corte-lado" />
            <div className="ab-face ab-corte-topo" />
            <div className="ab-face ab-corte-baixo" />

            {/* página que fica à direita no fim */}
            <div className="ab-pagina-fundo">
              <Emblema className="ab-emblema" />
            </div>

            {FOLHAS.map((k) => (
              <div
                key={k}
                className="ab-folha vira"
                style={{
                  '--k': k,
                  '--z0': `calc(var(--D) * 0.5 - var(--c) - ${k * 1.2}px)`,
                  '--zf': `calc(var(--D) * -0.5 + var(--c) + ${k * 1.2}px)`,
                }}
              >
                <div className="ab-folha-frente"><div className="ab-linhas" /></div>
                <div className="ab-folha-verso"><div className="ab-linhas" /></div>
              </div>
            ))}

            <div className="ab-fita" />
            <div className="ab-brilho-paginas" />

            <div className="ab-capa">
              <div className="ab-capa-frente ab-couro">
                <ArteCapa />
                <div className="ab-capa-brilho" />
              </div>
              <div className="ab-capa-dentro" />
            </div>
          </div>
        </div>
      </div>

      <p className="ab-frase">“{frase}”</p>

      <canvas ref={canvasRef} className="ab-particulas" />

      {!saltada && <button type="button" className="ab-saltar" onClick={() => setSaltada(true)}>Saltar</button>}
      <button type="button" className="ab-entrar" onClick={entrar}>Entrar</button>
    </div>
  );
}
