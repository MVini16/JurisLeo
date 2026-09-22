// guarda quais pontos da checklist do modo frequência já foram revistos, por cadeira —
// segue o padrão de documento único "dados" já usado no resto do firestore
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useRevisaoFrequencia(cadeiraId) {
  const [marcados, setMarcados] = useState([]);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !cadeiraId) return;

    const ref = doc(db, 'users', userId, 'cadeiras', cadeiraId, 'revisaoFrequencia', 'dados');
    const unsub = onSnapshot(ref, (snap) => {
      setMarcados(snap.exists() ? snap.data().marcados || [] : []);
    });

    return () => unsub();
  }, [cadeiraId]);

  async function alternar(chave) {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !cadeiraId) return;
    const novosMarcados = marcados.includes(chave)
      ? marcados.filter((c) => c !== chave)
      : [...marcados, chave];
    setMarcados(novosMarcados); // otimista — a app sente-se instantânea
    await setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId, 'revisaoFrequencia', 'dados'), { marcados: novosMarcados });
  }

  return { marcados, alternar };
}
