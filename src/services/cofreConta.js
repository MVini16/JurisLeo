// o cofre na conta: users/{uid}/cofre/{dia} com o resumo, e users/{uid}/cofre/{dia}/partes/{n} com o texto.
// guarda-se uma vez por dia (a primeira vez que a app abre com rede), e repõe-se a partir das definições.
// exceção ao padrão "um documento dados por subcoleção": aqui há uma cópia por dia, de propósito
import { db } from './firebase.js';
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp, writeBatch, Timestamp,
} from 'firebase/firestore';
import { recolherDadosParaExportar, COLECOES, SUBDOCS_CADEIRA } from './exportar.js';
import { serializar, desserializar, partir, copiasAApagar, resumir, pareceVazia, diaDe } from './cofre.js';

const refCofre = (uid) => collection(db, 'users', uid, 'cofre');

// guarda uma cópia com este id (por omissão, o dia de hoje). se já existir e `porCima` for falso, não faz nada
export async function guardarNoCofre(uid, { id = diaDe(new Date()), porCima = false, motivo = 'diaria' } = {}) {
  const ref = doc(refCofre(uid), id);
  if (!porCima) {
    const ja = await getDoc(ref);
    if (ja.exists()) return { feito: false, motivo: 'ja-existe' };
  }
  const dados = await recolherDadosParaExportar(uid, { doServidor: true });
  const resumo = resumir(dados);
  // uma conta sem nada feito por ela não ocupa espaço no cofre (as cópias manuais guardam-se sempre)
  if (motivo === 'diaria' && pareceVazia(resumo)) return { feito: false, motivo: 'vazia' };
  const partes = partir(serializar(dados));
  // primeiro as partes, depois o documento principal: assim uma cópia só aparece na lista quando está completa
  for (let i = 0; i < partes.length; i += 1) {
    await setDoc(doc(ref, 'partes', String(i)), { t: partes[i] });
  }
  await setDoc(ref, { em: serverTimestamp(), dia: diaDe(new Date()), partes: partes.length, resumo, motivo });
  await limparCofre(uid);
  return { feito: true, resumo };
}

// apaga as cópias a mais (fica com as últimas 14 diárias e 5 especiais)
async function limparCofre(uid) {
  const snap = await getDocs(refCofre(uid));
  const apagar = copiasAApagar(snap.docs.map((d) => d.id));
  for (const id of apagar) {
    const info = snap.docs.find((d) => d.id === id)?.data();
    for (let i = 0; i < (info?.partes || 0); i += 1) await deleteDoc(doc(refCofre(uid), id, 'partes', String(i))).catch(() => {});
    await deleteDoc(doc(refCofre(uid), id)).catch(() => {});
  }
}

// a lista das cópias, da mais recente para a mais antiga
export async function listarCofre(uid) {
  const snap = await getDocs(refCofre(uid));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((c) => c.partes > 0)
    .sort((a, b) => (b.em?.toMillis?.() || 0) - (a.em?.toMillis?.() || 0));
}

// lê uma cópia inteira de volta para objeto, com as datas do firestore no tipo certo
export async function lerDoCofre(uid, id) {
  const info = await getDoc(doc(refCofre(uid), id));
  if (!info.exists()) throw new Error('Essa cópia já não existe.');
  const n = info.data().partes || 0;
  const pedacos = [];
  for (let i = 0; i < n; i += 1) {
    const p = await getDoc(doc(refCofre(uid), id, 'partes', String(i)));
    pedacos.push(p.data()?.t || '');
  }
  return desserializar(pedacos.join(''), (s, ns) => new Timestamp(s, ns));
}

// repõe uma cópia: volta a escrever tudo o que lá está. não apaga o que ela criou depois da cópia.
// antes de repor, guarda uma cópia do estado atual ("antes de repor"), para se poder voltar atrás
export async function reporDoCofre(uid, id) {
  await guardarNoCofre(uid, { id: `${diaDe(new Date())}-antes-de-repor-${Date.now()}`, porCima: true, motivo: 'antes-de-repor' });
  const dados = await lerDoCofre(uid, id);
  const escritas = [];
  if (dados.perfil) escritas.push([doc(db, 'users', uid, 'perfil', 'dados'), dados.perfil, true]);
  if (dados.configuracoes) escritas.push([doc(db, 'users', uid, 'configuracoes', 'dados'), dados.configuracoes, true]);
  (dados.cadeiras || []).forEach((c) => {
    const { id: idCadeira, ...resto } = c;
    const base = { ...resto };
    SUBDOCS_CADEIRA.forEach((s) => { delete base[s]; });
    escritas.push([doc(db, 'users', uid, 'cadeiras', idCadeira), base, true]);
    SUBDOCS_CADEIRA.forEach((s) => { if (c[s]) escritas.push([doc(db, 'users', uid, 'cadeiras', idCadeira, s, 'dados'), c[s], true]); });
  });
  COLECOES.forEach((nome) => {
    (dados[nome] || []).forEach(({ id: idDoc, ...resto }) => escritas.push([doc(db, 'users', uid, nome, idDoc), resto, false]));
  });
  // em grupos de 400 (o máximo de um lote do firestore é 500)
  for (let i = 0; i < escritas.length; i += 400) {
    const lote = writeBatch(db);
    escritas.slice(i, i + 400).forEach(([ref, valor, juntar]) => lote.set(ref, valor, juntar ? { merge: true } : {}));
    await lote.commit();
  }
  return { escritas: escritas.length };
}
