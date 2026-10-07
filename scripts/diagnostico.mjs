// diagnóstico só de leitura (corre no github actions, ver .github/workflows/diagnostico.yml):
// para cada conta, conta quantos documentos há em cada coleção e a data do mais recente.
// nunca escreve nada e nunca imprime o conteúdo dos documentos, só números, datas e se o perfil tem nome
import admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'jurisleo-67124' });
const db = admin.firestore();

// esconde o meio do email (o log fica no github)
function tapar(email) {
  if (!email) return '(sem email)';
  const [nome, dominio] = email.split('@');
  return nome.slice(0, 3) + '***@' + dominio;
}
function data(ts) { return ts ? ts.toDate().toISOString().slice(0, 16).replace('T', ' ') : '-'; }

// conta todos os documentos debaixo de uma coleção (com subcoleções, até 3 níveis)
async function contar(col, nivel = 0) {
  const docs = await col.listDocuments();
  let total = 0; let maisRecente = null;
  for (const ref of docs) {
    const snap = await ref.get();
    if (snap.exists) {
      total++;
      if (!maisRecente || snap.updateTime.toMillis() > maisRecente.toMillis()) maisRecente = snap.updateTime;
    }
    if (nivel < 3) {
      for (const sub of await ref.listCollections()) {
        const r = await contar(sub, nivel + 1);
        total += r.total;
        if (r.maisRecente && (!maisRecente || r.maisRecente.toMillis() > maisRecente.toMillis())) maisRecente = r.maisRecente;
      }
    }
  }
  return { total, maisRecente };
}

const contas = new Map();
let pagina;
do {
  const r = await admin.auth().listUsers(1000, pagina);
  r.users.forEach((u) => contas.set(u.uid, u));
  pagina = r.pageToken;
} while (pagina);

console.log(`\n== contas no authentication: ${contas.size}`);
for (const u of contas.values()) {
  if (u.email && u.email.startsWith('teste-')) continue;
  console.log(`${u.uid}  ${tapar(u.email)}  criada ${u.metadata.creationTime}  última entrada ${u.metadata.lastSignInTime}`);
}
console.log(`(contas teste-*: ${[...contas.values()].filter((u) => u.email && u.email.startsWith('teste-')).length})`);

const utilizadores = await db.collection('users').listDocuments();
console.log(`\n== documentos em users/: ${utilizadores.length}`);
for (const ref of utilizadores) {
  const u = contas.get(ref.id);
  const quem = u ? tapar(u.email) : 'SEM CONTA NO AUTHENTICATION';
  const cols = await ref.listCollections();
  const linhas = [];
  let soma = 0; let ultima = null;
  for (const col of cols) {
    const r = await contar(col);
    soma += r.total;
    if (r.maisRecente && (!ultima || r.maisRecente.toMillis() > ultima.toMillis())) ultima = r.maisRecente;
    linhas.push(`    ${col.id}: ${r.total} (mais recente ${data(r.maisRecente)})`);
  }
  const perfil = await ref.collection('perfil').doc('dados').get();
  const config = await ref.collection('configuracoes').doc('dados').get();
  const nome = perfil.exists ? (perfil.get('nome') ? 'sim' : 'vazio') : 'sem perfil';
  const copia = config.exists && config.get('copiaLocal') ? Object.keys(config.get('copiaLocal')).length : 0;
  console.log(`\n${ref.id}  [${quem}]  total ${soma} documentos, último ${data(ultima)}  | nome no perfil: ${nome} | chaves na cópia local: ${copia}`);
  linhas.forEach((l) => console.log(l));
}
