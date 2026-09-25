// hook para um caso prático individual — cria, lê, actualiza e apaga
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useCaso(id) {
  const novo = id === 'novo';
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(!novo);

  useEffect(() => {
    if (novo) return;
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsub = onSnapshot(doc(db, 'users', userId, 'casos', id), (snap) => {
      setCaso(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [id, novo]);

  async function criar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return null;
    const ref = criarSemEsperar(collection(db, 'users', userId, 'casos'), {
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  }

  async function guardar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'casos', id), {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }));
  }

  async function apagar() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'casos', id)));
  }

  return { caso, loading: novo ? false : loading, novo, criar, guardar, apagar };
}
