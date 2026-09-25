// gravação de estados de aula e de faltas no firestore
// mantém sempre faltas/dados (a entrada do motor de faltas) coerente com o que está marcado
import { db } from './firebase.js';
import {
  collection, doc, getDoc, getDocFromCache, getDocs, setDoc, deleteDoc, query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { contarFaltas, prazoComprovativo } from './faltas.js';
import { chaveData } from '../data/feriados.js';

const pastaDoUtilizador = (userId) => doc(db, 'users', userId);
const colecao = (userId, nome) => collection(pastaDoUtilizador(userId), nome);

// as escritas não esperam pelo servidor: o firestore aplica-as logo na cache local
// (a recontagem a seguir já as vê) e sobe-as quando houver rede. esperar deixava a
// marcação de uma falta a meio numa sala sem internet.
const semEsperar = (promessa) => { promessa.catch(() => {}); };

// sem rede, o getDoc dá erro em vez de ler a cache — aqui tenta a cache a seguir
async function lerDoc(ref) {
  try {
    return await getDoc(ref);
  } catch {
    try { return await getDocFromCache(ref); } catch { return null; }
  }
}

// recalcula lecionadas e faltas de uma cadeira a partir dos estados marcados e dos registos
export async function sincronizarFaltas(userId, cadeiraId) {
  const [estadosSnap, registosSnap, faltasSnap] = await Promise.all([
    getDocs(query(colecao(userId, 'estadosAula'), where('cadeiraId', '==', cadeiraId))),
    getDocs(query(colecao(userId, 'faltasRegisto'), where('cadeiraId', '==', cadeiraId))),
    lerDoc(doc(pastaDoUtilizador(userId), 'cadeiras', cadeiraId, 'faltas', 'dados')),
  ]);

  const contagem = contarFaltas({
    ocorrencias: estadosSnap.docs.map((d) => d.data()),
    registos: registosSnap.docs.map((d) => d.data()),
    ajusteLecionadas: faltasSnap?.data()?.ajusteLecionadas || 0,
  });

  semEsperar(setDoc(doc(pastaDoUtilizador(userId), 'cadeiras', cadeiraId, 'faltas', 'dados'), contagem, { merge: true }));
  return contagem;
}

// marca o estado de uma ocorrência de aula: fui, faltei, stotFaltou, cancelada ou porMarcar
// ocorrencia: { ocorrenciaId, aulaId, cadeira, data, tipoAula }
export async function marcarEstadoAula(userId, ocorrencia, estado) {
  const idEstado = ocorrencia.ocorrenciaId;
  const refEstado = doc(colecao(userId, 'estadosAula'), idEstado);
  const refRegisto = doc(colecao(userId, 'faltasRegisto'), `occ_${idEstado}`);

  if (estado === 'porMarcar') {
    semEsperar(deleteDoc(refEstado));
  } else {
    semEsperar(setDoc(refEstado, {
      aulaId: ocorrencia.aulaId,
      cadeiraId: ocorrencia.cadeira,
      data: chaveData(ocorrencia.data),
      tipoAula: ocorrencia.tipoAula,
      estado,
      atualizadoEm: serverTimestamp(),
    }));
  }

  // só as faltas às aulas práticas contam para o motor
  if (ocorrencia.tipoAula === 'pratica') {
    if (estado === 'faltei') {
      const existente = await lerDoc(refRegisto);
      if (!existente?.exists()) {
        semEsperar(setDoc(refRegisto, novoRegisto({ cadeiraId: ocorrencia.cadeira, data: ocorrencia.data, ocorrenciaId: idEstado })));
      }
    } else {
      semEsperar(deleteDoc(refRegisto));
    }
    await sincronizarFaltas(userId, ocorrencia.cadeira);
  }
}

function novoRegisto({ cadeiraId, data, ocorrenciaId = null }) {
  return {
    cadeiraId,
    data: chaveData(data),
    justificada: false,
    motivo: null,
    comprovativoEntregue: false,
    prazoComprovativo: null,
    ocorrenciaId,
    criadoEm: serverTimestamp(),
  };
}

// falta registada à mão, sem aula marcada no calendário
export async function registarFaltaSolta(userId, { cadeiraId, data }) {
  const ref = doc(colecao(userId, 'faltasRegisto'));
  semEsperar(setDoc(ref, novoRegisto({ cadeiraId, data })));
  await sincronizarFaltas(userId, cadeiraId);
  return ref.id;
}

// justifica (ou deixa de justificar) uma falta e define o prazo do comprovativo
export async function atualizarFalta(userId, registo, patch) {
  const dados = { ...patch };
  if (patch.justificada === true && !registo.prazoComprovativo) {
    const prazo = prazoComprovativo(new Date(registo.data + 'T12:00:00'));
    dados.prazoComprovativo = prazo ? Timestamp.fromDate(prazo) : null;
  }
  if (patch.justificada === false) {
    dados.prazoComprovativo = null;
    dados.comprovativoEntregue = false;
    dados.motivo = null;
  }
  semEsperar(setDoc(doc(colecao(userId, 'faltasRegisto'), registo.id), dados, { merge: true }));
  await sincronizarFaltas(userId, registo.cadeiraId);
}

// apaga uma falta; se estava ligada a uma aula do calendário, essa aula volta a "por marcar"
export async function apagarFalta(userId, registo) {
  semEsperar(deleteDoc(doc(colecao(userId, 'faltasRegisto'), registo.id)));
  if (registo.ocorrenciaId) {
    semEsperar(deleteDoc(doc(colecao(userId, 'estadosAula'), registo.ocorrenciaId)));
  }
  await sincronizarFaltas(userId, registo.cadeiraId);
}

// corrige o total de aulas dadas quando a contagem automática não bate certo com a realidade
export async function corrigirLecionadas(userId, cadeiraId, valorReal) {
  const [estadosSnap, registosSnap] = await Promise.all([
    getDocs(query(colecao(userId, 'estadosAula'), where('cadeiraId', '==', cadeiraId))),
    getDocs(query(colecao(userId, 'faltasRegisto'), where('cadeiraId', '==', cadeiraId))),
  ]);
  const base = contarFaltas({
    ocorrencias: estadosSnap.docs.map((d) => d.data()),
    registos: registosSnap.docs.map((d) => d.data()),
    ajusteLecionadas: 0,
  }).aulasPraticasLecionadas;

  semEsperar(setDoc(
    doc(pastaDoUtilizador(userId), 'cadeiras', cadeiraId, 'faltas', 'dados'),
    { ajusteLecionadas: valorReal - base },
    { merge: true }
  ));
  await sincronizarFaltas(userId, cadeiraId);
}
