// hook que vai buscar todos os dados do dashboard ao firestore
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function useDashboard() {
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
    });

    return () => {
      unsubPerfil();
      unsubEventos();
      unsubAulas();
    };
  }, []);

  // gera as ocorrências das aulas semanais (igual ao useCalendario)
  function gerarOcorrencias(aula) {
    const ocorrencias = [];
    const inicio = aula.dataInicio?.toDate?.();
    const fim = aula.dataFim?.toDate?.();
    if (!inicio || !fim) return ocorrencias;

    const atual = new Date(inicio);
    while (atual.getDay() !== aula.diaSemana) {
      atual.setDate(atual.getDate() + 1);
    }
    while (atual <= fim) {
      ocorrencias.push({
        id: `${aula.id}-${atual.toISOString()}`,
        titulo: aula.titulo,
        data: new Date(atual),
        horaInicio: aula.horaInicio,
        horaFim: aula.horaFim,
        cadeira: aula.cadeira,
        tipo: 'aula',
      });
      atual.setDate(atual.getDate() + 7);
    }
    return ocorrencias;
  }

  // junta todos os eventos
  const todosEventos = [
    ...eventos,
    ...aulasSemanais.flatMap(gerarOcorrencias),
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
  const proximaFrequencia = todosEventos
    .filter((ev) => {
      if (ev.tipo !== 'frequencia') return false;
      const d = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
      if (!d) return false;
      return d >= hoje;
    })
    .sort((a, b) => {
      const da = a.data instanceof Date ? a.data : a.data?.toDate?.();
      const db_ = b.data instanceof Date ? b.data : b.data?.toDate?.();
      return da - db_;
    })[0] || null; // pega o mais próximo, ou null se não houver

  // calcula os dias que faltam para a próxima frequência
  let diasParaFrequencia = null;
  let dataFrequenciaFormatada = null;

  if (proximaFrequencia) {
    const dataFreq = proximaFrequencia.data instanceof Date
      ? proximaFrequencia.data
      : proximaFrequencia.data?.toDate?.();

    if (dataFreq) {
      // diferença em dias (arredondada para cima)
      const diff = dataFreq - hoje;
      diasParaFrequencia = Math.ceil(diff / (1000 * 60 * 60 * 24));

      // formata a data em português — ex: "14 de Maio"
      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      dataFrequenciaFormatada = `${dataFreq.getDate()} de ${meses[dataFreq.getMonth()]}`;
    }
  }

  // marca o tutorial como visto (ou por ver, se quiser rever) no firestore
  async function definirTutorialFeito(valor) {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'perfil', 'dados'), { tutorialFeito: valor }, { merge: true });
  }

  return {
    nome,
    aulasHoje,
    proximaFrequencia,
    diasParaFrequencia,
    dataFrequenciaFormatada,
    loading,
    tutorialFeito,
    definirTutorialFeito,
  };
}