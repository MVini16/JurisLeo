// inicializa o calendário do utilizador no firestore com dados de exemplo

import { db } from '../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// datas do semestre (ajustar quando tiveres o calendário real)
const INICIO_SEMESTRE = new Date('2026-02-09');
const FIM_SEMESTRE = new Date('2026-06-30');

// ------------------------------------------------------------------
// aulas semanais da leonor (templates que se repetem toda a semana)
// ------------------------------------------------------------------
const aulasIniciais = [
  {
    titulo: 'TGDC II',
    diaSemana: 1, // segunda
    horaInicio: '09:00',
    horaFim: '11:00',
    cadeira: 'tgdc2',
    sala: 'Sala 1',
    dataInicio: Timestamp.fromDate(INICIO_SEMESTRE),
    dataFim: Timestamp.fromDate(FIM_SEMESTRE),
    contaFalta: true,
  },
  {
    titulo: 'IED II',
    diaSemana: 2, // terça
    horaInicio: '11:00',
    horaFim: '13:00',
    cadeira: 'ied2',
    sala: 'Sala 2',
    dataInicio: Timestamp.fromDate(INICIO_SEMESTRE),
    dataFim: Timestamp.fromDate(FIM_SEMESTRE),
    contaFalta: true,
  },
  {
    titulo: 'DC II',
    diaSemana: 3, // quarta
    horaInicio: '14:00',
    horaFim: '16:00',
    cadeira: 'dc2',
    sala: 'Sala 3',
    dataInicio: Timestamp.fromDate(INICIO_SEMESTRE),
    dataFim: Timestamp.fromDate(FIM_SEMESTRE),
    contaFalta: true,
  },
  {
    titulo: 'HDP',
    diaSemana: 4, // quinta
    horaInicio: '09:00',
    horaFim: '11:00',
    cadeira: 'hdp',
    sala: 'Sala 4',
    dataInicio: Timestamp.fromDate(INICIO_SEMESTRE),
    dataFim: Timestamp.fromDate(FIM_SEMESTRE),
    contaFalta: true,
  },
  {
    titulo: 'HIP',
    diaSemana: 5, // sexta
    horaInicio: '11:00',
    horaFim: '13:00',
    cadeira: 'hip',
    sala: 'Sala 5',
    dataInicio: Timestamp.fromDate(INICIO_SEMESTRE),
    dataFim: Timestamp.fromDate(FIM_SEMESTRE),
    contaFalta: true,
  },
];

// ------------------------------------------------------------------
// eventos únicos de exemplo (frequências, orais, etc.)
// ------------------------------------------------------------------
const eventosIniciais = [
  {
    titulo: 'Frequência TGDC II',
    data: Timestamp.fromDate(new Date('2026-05-20T10:00:00')),
    horaInicio: '10:00',
    horaFim: '12:00',
    tipo: 'frequencia',
    cadeira: 'tgdc2',
    notas: '',
    importancia: 'alta',
    estado: 'pendente',
    contaFalta: false,
  },
  {
    titulo: 'Frequência IED II',
    data: Timestamp.fromDate(new Date('2026-05-22T14:00:00')),
    horaInicio: '14:00',
    horaFim: '16:00',
    tipo: 'frequencia',
    cadeira: 'ied2',
    notas: '',
    importancia: 'alta',
    estado: 'pendente',
    contaFalta: false,
  },
];

// ------------------------------------------------------------------
// função principal — chama as duas funções abaixo
// ------------------------------------------------------------------
export async function initCalendario(userId) {
  await initAulasSemanais(userId);
  await initEventos(userId);
}

// cria os templates das aulas semanais no firestore
async function initAulasSemanais(userId) {
  const ref = collection(db, 'users', userId, 'aulasSemanais');
  for (const aula of aulasIniciais) {
    await addDoc(ref, aula);
  }
}

// cria os eventos únicos no firestore
async function initEventos(userId) {
  const ref = collection(db, 'users', userId, 'eventos');
  for (const evento of eventosIniciais) {
    await addDoc(ref, evento);
  }
}