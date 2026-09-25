// hook que vai buscar todos os dados do dashboard ao firestore
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { gerarOcorrencias, comEstados } from '../services/ocorrencias.js';
import { proximaFrequencia as calcularProximaFrequencia, diasRestantes } from '../services/frequencia.js';
import { useEstadosAula } from './useEstadosAula.js';
import { semEsperar } from '../services/escritas.js';
import { avisarErroEscuta } from '../services/escritas.js';

export function useDashboard() {
  const { estados, marcar } = useEstadosAula();
  const [nome, setNome] = useState('Leonor'); // fallback enquanto carrega
  const [eventos, setEventos] = useState([]);
  const [aulasSemanais, setAulasSemanais] = useState([]);
  const [loading, setLoading] = useState(true);
  // null enquanto não sabemos ainda — só decide mostrar o tutorial depois de saber ao certo
  const [tutorialFeito, setTutorialFeito] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // vai buscar o perfil em tempo real
    const refPerfil = doc(db, 'users', userId, 'perfil', 'dados');
    const unsubPerfil = onSnapshot(refPerfil, (snap) => {
      const dados = snap.data();
      // usa o nome do firestore, ou 'Leonor' como fallback se estiver vazio
      if (dados?.nome && dados.nome.trim() !== '') {
        setNome(dados.nome.trim());
      } else {
        setNome('Leonor');
      }
      setTutorialFeito(!!dados?.tutorialFeito);
    });

    // vai buscar eventos únicos em tempo real
    const refEventos = collection(db, 'users', userId, 'eventos');
    const unsubEventos = onSnapshot(refEventos, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEventos(dados);
    });

    // vai buscar aulas semanais em tempo real
    const refAulas = collection(db, 'users', userId, 'aulasSemanais');
    const unsubAulas = onSnapshot(refAulas, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAulasSemanais(dados);
      setLoading(false);
    }, avisarErroEscuta(setLoading));

    return () => {
      unsubPerfil();
      unsubEventos();
      unsubAulas();
    };
  }, []);

  // junta todos os eventos: as aulas vêm das ocorrências partilhadas (sem feriados) com o estado marcado
  const todosEventos = [
    ...eventos,
    ...comEstados(aulasSemanais.flatMap((a) => gerarOcorrencias(a)), estados),
  ];

  const hoje = new Date();

  // filtra as aulas de hoje — tipo 'aula' e mesmo dia
  const aulasHoje = todosEventos
    .filter((ev) => {
      if (ev.tipo !== 'aula') return false;
      const d = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
      if (!d) return false;
      return (
        d.getDate() === hoje.getDate() &&
        d.getMonth() === hoje.getMonth() &&
        d.getFullYear() === hoje.getFullYear()
      );
    })
    .sort((a, b) => a.horaInicio?.localeCompare(b.horaInicio));

  // encontra a próxima frequência — evento do tipo 'frequencia' no futuro mais próximo
  const proximaFrequencia = calcularProximaFrequencia(todosEventos, hoje);

  // calcula os dias que faltam para a próxima frequência
  let diasParaFrequencia = null;
  let dataFrequenciaFormatada = null;

  if (proximaFrequencia) {
    diasParaFrequencia = diasRestantes(proximaFrequencia.data, hoje);

    // formata a data em português — ex: "14 de Maio"
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    dataFrequenciaFormatada = `${proximaFrequencia.data.getDate()} de ${meses[proximaFrequencia.data.getMonth()]}`;
  }

  // marca o tutorial como visto (ou por ver, se quiser rever) no firestore
  async function definirTutorialFeito(valor) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    semEsperar(setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { tutorialFeito: valor }, { merge: true }));
  }

  return {
    nome,
    eventos: todosEventos,
    aulasHoje,
    proximaFrequencia,
    diasParaFrequencia,
    dataFrequenciaFormatada,
    loading,
    tutorialFeito,
    definirTutorialFeito,
    marcarAula: marcar,
  };
}