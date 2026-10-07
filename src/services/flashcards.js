// cria um flashcard novo (mesma coleção e mesmos campos que a página de flashcards usa) — serve ao hook e às notas
import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function criarFlashcard(dados) {
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
