// diz se o ecrã tem pelo menos `minPx` de largura (acompanha o redimensionar da janela)
import { useSyncExternalStore } from 'react';

export function useLargura(minPx) {
  const consulta = `(min-width: ${minPx}px)`;
  const subscrever = (cb) => {
    const mq = window.matchMedia(consulta);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
  return useSyncExternalStore(subscrever, () => window.matchMedia(consulta).matches, () => false);
}
