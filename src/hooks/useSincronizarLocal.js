// mantém as escolhas e o progresso que vivem no telemóvel também guardados na conta dela, para nunca se perderem
// (nova versão da app, app reinstalada, outro telemóvel). usa o documento configuracoes/dados que já existe.
// ao abrir: traz da nuvem o que for mais recente. depois, de tempos a tempos e ao sair da app: envia o que mudou
import { useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { atualizarMeta, aplicarDaNuvem, guardarMeta, lerMeta, planear } from '../services/sincronizarLocal.js';
import { avisarMudancaDePreferencias } from '../services/preferenciasBrincadeiras.js';

const INTERVALO_MS = 20000;
const FLAG_RECARREGADO = 'jurisleo-sync-recarregado';

export function useSincronizarLocal() {
  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || typeof localStorage === 'undefined') return undefined;
    const ref = doc(db, 'users', userId, 'configuracoes', 'dados');
    let parado = false;
    let aEnviar = false;
    let arrancou = false;

    async function enviarAlteracoes() {
      if (aEnviar || !arrancou) return;
      aEnviar = true;
      try {
        let meta = atualizarMeta(localStorage, lerMeta(localStorage), Date.now());
        const snap = await getDoc(ref);
        const { enviar } = planear(localStorage, meta, snap.data()?.copiaLocal || {});
        guardarMeta(localStorage, meta);
        if (Object.keys(enviar).length > 0) {
          await setDoc(ref, { copiaLocal: enviar }, { merge: true });
        }
      } catch { /* sem rede: tenta outra vez mais tarde */ } finally {
        aEnviar = false;
      }
    }

    async function arrancar() {
      try {
        const snap = await getDoc(ref);
        if (parado) return;
        let meta = atualizarMeta(localStorage, lerMeta(localStorage), Date.now());
        const { aplicar, enviar } = planear(localStorage, meta, snap.data()?.copiaLocal || {});
        const chavesAplicadas = Object.keys(aplicar);
        meta = aplicarDaNuvem(localStorage, meta, aplicar);
        guardarMeta(localStorage, meta);
        if (chavesAplicadas.length > 0) {
          avisarMudancaDePreferencias();
          // o resto das páginas lê o armazenamento ao abrir: recarrega uma vez por sessão para ver o que veio da conta
          let jaRecarregou = false;
          try { jaRecarregou = sessionStorage.getItem(FLAG_RECARREGADO) === '1'; sessionStorage.setItem(FLAG_RECARREGADO, '1'); } catch { jaRecarregou = true; }
          if (!jaRecarregou && chavesAplicadas.some((c) => c !== 'jurisleo-brincadeiras')) window.location.reload();
        }
        if (Object.keys(enviar).length > 0) await setDoc(ref, { copiaLocal: enviar }, { merge: true });
      } catch { /* sem rede: fica para a próxima */ }
      arrancou = true;
    }

    arrancar();
    const relogio = setInterval(enviarAlteracoes, INTERVALO_MS);
    const aoEsconder = () => { if (document.visibilityState === 'hidden') enviarAlteracoes(); };
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('pagehide', enviarAlteracoes);
    return () => {
      parado = true;
      clearInterval(relogio);
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('pagehide', enviarAlteracoes);
    };
  }, []);
}
