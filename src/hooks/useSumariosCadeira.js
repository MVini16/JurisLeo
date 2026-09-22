// todos os sumários de aula de uma cadeira, em tempo real — usado pelo modo frequência
// para montar a checklist da matéria dada
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useSumariosCadeira(cadeiraId) {
  const [sumarios, setSumarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !cadeiraId) return;

    const ref = query(collection(db, 'users', userId, 'sumarios'), where('cadeiraId', '==', cadeiraId));
    const unsub = onSnapshot(ref, (snap) => {
      setSumarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [cadeiraId]);

  return { sumarios, loading };
}
