// corre uma vez na conta dela: traz as aulas marcadas e os sumários da versão antiga (estadosAula, sumarios)
// para as presenças da versão atual. antes, guarda uma cópia no cofre; depois, deixa uma marca em
// configuracoes/dados.migracaoAntiga para não voltar a correr. as coleções antigas ficam como estavam (não se apaga nada)
import { db } from './firebase.js';
import { collection, doc, getDocFromServer, getDocsFromServer, setDoc } from 'firebase/firestore';
import { idsCadeiras } from '../data/dadosLeonor.js';
import { migrarDaVersaoAntiga } from './migracaoAntiga.js';
import { guardarNoCofre } from './cofreConta.js';
import { diaDe } from './cofre.js';

export async function correrMigracaoAntiga(uid) {
  const refConfig = doc(db, 'users', uid, 'configuracoes', 'dados');
  const config = await getDocFromServer(refConfig);
  if (config.data()?.migracaoAntiga) return { feito: false, motivo: 'ja-feita' };

  const [estadosSnap, sumariosSnap] = await Promise.all([
    getDocsFromServer(collection(db, 'users', uid, 'estadosAula')),
    getDocsFromServer(collection(db, 'users', uid, 'sumarios')),
  ]);
  const estados = estadosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const sumarios = sumariosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (estados.length === 0 && sumarios.length === 0) {
    await setDoc(refConfig, { migracaoAntiga: { em: Date.now(), marcas: 0, sumarios: 0 } }, { merge: true });
    return { feito: false, motivo: 'nada-para-trazer' };
  }

  const atuais = {};
  for (const id of idsCadeiras) {
    const snap = await getDocFromServer(doc(db, 'users', uid, 'cadeiras', id, 'presencas', 'dados'));
    atuais[id] = snap.data() || {};
  }

  const r = migrarDaVersaoAntiga({ estados, sumarios, atuais });
  await guardarNoCofre(uid, { id: `${diaDe(new Date())}-antes-da-migracao`, porCima: true, motivo: 'antes-da-migracao' });

  for (const [cadeiraId, novo] of Object.entries(r.porCadeira)) {
    const campos = {};
    if (Object.keys(novo.marcas).length) campos.marcas = novo.marcas;
    if (Object.keys(novo.notasAulas).length) campos.notasAulas = novo.notasAulas;
    if (Object.keys(campos).length) await setDoc(doc(db, 'users', uid, 'cadeiras', cadeiraId, 'presencas', 'dados'), campos, { merge: true });
  }
  await setDoc(refConfig, { migracaoAntiga: { em: Date.now(), marcas: r.marcas, sumarios: r.sumarios } }, { merge: true });
  return { feito: true, marcas: r.marcas, sumarios: r.sumarios };
}
