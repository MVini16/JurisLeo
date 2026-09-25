// hook que vai buscar todas as anotações ao firestore, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { avisarErroEscuta } from '../services/escritas.js';

export function useAnotacoes() {
  const [anotacoes, setAnotacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = query(collection(db, 'users', userId, 'anotacoes'), orderBy('atualizadoEm', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAnotacoes(dados);
      setLoading(false);
    }, avisarErroEscuta(setLoading));

    return () => unsub();
  }, []);

  return { anotacoes, loading };
}
