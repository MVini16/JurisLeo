// controla se uma dica de primeira visita já foi vista, guardado no perfil
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar } from '../services/escritas.js';

export function useDicaPrimeiraVez(chave) {
  // null enquanto não sabemos ainda — só decide mostrar depois de saber ao certo
  const [vista, setVista] = useState(null);

  useEffect(() => {
    if (!chave) return;
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const unsub = onSnapshot(doc(db, 'users', userId, 'perfil', 'dados'), (snap) => {
      const vistas = snap.data()?.dicasVistas || {};
      setVista(!!vistas[chave]);
    });

    return () => unsub();
  }, [chave]);

  async function marcarVista() {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !chave) return;
    semEsperar(setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { dicasVistas: { [chave]: true } }, { merge: true }));
  }

  return { vista, marcarVista };
}
