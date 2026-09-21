// sessões de estudo dos últimos dias, para o perfil (mapa de calor, sequência, horas por cadeira)
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useHistoricoEstudo(dias = 90) {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(() => !!getAuth().currentUser);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    desde.setHours(0, 0, 0, 0);

    // um só filtro por data: não precisa de índice composto
    const ref = query(collection(db, 'users', userId, 'sessoesEstudo'), where('inicio', '>=', Timestamp.fromDate(desde)));
    const unsub = onSnapshot(ref, (snap) => {
      setSessoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [dias]);

  return { sessoes, loading };
}
