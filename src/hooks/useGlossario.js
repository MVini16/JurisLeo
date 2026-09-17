// hook do glossário de termos jurídicos
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useGlossario() {
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = query(collection(db, 'users', userId, 'glossario'), orderBy('termo'));
    const unsub = onSnapshot(ref, (snap) => {
      setTermos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function adicionar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'glossario'), { dominado: false, ...dados });
  }

  async function atualizar(id, dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'glossario', id), dados);
  }

  async function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'glossario', id));
  }

  return { termos, loading, adicionar, atualizar, apagar };
}
