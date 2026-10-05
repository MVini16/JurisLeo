// hook que junta o estado de faltas de todas as cadeiras, para avisar no dashboard
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { estadoFaltas } from '../services/faltas.js';

export function useAvisosFaltas() {
  const [cadeiras, setCadeiras] = useState([]);
  const [faltas, setFaltas] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    let unsubsFaltas = [];

    // sempre que a lista de cadeiras muda, volta a ligar um listener de faltas por cadeira
    const unsubCadeiras = onSnapshot(collection(db, 'users', userId, 'cadeiras'), (snap) => {
      unsubsFaltas.forEach((u) => u());
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCadeiras(lista);
      unsubsFaltas = lista.map((c) =>
        onSnapshot(doc(db, 'users', userId, 'cadeiras', c.id, 'faltas', 'dados'), (s) => {
          setFaltas((prev) => ({ ...prev, [c.id]: s.data() || null }));
        })
      );
    });

    return () => {
      unsubCadeiras();
      unsubsFaltas.forEach((u) => u());
    };
  }, []);

  // só interessam as cadeiras em amarelo ou vermelho
  const avisos = cadeiras
    .filter((c) => c.aulasPraticasPrevistas && faltas[c.id])
    .map((c) => ({
      cadeira: c,
      estado: estadoFaltas({
        aulasPraticasPrevistas: c.aulasPraticasPrevistas,
        aulasPraticasLecionadas: faltas[c.id].aulasPraticasLecionadas || 0,
        faltasInjustificadas: faltas[c.id].faltasInjustificadas || 0,
        faltasJustificadas: faltas[c.id].faltasJustificadas || 0,
      }),
    }))
    .filter((a) => a.estado.semaforo !== 'verde');

  return avisos;
}
