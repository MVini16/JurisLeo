// recolhe todos os dados da utilizadora e gera um ficheiro json para download —
// um backup simples, sem depender de nada além do que o firestore já guarda.
// também é usado pelo cofre (cópia diária na conta) e pela consola do vini (leitura da conta dela)
import { db } from './firebase.js';
import { doc, getDoc, collection, getDocs, getDocFromServer, getDocsFromServer } from 'firebase/firestore';

// as coleções da conta, cada uma com documentos soltos (as cadeiras tratam-se à parte, com os subdocumentos)
// (estadosAula e sumarios são da versão antiga: já não se escrevem, mas guardam-se nas cópias enquanto existirem)
export const COLECOES = ['eventos', 'aulasSemanais', 'tarefas', 'anotacoes', 'casos', 'artigos', 'glossario', 'leituras', 'sessoesEstudo', 'flashcards', 'estadosAula', 'sumarios'];
export const SUBDOCS_CADEIRA = ['faltas', 'avaliacao', 'presencas'];

// doServidor: lê diretamente da conta, sem a cópia guardada no telemóvel (para o cofre não guardar dados velhos)
function leitores(doServidor) {
  return doServidor ? { umDoc: getDocFromServer, varios: getDocsFromServer } : { umDoc: getDoc, varios: getDocs };
}

async function pegarColecao(userId, nome, ler) {
  const snap = await ler.varios(collection(db, 'users', userId, nome));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function pegarSubdocumentoDeCadeiras(userId, cadeiras, subnome, ler) {
  const resultado = {};
  for (const cadeira of cadeiras) {
    const snap = await ler.umDoc(doc(db, 'users', userId, 'cadeiras', cadeira.id, subnome, 'dados'));
    resultado[cadeira.id] = snap.exists() ? snap.data() : null;
  }
  return resultado;
}

export async function recolherDadosParaExportar(userId, { doServidor = false } = {}) {
  const ler = leitores(doServidor);
  const [perfilSnap, configSnap, cadeiras] = await Promise.all([
    ler.umDoc(doc(db, 'users', userId, 'perfil', 'dados')),
    ler.umDoc(doc(db, 'users', userId, 'configuracoes', 'dados')),
    pegarColecao(userId, 'cadeiras', ler),
  ]);

  const subdocs = await Promise.all(SUBDOCS_CADEIRA.map((s) => pegarSubdocumentoDeCadeiras(userId, cadeiras, s, ler)));
  const colecoes = await Promise.all(COLECOES.map((nome) => pegarColecao(userId, nome, ler)));

  const dados = {
    exportadoEm: new Date().toISOString(),
    perfil: perfilSnap.data() || null,
    configuracoes: configSnap.data() || null,
    cadeiras: cadeiras.map((c) => {
      const comSub = { ...c };
      SUBDOCS_CADEIRA.forEach((s, i) => { comSub[s] = subdocs[i][c.id]; });
      return comSub;
    }),
  };
  COLECOES.forEach((nome, i) => { dados[nome] = colecoes[i]; });
  return dados;
}

// substitui timestamps do firestore por texto legível (iso), para o json ficar limpo
function jsonReplacer(_chave, valor) {
  if (valor && typeof valor === 'object' && typeof valor.toDate === 'function') {
    return valor.toDate().toISOString();
  }
  return valor;
}

// descarrega um texto como ficheiro
export function descarregarTexto(texto, nomeFicheiro) {
  const blob = new Blob([texto], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeFicheiro;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportarDadosComoFicheiro(userId) {
  const dados = await recolherDadosParaExportar(userId);
  descarregarTexto(JSON.stringify(dados, jsonReplacer, 2), `jurisleo-backup-${new Date().toISOString().slice(0, 10)}.json`);
}
