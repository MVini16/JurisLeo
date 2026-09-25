// fichas de um tipo (jurisprudência, erros, contactos...) — users/{uid}/fichas, com o campo tipo
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, where, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ordenarFichas, limparFicha } from '../services/fichas.js';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useFichas(tipoId) {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(() => !!getAuth().currentUser);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    // um só filtro: não precisa de índice composto
    const ref = query(collection(db, 'users', userId, 'fichas'), where('tipo', '==', tipoId));
    const unsub = onSnapshot(ref, (snap) => {
      setFichas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [tipoId]);

  const ordenadas = useMemo(() => ordenarFichas(fichas), [fichas]);

  const adicionar = useCallback(async (dados) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    criarSemEsperar(collection(db, 'users', userId, 'fichas'), {
      ...limparFicha(tipoId, dados),
      tipo: tipoId,
      criadaEm: serverTimestamp(),
      atualizadaEm: serverTimestamp(),
    });
  }, [tipoId]);

  const atualizar = useCallback(async (id, dados) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'fichas', id), { ...limparFicha(tipoId, dados), atualizadaEm: serverTimestamp() }));
  }, [tipoId]);

  const apagar = useCallback(async (id) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'fichas', id)));
  }, []);

  return { fichas: ordenadas, loading, adicionar, atualizar, apagar };
}
