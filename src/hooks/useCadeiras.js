// hook que vai buscar a lista de cadeiras ao firestore, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { avisarErroEscuta } from '../services/escritas.js';

export function useCadeiras() {
  const [cadeiras, setCadeiras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'cadeiras');
    const unsub = onSnapshot(ref, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCadeiras(dados);
      setLoading(false);
    }, avisarErroEscuta(setLoading));

    return () => unsub();
  }, []);

  return { cadeiras, loading };
}
