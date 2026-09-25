// hook dos artigos de código guardados como referência pessoal
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useArtigos() {
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'artigos');
    const unsub = onSnapshot(ref, (snap) => {
      setArtigos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function adicionar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    criarSemEsperar(collection(db, 'users', userId, 'artigos'), dados);
  }

  async function atualizar(id, dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'artigos', id), dados));
  }

  async function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'artigos', id)));
  }

  return { artigos, loading, adicionar, atualizar, apagar };
}
