// sumário rápido de uma aula (até três pontos), guardado por ocorrência
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { chaveData } from '../data/feriados.js';
import { semEsperar } from '../services/escritas.js';

export function useSumario(ocorrencia) {
  const [sumario, setSumario] = useState(null);
  // o id da ocorrência cujo sumário já chegou (para o formulário só abrir com os dados certos)
  const [carregadoPara, setCarregadoPara] = useState(null);
  const ocorrenciaId = ocorrencia?.ocorrenciaId;

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !ocorrenciaId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'sumarios', ocorrenciaId), (snap) => {
      setSumario(snap.exists() ? snap.data() : null);
      setCarregadoPara(ocorrenciaId);
    }, () => setCarregadoPara(ocorrenciaId));
    return () => unsub();
  }, [ocorrenciaId]);

  async function guardar(bullets) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    semEsperar(setDoc(doc(db, 'users', userId, 'sumarios', ocorrenciaId), {
      cadeiraId: ocorrencia.cadeira,
      aulaId: ocorrencia.aulaId,
      data: chaveData(ocorrencia.data),
      bullets: bullets.map((b) => b.trim()).filter(Boolean),
      atualizadoEm: serverTimestamp(),
    }, { merge: true }));
  }

  return { sumario, guardar, carregado: carregadoPara === ocorrenciaId };
}
