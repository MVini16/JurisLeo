// hook que vai buscar tarefas do firestore em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { avisarErroEscuta } from '../services/escritas.js';

export function useTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'tarefas');
    const unsub = onSnapshot(ref, (snap) => {
      const dados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTarefas(dados);
      setLoading(false);
    }, avisarErroEscuta(setLoading));

    return () => unsub();
  }, []);

  return { tarefas, loading };
}
