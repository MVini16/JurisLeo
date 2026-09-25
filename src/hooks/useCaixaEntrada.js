// caixa de entrada — ideias, dúvidas e tarefas escritas à pressa, para arrumar depois
// users/{uid}/caixaEntrada/{id}: { texto, criadoEm }
import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useCaixaEntrada() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const ref = query(collection(db, 'users', userId, 'caixaEntrada'), orderBy('criadoEm', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  function juntar(texto) {
    const userId = getAuth().currentUser?.uid;
    const limpo = String(texto ?? '').trim();
    if (!userId || !limpo) return;
    criarSemEsperar(collection(db, 'users', userId, 'caixaEntrada'), { texto: limpo, criadoEm: serverTimestamp() });
  }

  function apagar(id) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(deleteDoc(doc(db, 'users', userId, 'caixaEntrada', id)));
  }

  // passa a tarefa (sem prazo) e sai da caixa
  function passarATarefa(item) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    criarSemEsperar(collection(db, 'users', userId, 'tarefas'), {
      titulo: item.texto, cadeira: '', tipo: 'outro', prioridade: 'media', prazo: '', notas: '', concluida: false,
      criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
    });
    apagar(item.id);
  }

  return { itens, loading, juntar, apagar, passarATarefa };
}
