// galeria de widgets: folha que sobe de baixo, com os widgets que ainda não estão no ecrã
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { WIDGETS } from '../../data/widgets.js';
import { gsap, movimentoPermitido } from './movimento.js';

export default function GaleriaWidgets({ ecra, onJuntar, onRepor, onFechar }) {
  const folha = useRef(null);
  const veu = useRef(null);
  const postos = new Set(ecra.widgets.map((w) => w.id));

  useGSAP(() => {
    if (!movimentoPermitido()) return;
    gsap.from(veu.current, { opacity: 0, duration: 0.25 });
    gsap.from(folha.current, { yPercent: 100, duration: 0.4, ease: 'power3.out' });
    gsap.from('.ecra-galeria__item', { y: 16, opacity: 0, duration: 0.35, stagger: 0.025, delay: 0.12, ease: 'power2.out' });
  }, { scope: folha });

  // animação de saída antes de fechar
  function fechar(depois) {
    const acabar = () => { onFechar(); depois?.(); };
    if (!movimentoPermitido()) { acabar(); return; }
    gsap.to(veu.current, { opacity: 0, duration: 0.2 });
    gsap.to(folha.current, { yPercent: 100, duration: 0.28, ease: 'power2.in', onComplete: acabar });
  }

  // escape fecha, e o foco começa dentro da folha (só ao abrir)
  const fecharRef = useRef(onFechar);
  useEffect(() => { fecharRef.current = onFechar; });
  useEffect(() => {
    folha.current?.focus();
    const tecla = (e) => { if (e.key === 'Escape') fecharRef.current(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, []);

  return (
    <>
      <div className="ecra-veu" ref={veu} onClick={() => fechar()} />
      <div className="ecra-galeria" ref={folha} role="dialog" aria-modal="true" aria-label="Adicionar widget" tabIndex={-1}>
        <div className="ecra-galeria__pega" aria-hidden="true" />
        <h2>Adicionar widget</h2>
        <p>Toca num widget para o pôr no fim do ecrã. Depois arrasta-o para onde quiseres.</p>
        <div className="ecra-galeria__lista">
          {[...WIDGETS].sort((a, b) => postos.has(a.id) - postos.has(b.id)).map((w) => {
            const posto = postos.has(w.id);
            return (
              <button key={w.id} type="button" className={`ecra-galeria__item ${posto ? 'posto' : ''}`} disabled={posto} onClick={() => fechar(() => onJuntar(w.id))}>
                <span className="ecra-galeria__icone" aria-hidden="true">{w.icone}</span>
                <span>
                  <b>{w.nome}{w.novo && <span className="ecra-novo">novo</span>}</b>
                  <small>{posto ? 'já está no ecrã' : w.descricao}</small>
                </span>
                <span className="ecra-galeria__mais" aria-hidden="true">{posto ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="ecra-galeria__repor" onClick={() => fechar(onRepor)}>Repor o ecrã inicial</button>
      </div>
    </>
  );
}
