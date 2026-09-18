// hook das faltas: todas as cadeiras e os contadores de faltas de cada uma, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useFaltas() {
  const [cadeiras, setCadeiras] = useState([]);
  const [faltasDados, setFaltasDados] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'cadeiras'), (snap) => {
      setCadeiras(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // uma escuta por cadeira, refeita só se a lista de cadeiras mudar
  const chaveIds = cadeiras.map((c) => c.id).join('|');
  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !chaveIds) return;
    const unsubs = chaveIds.split('|').map((id) =>
      onSnapshot(doc(db, 'users', userId, 'cadeiras', id, 'faltas', 'dados'), (snap) => {
        setFaltasDados((prev) => ({ ...prev, [id]: snap.data() || {} }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [chaveIds]);

  return { cadeiras, faltasDados, loading };
}
