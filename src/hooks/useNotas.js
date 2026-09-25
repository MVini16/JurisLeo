// hook das notas: todas as cadeiras e os elementos de avaliação de cada uma, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar } from '../services/escritas.js';

export function useNotas() {
  const [cadeiras, setCadeiras] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'cadeiras'), (snap) => {
      setCadeiras(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // uma escuta por cadeira, refeita só se a lista de cadeiras mudar
  const chaveIds = cadeiras.map((c) => c.id).join('|');
  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !chaveIds) return;
    const unsubs = chaveIds.split('|').map((id) =>
      onSnapshot(doc(db, 'users', userId, 'cadeiras', id, 'avaliacao', 'dados'), (snap) => {
        setAvaliacoes((prev) => ({ ...prev, [id]: snap.data() || {} }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [chaveIds]);

  async function guardarNota(cadeiraId, patch) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    semEsperar(setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId, 'avaliacao', 'dados'), patch, { merge: true }));
  }

  async function guardarPesos(cadeiraId, pesos) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    semEsperar(setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId), { pesos }, { merge: true }));
  }

  return { cadeiras, avaliacoes, loading, guardarNota, guardarPesos };
}
