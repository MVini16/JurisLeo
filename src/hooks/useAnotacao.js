// hook para uma anotação individual — cria, lê, actualiza e apaga
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, addDoc, updateDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useAnotacao(id) {
  const nova = id === 'nova';
  const [anotacao, setAnotacao] = useState(null);
  const [loading, setLoading] = useState(!nova);

  useEffect(() => {
    if (nova) return;
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsub = onSnapshot(doc(db, 'users', userId, 'anotacoes', id), (snap) => {
      setAnotacao(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [id, nova]);

  async function criar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return null;
    const ref = await addDoc(collection(db, 'users', userId, 'anotacoes'), {
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  }

  async function guardar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'anotacoes', id), {
      ...dados,
      atualizadoEm: serverTimestamp(),
    });
  }

  async function apagar() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'anotacoes', id));
  }

  return { anotacao, loading: nova ? false : loading, nova, criar, guardar, apagar };
}
