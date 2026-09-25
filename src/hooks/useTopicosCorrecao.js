// lista e um item de comparação com tópicos de correção — users/{uid}/topicosCorrecao
// mesmo padrão de useCasos/useCaso: um hook para a lista, outro para um item
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';
import { avisarErroEscuta } from '../services/escritas.js';

export function useTopicosCorrecaoLista() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const ref = query(collection(db, 'users', userId, 'topicosCorrecao'), orderBy('atualizadoEm', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, []);

  return { itens, loading };
}

export function useTopicosCorrecao(id) {
  const novo = id === 'novo';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(!novo);

  useEffect(() => {
    if (novo) return;
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'topicosCorrecao', id), (snap) => {
      setItem(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, [id, novo]);

  async function criar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return null;
    const ref = criarSemEsperar(collection(db, 'users', userId, 'topicosCorrecao'), {
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  }

  async function guardar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'topicosCorrecao', id), { ...dados, atualizadoEm: serverTimestamp() }));
  }

  async function apagar() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'topicosCorrecao', id)));
  }

  return { item, loading: novo ? false : loading, novo, criar, guardar, apagar };
}
