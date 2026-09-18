// hook personalizado que vai buscar os dados do calendário ao firestore
// junta eventos únicos com as ocorrências das aulas semanais (com o estado marcado: fui, faltei...)
import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { gerarOcorrencias, comEstados } from '../services/ocorrencias.js';
import { useEstadosAula } from './useEstadosAula.js';

export function useCalendario() {
  const [eventos, setEventos] = useState([]);
  const [aulasSemanais, setAulasSemanais] = useState([]);
  const [loading, setLoading] = useState(true);
  const { estados, marcar } = useEstadosAula();

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    // se não houver utilizador logado não faz nada
    if (!userId) return;

    // vai buscar os eventos únicos em tempo real
    const refEventos = collection(db, 'users', userId, 'eventos');
    const unsubEventos = onSnapshot(refEventos, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEventos(dados);
    });

    // vai buscar as aulas semanais em tempo real
    const refAulas = collection(db, 'users', userId, 'aulasSemanais');
    const unsubAulas = onSnapshot(refAulas, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAulasSemanais(dados);
      setLoading(false);
    });

    // quando o componente é desmontado, para de ouvir o firestore
    return () => {
      unsubEventos();
      unsubAulas();
    };
  }, []);

  const todosEventos = useMemo(() => {
    const unicos = eventos.map((ev) => ({ ...ev, chave: ev.id }));
    const aulas = comEstados(aulasSemanais.flatMap((a) => gerarOcorrencias(a)), estados)
      .map((o) => ({ ...o, chave: o.ocorrenciaId }));
    return [...unicos, ...aulas];
  }, [eventos, aulasSemanais, estados]);

  return { eventos: todosEventos, loading, marcar };
}
