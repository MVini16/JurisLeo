// as faltas de todas as cadeiras de uma vez, só quando é preciso (ex.: montar o resumo para o vini)
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { situacaoDaCadeira } from '../services/assiduidade.js';

export function useFaltasTodas(ativo) {
  const [dados, setDados] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!ativo || !userId) return;
    const unsubs = cadeirasS1.flatMap((c) => {
      const base = (nome) => doc(db, 'users', userId, 'cadeiras', c.id, nome, 'dados');
      return [
        onSnapshot(base('faltas'), (s) => setDados((p) => ({ ...p, [c.id]: { ...p[c.id], faltas: s.data() || null } }))),
        onSnapshot(base('presencas'), (s) => setDados((p) => ({ ...p, [c.id]: { ...p[c.id], marcas: s.data()?.marcas || {} } }))),
      ];
    });
    return () => unsubs.forEach((u) => u());
  }, [ativo]);

  // uma linha por cadeira, já calculada pelo motor de faltas
  return cadeirasS1.map((c) => {
    const { efetivas, resultado } = situacaoDaCadeira(c, dados[c.id]?.faltas, dados[c.id]?.marcas);
    return {
      cadeiraId: c.id,
      abrev: c.abrev,
      dadas: efetivas.aulasPraticasLecionadas,
      injustificadas: efetivas.faltasInjustificadas,
      justificadas: efetivas.faltasJustificadas,
      semaforo: resultado?.semaforo ?? 'verde',
      excluida: !!resultado?.excluida,
    };
  });
}
