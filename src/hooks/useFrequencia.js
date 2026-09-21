// a próxima prova dela e a checklist da matéria dessa prova
// eventos em users/{uid}/eventos; checklist em users/{uid}/frequencias/{eventoId}.topicos
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../services/firebase.js';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { proximaProva } from '../services/provas.js';

export function useFrequencia() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(() => !!getAuth().currentUser);
  const [topicosGuardados, setTopicosGuardados] = useState({ id: null, topicos: [] });

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return undefined;
    const unsub = onSnapshot(collection(db, 'users', userId, 'eventos'), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const prova = useMemo(() => proximaProva(eventos), [eventos]);
  const provaId = prova?.id || null;

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !provaId) return undefined;
    const unsub = onSnapshot(doc(db, 'users', userId, 'frequencias', provaId), (snap) => {
      setTopicosGuardados({ id: provaId, topicos: snap.data()?.topicos || [] });
    });
    return () => unsub();
  }, [provaId]);

  // só valem os tópicos do evento atual (evita mostrar os da prova anterior por um instante)
  const topicos = topicosGuardados.id === provaId ? topicosGuardados.topicos : [];

  const guardarTopicos = useCallback(async (novos) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !provaId) return;
    await setDoc(doc(db, 'users', userId, 'frequencias', provaId), { topicos: novos }, { merge: true });
  }, [provaId]);

  return { prova, topicos, loading, guardarTopicos };
}
