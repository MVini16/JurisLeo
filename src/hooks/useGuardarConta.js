// o guardião dos dados da leonor, montado uma só vez na app (App.jsx): espera que o firebase recupere a sessão,
// liga a cópia automática do que está no telemóvel, traz (uma vez) as aulas e sumários da versão antiga
// e, uma vez por dia, guarda uma cópia completa no cofre da conta
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.js';
import { guardarNoCofre } from '../services/cofreConta.js';
import { correrMigracaoAntiga } from '../services/migracaoConta.js';
import { useSincronizarLocal } from './useSincronizarLocal.js';

const ESPERA_MS = 6000; // deixa a app abrir primeiro; isto faz-se com calma, em segundo plano

export function useGuardarConta() {
  const [userId, setUserId] = useState(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUserId(u?.uid || null)), []);

  useSincronizarLocal(userId);

  useEffect(() => {
    if (!userId) return undefined;
    let feito = false;
    let aCorrer = false;
    async function tentar() {
      if (feito || aCorrer || !navigator.onLine) return;
      aCorrer = true;
      try {
        // primeiro a recuperação (que já guarda a sua própria cópia antes de mexer), depois o cofre do dia
        await correrMigracaoAntiga(userId).catch(() => {});
        await guardarNoCofre(userId);
        feito = true;
      } catch { /* sem rede ou erro: tenta outra vez quando a rede voltar */ } finally {
        aCorrer = false;
      }
    }
    const t = setTimeout(tentar, ESPERA_MS);
    window.addEventListener('online', tentar);
    return () => { clearTimeout(t); window.removeEventListener('online', tentar); };
  }, [userId]);
}
