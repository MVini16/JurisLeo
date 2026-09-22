// espera pela primeira resposta do firebase auth sobre a sessão guardada.
// a sessão fica em indexeddb e a leitura é assíncrona: nos primeiros instantes
// depois de abrir a app (sobretudo num arranque a frio da pwa, direto numa
// página como /calendario), getAuth().currentUser ainda está a null mesmo
// que ela tenha sessão — e os hooks de dados, que só correm uma vez ao montar,
// ficam presos a pensar que não há ninguém com sessão, sem tentar de novo
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function useAuthPronto() {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), () => setPronto(true));
    return () => unsub();
  }, []);

  return pronto;
}
