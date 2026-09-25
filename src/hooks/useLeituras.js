// hook do progresso de leitura dos manuais
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useLeituras() {
  const [leituras, setLeituras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'leituras');
    const unsub = onSnapshot(ref, (snap) => {
      setLeituras(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function adicionar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    criarSemEsperar(collection(db, 'users', userId, 'leituras'), { capitulos: [], paginaAtual: 0, ...dados });
  }

  async function atualizar(id, dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'leituras', id), dados));
  }

  async function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'leituras', id)));
  }

  return { leituras, loading, adicionar, atualizar, apagar };
}
