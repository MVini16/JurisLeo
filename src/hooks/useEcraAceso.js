// mantém o ecrã aceso enquanto `ativo` for verdade (cronómetro, modo exame, respirar, revisão)
// usa a wake lock api (no iphone, em apps instaladas desde o ios 18.4); sem ela não faz nada.
// o ios larga o bloqueio quando a app vai para segundo plano, por isso pede-se de novo ao voltar
import { useEffect } from 'react';

export function useEcraAceso(ativo) {
  useEffect(() => {
    if (!ativo || !('wakeLock' in navigator)) return undefined;
    let bloqueio = null;
    let acabou = false;

    async function pedir() {
      try {
        bloqueio = await navigator.wakeLock.request('screen');
        if (acabou) bloqueio.release().catch(() => {});
      } catch {
        // recusado (bateria fraca, por exemplo): o ecrã apaga como sempre
      }
    }
    const aoVoltar = () => { if (document.visibilityState === 'visible') pedir(); };

    pedir();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      acabou = true;
      document.removeEventListener('visibilitychange', aoVoltar);
      bloqueio?.release().catch(() => {});
    };
  }, [ativo]);
}
