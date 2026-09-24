// palavras que a revisão de texto não deve marcar como erro:
// - as que ela disse que estão certas (configuracoes/dados.palavrasConhecidas, no firestore para valer em
//   qualquer aparelho)
// - as palavras dos termos do glossário dela (o latim jurídico, sobretudo)
// ativo = false não abre listeners: o botão "rever texto" está em muitos campos e só liga isto no primeiro toque
import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, collection, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { normalizarPalavra, palavrasDosTermos } from '../services/apis/languagetool.js';
import { CAMPO_PALAVRAS_CONHECIDAS } from '../data/languagetool.js';

export function usePalavrasConhecidas(ativo = true) {
  const [marcadas, setMarcadas] = useState([]);
  const [termos, setTermos] = useState([]);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!ativo || !userId) return;
    const unsubConfig = onSnapshot(doc(db, 'users', userId, 'configuracoes', 'dados'), (snap) => {
      const lista = snap.data()?.[CAMPO_PALAVRAS_CONHECIDAS];
      setMarcadas(Array.isArray(lista) ? lista : []);
    });
    const unsubGlossario = onSnapshot(collection(db, 'users', userId, 'glossario'), (snap) => {
      setTermos(snap.docs.map((d) => d.data().termo));
    });
    return () => {
      unsubConfig();
      unsubGlossario();
    };
  }, [ativo]);

  const conhecidas = useMemo(() => [...marcadas, ...palavrasDosTermos(termos)], [marcadas, termos]);

  // guarda já normalizada (minúsculas, sem pontuação à volta); arrayUnion não repete
  const adicionar = useCallback((palavra) => {
    const userId = getAuth().currentUser?.uid;
    const limpa = normalizarPalavra(palavra);
    if (!userId || !limpa) return Promise.resolve();
    // desaparece logo da lista, sem esperar pela volta do firestore
    setMarcadas((atuais) => (atuais.includes(limpa) ? atuais : [...atuais, limpa]));
    return setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), { [CAMPO_PALAVRAS_CONHECIDAS]: arrayUnion(limpa) }, { merge: true });
  }, []);

  return { conhecidas, adicionar };
}
