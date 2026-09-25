// animações do ecrã de início com gsap — tudo respeita "reduzir movimento" e a escolha dela em definições
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export { gsap, Flip };

export function movimentoPermitido() {
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return document.documentElement.getAttribute('data-animacoes') !== 'off';
}

// pequena explosão de faíscas à volta de um elemento (ao concluir uma tarefa, por exemplo)
export function faiscas(origem) {
  if (!origem || !movimentoPermitido()) return;
  const r = origem.getBoundingClientRect();
  for (let k = 0; k < 10; k++) {
    const f = document.createElement('i');
    f.className = 'ecra-faisca';
    f.style.left = `${r.left + r.width / 2 - 3}px`;
    f.style.top = `${r.top + r.height / 2 - 3}px`;
    f.style.background = k % 2 ? 'var(--gold)' : 'var(--sucesso)';
    document.body.appendChild(f);
    const angulo = (k / 10) * Math.PI * 2;
    gsap.to(f, { x: Math.cos(angulo) * 28, y: Math.sin(angulo) * 28, opacity: 0, scale: 0.4, duration: 0.6, ease: 'power2.out', onComplete: () => f.remove() });
  }
  gsap.fromTo(origem, { scale: 1.35 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
}
