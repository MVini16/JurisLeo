// recolhe todos os dados da utilizadora e gera um ficheiro json para download —
// um backup simples, sem depender de nada além do que o firestore já guarda
import { db } from './firebase.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { limparParaJson, COLECOES_BACKUP } from './exportarJson.js';

async function pegarColecao(userId, nome) {
  const snap = await getDocs(collection(db, 'users', userId, nome));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function pegarSubdocumentoDeCadeiras(userId, cadeiras, subnome) {
  const resultado = {};
  for (const cadeira of cadeiras) {
    const snap = await getDoc(doc(db, 'users', userId, 'cadeiras', cadeira.id, subnome, 'dados'));
    resultado[cadeira.id] = snap.exists() ? snap.data() : null;
  }
  return resultado;
}

export async function recolherDadosParaExportar(userId) {
  const [perfilSnap, configSnap, planoSnap, cadeiras] = await Promise.all([
    getDoc(doc(db, 'users', userId, 'perfil', 'dados')),
    getDoc(doc(db, 'users', userId, 'configuracoes', 'dados')),
    getDoc(doc(db, 'users', userId, 'planoEstudo', 'dados')),
    pegarColecao(userId, 'cadeiras'),
  ]);

  const [faltasPorCadeira, avaliacaoPorCadeira, revisaoPorCadeira, ...colecoes] = await Promise.all([
    pegarSubdocumentoDeCadeiras(userId, cadeiras, 'faltas'),
    pegarSubdocumentoDeCadeiras(userId, cadeiras, 'avaliacao'),
    pegarSubdocumentoDeCadeiras(userId, cadeiras, 'revisaoFrequencia'),
    ...COLECOES_BACKUP.map((nome) => pegarColecao(userId, nome)),
  ]);

  return limparParaJson({
    exportadoEm: new Date().toISOString(),
    perfil: perfilSnap.data() || null,
    configuracoes: configSnap.data() || null,
    planoEstudo: planoSnap.data() || null,
    cadeiras: cadeiras.map((c) => ({ ...c, faltas: faltasPorCadeira[c.id], avaliacao: avaliacaoPorCadeira[c.id], revisaoFrequencia: revisaoPorCadeira[c.id] })),
    ...Object.fromEntries(COLECOES_BACKUP.map((nome, i) => [nome, colecoes[i]])),
  });
}

export async function exportarDadosComoFicheiro(userId) {
  const dados = await recolherDadosParaExportar(userId);
  const texto = JSON.stringify(dados, null, 2);
  const blob = new Blob([texto], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `jurisleo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
