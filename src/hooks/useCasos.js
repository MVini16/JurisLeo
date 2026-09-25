// hook que vai buscar todos os casos práticos ao firestore, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { avisarErroEscuta } from '../services/escritas.js';

export function useCasos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = query(collection(db, 'users', userId, 'casos'), orderBy('atualizadoEm', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setCasos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, avisarErroEscuta(setLoading));

    return () => unsub();
  }, []);

  return { casos, loading };
}
