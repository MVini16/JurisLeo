// horário semanal guardado no firestore (aulasSemanais), em tempo real, com adicionar, mover e apagar
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot, setDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { calendarioS1 } from '../data/dadosLeonor.js';
import { carregarHorarioInicial } from '../services/initCalendario.js';
import { semEsperar, criarSemEsperar } from '../services/escritas.js';

export function useAulasSemanais() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'aulasSemanais'), (snap) => {
      setAulas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const uid = () => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    return userId;
  };

  // aula nova com as datas do semestre; o resto vem do formulário
  async function adicionar(dados) {
    const completa = {
      ...dados,
      dataInicio: Timestamp.fromDate(new Date(calendarioS1.inicioAulas + 'T00:00:00')),
      dataFim: Timestamp.fromDate(new Date(calendarioS1.fimAulas + 'T00:00:00')),
      contaFalta: dados.tipoAula === 'pratica',
    };
    criarSemEsperar(collection(db, 'users', uid(), 'aulasSemanais'), completa);
  }

  async function atualizar(id, dados) {
    const patch = { ...dados };
    if (dados.tipoAula) patch.contaFalta = dados.tipoAula === 'pratica';
    semEsperar(setDoc(doc(db, 'users', uid(), 'aulasSemanais', id), patch, { merge: true }));
  }

  async function apagar(id) {
    semEsperar(deleteDoc(doc(db, 'users', uid(), 'aulasSemanais', id)));
  }

  return { aulas, loading, adicionar, atualizar, apagar, carregarHorarioInicial: () => carregarHorarioInicial(uid()) };
}
