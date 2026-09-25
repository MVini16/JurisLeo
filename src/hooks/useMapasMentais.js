// lista e um mapa mental individual — users/{uid}/mapasMentais, mesmo padrão de useCasos/useCaso
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';
import { avisarErroEscuta } from '../services/escritas.js';

export function useMapasMentaisLista() {
  const [mapas, setMapas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const ref = query(collection(db, 'users', userId, 'mapasMentais'), orderBy('atualizadoEm', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setMapas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, []);

  return { mapas, loading };
}

export function useMapaMental(id) {
  const novo = id === 'novo';
  const [mapa, setMapa] = useState(null);
  const [loading, setLoading] = useState(!novo);

  useEffect(() => {
    if (novo) return;
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'mapasMentais', id), (snap) => {
      setMapa(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, [id, novo]);

  async function criar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return null;
    const ref = criarSemEsperar(collection(db, 'users', userId, 'mapasMentais'), {
      nos: [],
      ligacoes: [],
      ...dados,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  }

  async function guardar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(updateDoc(doc(db, 'users', userId, 'mapasMentais', id), { ...dados, atualizadoEm: serverTimestamp() }));
  }

  async function apagar() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'mapasMentais', id)));
  }

  return { mapa, loading: novo ? false : loading, novo, criar, guardar, apagar };
}
