// os dados do perfil da utilizadora (curso, ano, turma...), em tempo real
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';

export function usePerfil() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return undefined;
    const unsub = onSnapshot(doc(db, 'users', userId, 'perfil', 'dados'), (snap) => setPerfil(snap.data() || null));
    return () => unsub();
  }, []);

  return { perfil };
}
