// quantas das cadeiras reais dela já estão aprovadas — usa o mesmo motor de notas.js
// que a página Cadeiras usa, só para contar, sem repetir a lógica
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { estadoDaCadeira, pesosDaCadeira } from '../services/notas.js';

export function useCadeirasAprovadas() {
  const [avaliacoes, setAvaliacoes] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;

    const unsubs = cadeirasS1.map((c) =>
      onSnapshot(doc(db, 'users', userId, 'cadeiras', c.id, 'avaliacao', 'dados'), (snap) => {
        setAvaliacoes((prev) => ({ ...prev, [c.id]: snap.data() || null }));
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const aprovadas = cadeirasS1.filter((c) => {
    const avaliacaoDados = avaliacoes[c.id];
    if (!avaliacaoDados) return false;
    const resultado = estadoDaCadeira({ metodo: c.metodo, avaliacaoDados, pesos: pesosDaCadeira(c, c) }).resultado;
    return resultado?.estado === 'aprovada';
  }).length;

  return { aprovadas, total: cadeirasS1.length };
}
