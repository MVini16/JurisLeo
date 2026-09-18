// estados das aulas (fui, faltei, ...) em tempo real, e a função para os marcar
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { marcarEstadoAula } from '../services/registoFaltas.js';

export function useEstadosAula() {
  const [estados, setEstados] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'estadosAula'), (snap) => {
      const mapa = {};
      snap.docs.forEach((d) => { mapa[d.id] = { id: d.id, ...d.data() }; });
      setEstados(mapa);
    });
    return () => unsub();
  }, []);

  async function marcar(ocorrencia, estado) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    await marcarEstadoAula(userId, ocorrencia, estado);
  }

  return { estados, marcar };
}
