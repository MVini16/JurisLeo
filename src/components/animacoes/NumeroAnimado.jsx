// um número que conta de 0 até ao valor; se ela desligou as animações, aparece logo
import { useEffect, useState } from 'react';

function semAnimacao() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.getAttribute('data-animacoes') === 'off';
}

export default function NumeroAnimado({ valor, duracao = 700 }) {
  const [mostrado, setMostrado] = useState(() => (semAnimacao() ? valor : 0));

  useEffect(() => {
    if (semAnimacao()) {
      const t = setTimeout(() => setMostrado(valor), 0);
      return () => clearTimeout(t);
    }
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - (1 - t) ** 3;
      setMostrado(Math.round(valor * suave));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, duracao]);

  return <span className="numero-animado">{mostrado}</span>;
}
