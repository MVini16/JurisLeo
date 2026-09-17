// importa as funções de autenticação do firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// importa a ligação ao auth e à base de dados
import { auth } from "./firebase.js";
// importa a função que cria a estrutura do firestore
import { initializeUserFirestore } from "./initFirestore.js";
// importa a função que cria a estrutura do calendário
import { initCalendario } from "./initCalendario.js";

// função de registo — cria conta nova
export async function registar(email, password) {
  try {
    // cria o utilizador no firebase auth
    const resultado = await createUserWithEmailAndPassword(auth, email, password);
    const userId = resultado.user.uid;
    // cria a estrutura do firestore para este utilizador
    await initializeUserFirestore(userId);
    // cria a estrutura do calendário para este utilizador
    await initCalendario(userId);
    return { sucesso: true, utilizador: resultado.user };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
}

// função de login — entra numa conta existente
export async function login(email, password) {
  try {
    const resultado = await signInWithEmailAndPassword(auth, email, password);
    return { sucesso: true, utilizador: resultado.user };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
}

// função de logout — sai da conta
export async function logout() {
  try {
    await signOut(auth);
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
}
