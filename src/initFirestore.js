// importa as ferramentas necessárias do firestore
import { doc, setDoc } from "firebase/firestore";
// importa a ligação à base de dados
import { db } from "./firebase.js";

// função principal que cria toda a estrutura
export async function initializeUserFirestore(userId) {
  
  // referência ao documento do utilizador
  const userRef = doc(db, "users", userId);

  // cria o perfil base do utilizador
  await setDoc(doc(userRef, "perfil", "dados"), {
    nome: "",
    curso: "Licenciatura em Direito",
    ano: "1º Ano",
    turma: "Turma A",
    subturma: "Subturma 6",
    objetivos: [],
    criadoEm: new Date(),
  });

  // cria as configurações base
  await setDoc(doc(userRef, "configuracoes", "dados"), {
    tema: "dark",
    notificacoesAtivas: true,
    emailNotificacoes: "",
  });

  // lista das cadeiras com as cores definidas
  const cadeiras = [
    { id: "tgdc2", nome: "Teoria Geral Direito Civil II", cor: "roxo", prof: "Prof. Doutor António Barreto Menezes Cordeiro", ects: 0, metodo: "A" },
    { id: "ied2", nome: "Introdução ao Estudo do Direito II", cor: "rosa", prof: "Prof. Doutor José Alberto Vieira", ects: 0, metodo: "A" },
    { id: "dc2", nome: "Direito Constitucional II", cor: "azul", prof: "Prof. Doutor Paulo Otero", ects: 0, metodo: "A" },
    { id: "hdp", nome: "História do Direito Português", cor: "laranja", prof: "Prof.ª Doutora Sílvia Alves", ects: 0, metodo: "A" },
    { id: "hip", nome: "História das Ideias Políticas", cor: "amarelo", prof: "Prof.ª Doutora Susana Videira", ects: 0, metodo: "A" },
  ];

  // cria cada cadeira com as suas sub-colecções
  for (const cadeira of cadeiras) {
    const cadeiraRef = doc(userRef, "cadeiras", cadeira.id);

    // info da cadeira
    await setDoc(cadeiraRef, {
      nome: cadeira.nome,
      cor: cadeira.cor,
      prof: cadeira.prof,
      ects: cadeira.ects,
      metodo: cadeira.metodo,
    });

    // faltas
    await setDoc(doc(cadeiraRef, "faltas", "dados"), {
      teoricas: 0,
      praticas: 0,
      limite: 0,
    });

    // avaliação
    await setDoc(doc(cadeiraRef, "avaliacao", "dados"), {
      notaFrequencia: null,
      notaParticipacao: null,
      notaFinal: null,
      metodoAtivo: "A",
      status: "em curso",
    });
  }

  console.log("estrutura do firestore criada com sucesso!");
}