// hook que vai buscar uma cadeira e os seus dados de faltas/avaliação, em tempo real
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { semEsperar } from '../services/escritas.js';

export function useCadeira(cadeiraId) {
  const [cadeira, setCadeira] = useState(null);
  const [faltasDados, setFaltasDados] = useState(null);
  const [avaliacaoDados, setAvaliacaoDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId || !cadeiraId) return;

    const cadeiraRef = doc(db, 'users', userId, 'cadeiras', cadeiraId);
    const faltasRef = doc(cadeiraRef, 'faltas', 'dados');
    const avaliacaoRef = doc(cadeiraRef, 'avaliacao', 'dados');

    const unsubCadeira = onSnapshot(cadeiraRef, (snap) => {
      setCadeira(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    const unsubFaltas = onSnapshot(faltasRef, (snap) => setFaltasDados(snap.data() || null));
    const unsubAvaliacao = onSnapshot(avaliacaoRef, (snap) => setAvaliacaoDados(snap.data() || null));

    return () => {
      unsubCadeira();
      unsubFaltas();
      unsubAvaliacao();
    };
  }, [cadeiraId]);

  async function guardarFaltas(patch) {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    semEsperar(setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId, 'faltas', 'dados'), patch, { merge: true }));
  }

  async function guardarAvaliacao(patch) {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    semEsperar(setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId, 'avaliacao', 'dados'), patch, { merge: true }));
  }

  return { cadeira, faltasDados, avaliacaoDados, loading, guardarFaltas, guardarAvaliacao };
}
