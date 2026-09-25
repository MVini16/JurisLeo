// hook dos flashcards — cria, lê, regista respostas (repetição espaçada) e apaga
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { calcularProximaRevisaoPorConfianca } from '../services/repeticaoEspacada.js';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';
import { avisarErroEscuta } from '../services/escritas.js';

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
    }, avisarErroEscuta(setLoading));

    return () => unsub();
  }, []);

  async function adicionar(dados) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    criarSemEsperar(collection(db, 'users', userId, 'flashcards'), {
      nivel: 0,
      facilidade: 1,
      acertos: 0,
      erros: 0,
      proximaRevisao: null,
      ...dados,
    });
  }

  async function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'flashcards', id)));
  }

  // regista uma resposta de revisão e actualiza o nível + próxima revisão
  // resposta: a confiança de 1 a 5 (ou, como antes, true/false: acertou = 4, errou = 2)
  async function registarResposta(flashcard, resposta) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const confianca = typeof resposta === 'number' ? resposta : (resposta ? 4 : 2);
    const acertou = confianca >= 3;
    const { novoNivel, novaFacilidade, proximaRevisao } = calcularProximaRevisaoPorConfianca(flashcard.nivel ?? 0, confianca, flashcard.facilidade ?? 1);
    semEsperar(updateDoc(doc(db, 'users', userId, 'flashcards', flashcard.id), {
      nivel: novoNivel,
      facilidade: novaFacilidade,
      proximaRevisao,
      ultimaConfianca: confianca,
      ultimaRevisaoEm: serverTimestamp(),
      acertos: (flashcard.acertos || 0) + (acertou ? 1 : 0),
      erros: (flashcard.erros || 0) + (acertou ? 0 : 1),
    }));
  }

  return { flashcards, loading, adicionar, apagar, registarResposta };
}
