// os eventos do calendário (provas, entregas, compromissos), sem as aulas — para quem só
// precisa de saber que provas vêm aí (ex.: a passagem final dos flashcards)
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { avisarErroEscuta } from '../services/escritas.js';

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'eventos'), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, avisarErroEscuta(setLoading));
    return () => unsub();
  }, []);

  return { eventos, loading };
}
