// hook que regista e lista sessões de estudo
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, addDoc, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useSessoesEstudo() {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = query(collection(db, 'users', userId, 'sessoesEstudo'), orderBy('inicio', 'desc'), limit(20));
    const unsub = onSnapshot(ref, (snap) => {
      setSessoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function registarSessao({ cadeiraId, inicio, fim, minutos, pausasFeitas }) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'sessoesEstudo'), {
      cadeiraId: cadeiraId || null,
      inicio: Timestamp.fromDate(inicio),
      fim: Timestamp.fromDate(fim),
      minutos,
      pausasFeitas,
    });
  }

  return { sessoes, loading, registarSessao };
}
