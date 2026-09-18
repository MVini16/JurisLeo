// inicializa o calendário do utilizador no firestore com o horário real do 1.º semestre

import { db } from './firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { horarioS1, temposLetivos, calendarioS1, abrevCadeiras } from '../data/dadosLeonor.js';

const INICIO_AULAS = new Date(calendarioS1.inicioAulas + 'T00:00:00');
const FIM_AULAS = new Date(calendarioS1.fimAulas + 'T00:00:00');
const INICIO_FREQUENCIAS = new Date(calendarioS1.janelaFrequencias.inicio + 'T10:00:00');

// ------------------------------------------------------------------
// aulas semanais da leonor (templates que se repetem toda a semana)
// gerados a partir do horário real (horarioS1) + tempos letivos
// ------------------------------------------------------------------
function gerarAulasIniciais() {
  return horarioS1.map((aula) => {
    const tempo = temposLetivos.find((t) => t.id === aula.tempo);
    return {
      titulo: `${abrevCadeiras[aula.cadeiraId]} · ${aula.tipo === 'pratica' ? 'Prática' : 'Teórica'}`,
      diaSemana: aula.diaSemana,
      horaInicio: tempo?.inicio || '',
      horaFim: tempo?.fim || '',
      cadeira: aula.cadeiraId,
      sala: aula.sala,
      dataInicio: Timestamp.fromDate(INICIO_AULAS),
      dataFim: Timestamp.fromDate(FIM_AULAS),
      // só as práticas contam para o motor de faltas
      tipoAula: aula.tipo,
      contaFalta: aula.tipo === 'pratica',
    };
  });
}

// ------------------------------------------------------------------
// eventos únicos de exemplo (frequências)
// as datas concretas ainda não saíram — usa o início da janela oficial
// de provas de avaliação contínua (30/11 a 18/12) como referência
// ------------------------------------------------------------------
function gerarEventosIniciais() {
  return [
    {
      titulo: 'Frequência DA I',
      data: Timestamp.fromDate(INICIO_FREQUENCIAS),
      horaInicio: '10:00',
      horaFim: '11:30',
      tipo: 'frequencia',
      cadeira: 'administrativo-1',
      notas: 'Data indicativa — confirma no site da faculdade assim que a pauta sair.',
      importancia: 'alta',
      estado: 'pendente',
      contaFalta: false,
    },
  ];
}

// ------------------------------------------------------------------
// função principal — chama as duas funções abaixo
// ------------------------------------------------------------------
export async function initCalendario(userId) {
  await initAulasSemanais(userId);
  await initEventos(userId);
}

// carrega o horário real do semestre para quem ainda não o tem (só cria se a coleção estiver vazia)
export async function carregarHorarioInicial(userId) {
  const existentes = await getDocs(collection(db, 'users', userId, 'aulasSemanais'));
  if (!existentes.empty) return false;
  await initAulasSemanais(userId);
  return true;
}

// cria os templates das aulas semanais no firestore
async function initAulasSemanais(userId) {
  const ref = collection(db, 'users', userId, 'aulasSemanais');
  for (const aula of gerarAulasIniciais()) {
    await addDoc(ref, aula);
  }
}

// cria os eventos únicos no firestore
async function initEventos(userId) {
  const ref = collection(db, 'users', userId, 'eventos');
  for (const evento of gerarEventosIniciais()) {
    await addDoc(ref, evento);
  }
}
