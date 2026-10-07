// diagnóstico só de leitura (corre no github actions, ver .github/workflows/diagnostico.yml):
// para cada conta, conta quantos documentos há em cada coleção e a data do mais recente.
// nunca escreve nada e nunca imprime o conteúdo dos documentos, só números, datas e se o perfil tem nome
import admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'jurisleo-67124' });
const db = admin.firestore();

// cada pedido tem no máximo 25 s, para o diagnóstico nunca ficar encravado
function comLimite(promessa, oQue) {
  return Promise.race([promessa, new Promise((_, rej) => setTimeout(() => rej(new Error(`demorou demais: ${oQue}`)), 25000))]);
}
function tapar(email) {
  if (!email) return '(sem email)';
  const [nome, dominio] = email.split('@');
  return nome.slice(0, 3) + '***@' + dominio;
}
function data(ts) { return ts ? ts.toDate().toISOString().slice(0, 16).replace('T', ' ') : '-'; }
function maisRecente(a, b) { return !a ? b : !b ? a : (a.toMillis() > b.toMillis() ? a : b); }

// documentos de uma coleção sem os campos (só os metadados): dá o total e a data mais recente
async function resumoColecao(col) {
  const snap = await comLimite(col.select().get(), col.path);
  let ultima = null;
  snap.docs.forEach((d) => { ultima = maisRecente(ultima, d.updateTime); });
  return { total: snap.size, ultima, docs: snap.docs };
}

console.log('a ler as contas...');
const contas = new Map();
try {
  const r = await comLimite(admin.auth().listUsers(1000), 'listUsers');
  r.users.forEach((u) => contas.set(u.uid, u));
  console.log(`\n== contas no authentication: ${contas.size}`);
  for (const u of contas.values()) {
    if (u.email && u.email.startsWith('teste-')) continue;
    console.log(`${u.uid}  ${tapar(u.email)}  criada ${u.metadata.creationTime}  última entrada ${u.metadata.lastSignInTime}`);
  }
  console.log(`(contas teste-*: ${[...contas.values()].filter((u) => u.email && u.email.startsWith('teste-')).length})`);
} catch (e) {
  console.log('não consegui ler as contas:', e.message);
}

const utilizadores = await comLimite(db.collection('users').listDocuments(), 'users');
console.log(`\n== documentos em users/: ${utilizadores.length}`);
for (const ref of utilizadores) {
  try {
    const u = contas.get(ref.id);
    const quem = u ? tapar(u.email) : 'SEM CONTA NO AUTHENTICATION';
    const cols = await comLimite(ref.listCollections(), ref.path);
    const linhas = [];
    let soma = 0; let ultima = null;
    for (const col of cols) {
      const r = await resumoColecao(col);
      let extra = '';
      // dentro de cada cadeira: faltas, avaliação e presenças
      if (col.id === 'cadeiras') {
        const sub = {};
        for (const d of r.docs) {
          for (const s of await comLimite(d.ref.listCollections(), d.ref.path)) {
            const rs = await resumoColecao(s);
            sub[s.id] = (sub[s.id] || 0) + rs.total;
            soma += rs.total;
            ultima = maisRecente(ultima, rs.ultima);
          }
        }
        extra = ' ' + JSON.stringify(sub);
      }
      soma += r.total;
      ultima = maisRecente(ultima, r.ultima);
      linhas.push(`    ${col.id}: ${r.total} (mais recente ${data(r.ultima)})${extra}`);
    }
    const perfil = await comLimite(ref.collection('perfil').doc('dados').get(), 'perfil');
    const config = await comLimite(ref.collection('configuracoes').doc('dados').get(), 'config');
    const nome = perfil.exists ? (perfil.get('nome') ? 'sim' : 'vazio') : 'sem perfil';
    const copia = config.exists && config.get('copiaLocal') ? Object.keys(config.get('copiaLocal')).length : 0;
    console.log(`\n${ref.id}  [${quem}]  total ${soma} documentos, último ${data(ultima)}  | nome no perfil: ${nome} | chaves na cópia local: ${copia}`);
    linhas.forEach((l) => console.log(l));
  } catch (e) {
    console.log(`\n${ref.id}  erro: ${e.message}`);
  }
}
console.log('\nfim do diagnóstico');
process.exit(0);
