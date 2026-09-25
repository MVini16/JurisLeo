// hook para uma anotação individual — cria, lê, actualiza e apaga
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar } from '../services/escritas.js';
import { avisarErroEscuta } from '../services/escritas.js';

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
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, [id, nova]);

  // o id nasce no telemóvel e a escrita não espera pelo servidor: sem rede fica
  // na cache local e sobe quando a ligação voltar (esperar deixava tudo preso)
  function criar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return null;
    const ref = doc(collection(db, 'users', userId, 'anotacoes'));
    setDoc(ref, {
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    }).catch(() => {});
    return ref.id;
  }

  // idAlvo serve para a página nova, que já foi criada mas ainda está no url /nova
  function guardar(dados, idAlvo = id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId || idAlvo === 'nova') return;
    updateDoc(doc(db, 'users', userId, 'anotacoes', idAlvo), {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }).catch(() => {});
  }

  async function apagar() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'anotacoes', id)));
  }

  return { anotacao, loading: nova ? false : loading, nova, criar, guardar, apagar };
}
