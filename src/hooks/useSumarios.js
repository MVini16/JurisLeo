// todos os sumários de aula, em tempo real — usado para saber se já registou algum hoje
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useSumarios() {
  const [sumarios, setSumarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'sumarios'), (snap) => {
      setSumarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { sumarios, loading };
}
