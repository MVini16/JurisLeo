// sumário rápido de uma aula (até três pontos), guardado por ocorrência
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { chaveData } from '../data/feriados.js';

export function useSumario(ocorrencia) {
  const [sumario, setSumario] = useState(null);
  const ocorrenciaId = ocorrencia?.ocorrenciaId;

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !ocorrenciaId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'sumarios', ocorrenciaId), (snap) => {
      setSumario(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [ocorrenciaId]);

  async function guardar(bullets) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    await setDoc(doc(db, 'users', userId, 'sumarios', ocorrenciaId), {
      cadeiraId: ocorrencia.cadeira,
      aulaId: ocorrencia.aulaId,
      data: chaveData(ocorrencia.data),
      bullets: bullets.map((b) => b.trim()).filter(Boolean),
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
  }

  return { sumario, guardar };
}
