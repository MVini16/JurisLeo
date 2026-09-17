// importa as ferramentas necessárias do firestore
import { doc, setDoc } from "firebase/firestore";
// importa a ligação à base de dados
import { db } from "./firebase.js";
// importa as cadeiras reais do 2.º ano, s1
import { cadeirasS1, dadosLeonor } from "../data/dadosLeonor.js";

// função principal que cria toda a estrutura
export async function initializeUserFirestore(userId) {

  // referência ao documento do utilizador
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

  // cria cada cadeira com as suas sub-colecções
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
