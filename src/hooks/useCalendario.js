// hook personalizado que vai buscar os dados do calendário ao firestore
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useCalendario() {
  const [eventos, setEventos] = useState([]);
  const [aulasSemanais, setAulasSemanais] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // gera as ocorrências das aulas semanais entre dataInicio e dataFim
  function gerarOcorrencias(aula) {
    const ocorrencias = [];
    const inicio = aula.dataInicio.toDate();
    const fim = aula.dataFim.toDate();
    const atual = new Date(inicio);

    // avança até ao primeiro dia da semana correto
    while (atual.getDay() !== aula.diaSemana) {
      atual.setDate(atual.getDate() + 1);
    }

    // gera uma ocorrência para cada semana até ao fim do semestre
    while (atual <= fim) {
      ocorrencias.push({
        id: `${aula.id}-${atual.toISOString()}`,
        titulo: aula.titulo,
        data: new Date(atual),
        horaInicio: aula.horaInicio,
        horaFim: aula.horaFim,
        cadeira: aula.cadeira,
        sala: aula.sala,
        tipo: 'aula',
        contaFalta: aula.contaFalta,
        repetido: true,
      });
      // avança 7 dias para a semana seguinte
      atual.setDate(atual.getDate() + 7);
    }

    return ocorrencias;
  }

  // junta eventos únicos com ocorrências das aulas semanais
  const todosEventos = [
    ...eventos,
    ...aulasSemanais.flatMap(gerarOcorrencias),
  ];

  return { eventos: todosEventos, loading };
}