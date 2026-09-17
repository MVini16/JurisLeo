// hook dos flashcards — cria, lê, regista respostas (repetição espaçada) e apaga
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { calcularProximaRevisao } from '../services/repeticaoEspacada.js';

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = collection(db, 'users', userId, 'flashcards');
    const unsub = onSnapshot(ref, (snap) => {
      setFlashcards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function adicionar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'flashcards'), {
      nivel: 0,
      acertos: 0,
      erros: 0,
      proximaRevisao: null,
      ...dados,
    });
  }

  async function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'flashcards', id));
  }

  // regista uma resposta de revisão e actualiza o nível + próxima revisão
  async function registarResposta(flashcard, acertou) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const { novoNivel, proximaRevisao } = calcularProximaRevisao(flashcard.nivel ?? 0, acertou);
    await updateDoc(doc(db, 'users', userId, 'flashcards', flashcard.id), {
      nivel: novoNivel,
      proximaRevisao,
      acertos: (flashcard.acertos || 0) + (acertou ? 1 : 0),
      erros: (flashcard.erros || 0) + (acertou ? 0 : 1),
    });
  }

  return { flashcards, loading, adicionar, apagar, registarResposta };
}
