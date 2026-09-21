// poeira dourada a subir devagar, para fundos calmos (login). nunca em ecrãs de trabalho
import { useEffect, useRef } from 'react';

export default function PoeiraDourada({ quantidade = 26 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    // quem pede menos movimento não leva partículas
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (document.documentElement.getAttribute('data-animacoes') === 'off') return undefined;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ajustar = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    const nova = (noFundo) => ({
      x: Math.random() * canvas.width,
      y: noFundo ? canvas.height + 10 : Math.random() * canvas.height,
      r: (Math.random() * 1.6 + 0.5) * dpr,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: -(Math.random() * 0.5 + 0.15) * dpr,
      a: Math.random() * 0.45 + 0.1,
    });
    const particulas = Array.from({ length: quantidade }, () => nova(false));

    let quadro;
    const desenhar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) Object.assign(p, nova(true));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 223, 162, ${p.a})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 1)';
        ctx.shadowBlur = 8 * dpr;
        ctx.fill();
      }
      quadro = requestAnimationFrame(desenhar);
    };
    desenhar();

    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('resize', ajustar);
    };
  }, [quantidade]);

  return <canvas ref={ref} className="poeira-dourada" aria-hidden="true" />;
}
