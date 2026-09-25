// registo individual de faltas, em tempo real, com as ações de o editar
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { registarFaltaSolta, atualizarFalta, apagarFalta, corrigirLecionadas } from '../services/registoFaltas.js';
import { avisarErroEscuta } from '../services/escritas.js';

export function useFaltasRegisto() {
  const [registos, setRegistos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'faltasRegisto'), (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // mais recentes primeiro
      lista.sort((a, b) => b.data.localeCompare(a.data));
      setRegistos(lista);
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, []);

  const uid = () => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    return userId;
  };

  return {
    registos,
    loading,
    registarSolta: (dados) => registarFaltaSolta(uid(), dados),
    atualizar: (registo, patch) => atualizarFalta(uid(), registo, patch),
    apagar: (registo) => apagarFalta(uid(), registo),
    corrigirLecionadas: (cadeiraId, valor) => corrigirLecionadas(uid(), cadeiraId, valor),
  };
}
