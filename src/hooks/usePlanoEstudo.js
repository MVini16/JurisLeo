// eventos (para as próximas provas) e as escolhas dela sobre o plano da semana —
// users/{uid}/planoEstudo/dados, um documento com { [chaveDoDia]: { estado, cadeiraId } }
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function usePlanoEstudo() {
  const [eventos, setEventos] = useState([]);
  const [escolhas, setEscolhas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const unsubEventos = onSnapshot(collection(db, 'users', userId, 'eventos'), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubEscolhas = onSnapshot(doc(db, 'users', userId, 'planoEstudo', 'dados'), (snap) => {
      setEscolhas(snap.data() || {});
    });

    return () => {
      unsubEventos();
      unsubEscolhas();
    };
  }, []);

  async function guardarEscolha(chaveDoDia, escolha) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'planoEstudo', 'dados'), { [chaveDoDia]: escolha }, { merge: true });
  }

  return { eventos, escolhas, loading, guardarEscolha };
}
