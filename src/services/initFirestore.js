// importa as ferramentas necessárias do firestore
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
// importa a ligação à base de dados
import { db } from "./firebase.js";
// importa as cadeiras reais do 2.º ano, s1
import { cadeirasS1, dadosLeonor } from "../data/dadosLeonor.js";

// ids das cadeiras do 1.º ano, usados numa versão antiga da semente —
// só aqui para a limparCadeirasAntigas conseguir apagá-las de contas de teste
const IDS_CADEIRAS_1_ANO = ["tgdc2", "ied2", "dc2", "hdp", "hip"];

// cria as 5 cadeiras reais do semestre e as suas sub-colecções — só no registo:
// substitui tudo (notas e faltas incluídas), por isso nunca chamar numa conta em uso
export async function seedCadeiras(userId) {
  const userRef = doc(db, "users", userId);

  for (const cadeira of cadeirasS1) {
    const cadeiraRef = doc(userRef, "cadeiras", cadeira.id);

    // info da cadeira
    await setDoc(cadeiraRef, {
      nome: cadeira.nome,
      abrev: cadeira.abrev,
      cor: cadeira.cor,
      regente: cadeira.regente,
      metodo: cadeira.metodo,
      optativa: cadeira.optativa,
      aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
      aulasTeoricasPrevistas: cadeira.aulasTeoricasPrevistas,
    });

    // faltas — campos de entrada do motor de faltas (src/services/faltas.js)
    await setDoc(doc(cadeiraRef, "faltas", "dados"), {
      aulasPraticasLecionadas: 0,
      faltasInjustificadas: 0,
      faltasJustificadas: 0,
    });

    // avaliação — campos de entrada do motor de avaliação (src/services/avaliacao.js)
    await setDoc(doc(cadeiraRef, "avaliacao", "dados"), {
      provaEscrita: null,
      outrosElementos: null,
      exameEscrito: null,
      exameOral: null,
      exameRecurso: null,
      melhoriaOral: null,
    });
  }
}

// repara as cadeiras sem apagar nada: atualiza a info fixa (e mantém os pesos dela)
// e só cria os documentos de faltas e avaliação que ainda não existem
export async function repararCadeiras(userId) {
  const userRef = doc(db, "users", userId);

  for (const cadeira of cadeirasS1) {
    const cadeiraRef = doc(userRef, "cadeiras", cadeira.id);

    await setDoc(cadeiraRef, {
      nome: cadeira.nome,
      abrev: cadeira.abrev,
      cor: cadeira.cor,
      regente: cadeira.regente,
      metodo: cadeira.metodo,
      optativa: cadeira.optativa,
      aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
      aulasTeoricasPrevistas: cadeira.aulasTeoricasPrevistas,
    }, { merge: true });

    const faltasRef = doc(cadeiraRef, "faltas", "dados");
    if (!(await getDoc(faltasRef)).exists()) {
      await setDoc(faltasRef, { aulasPraticasLecionadas: 0, faltasInjustificadas: 0, faltasJustificadas: 0 });
    }

    const avaliacaoRef = doc(cadeiraRef, "avaliacao", "dados");
    if (!(await getDoc(avaliacaoRef)).exists()) {
      await setDoc(avaliacaoRef, { provaEscrita: null, outrosElementos: null, exameEscrito: null, exameOral: null, exameRecurso: null, melhoriaOral: null });
    }
  }
}

// apaga as cadeiras do 1.º ano que ficaram de uma semente antiga (contas criadas
// antes da correção para o 2.º ano). útil só como reparação pontual de contas de teste.
export async function limparCadeirasAntigas(userId) {
  const userRef = doc(db, "users", userId);
  for (const id of IDS_CADEIRAS_1_ANO) {
    const cadeiraRef = doc(userRef, "cadeiras", id);
    await deleteDoc(doc(cadeiraRef, "faltas", "dados")).catch(() => {});
    await deleteDoc(doc(cadeiraRef, "avaliacao", "dados")).catch(() => {});
    await deleteDoc(cadeiraRef).catch(() => {});
  }
}

// função principal que cria toda a estrutura — corre uma vez, no registo
export async function initializeUserFirestore(userId) {
  const userRef = doc(db, "users", userId);

  // cria o perfil base do utilizador
  await setDoc(doc(userRef, "perfil", "dados"), {
    nome: "",
    curso: "Licenciatura em Direito",
    ano: `${dadosLeonor.ano}º Ano`,
    turma: `Turma ${dadosLeonor.turma === 'TA' ? 'A' : dadosLeonor.turma}`,
    subturma: `Subturma ${dadosLeonor.subturma}`,
    anoLetivo: dadosLeonor.anoLetivo,
    objetivos: [],
    criadoEm: new Date(),
  });

  // cria as configurações base
  await setDoc(doc(userRef, "configuracoes", "dados"), {
    tema: "dark",
    notificacoesAtivas: true,
    emailNotificacoes: "",
  });

  await seedCadeiras(userId);
}
