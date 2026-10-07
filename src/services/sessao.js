// a sessão que o firebase guarda neste telemóvel: se ela já entrou antes, não pede o email outra vez.
// o firebase mantém o login no armazenamento do próprio telemóvel até ela sair da conta
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { destinoPorPerfil } from './destinoLogin.js';

// espera que o firebase leia a sessão guardada e devolve o utilizador (ou null se não há sessão)
export async function esperarSessao() {
  try {
    await auth.authStateReady();
    return auth.currentUser;
  } catch {
    return null;
  }
}

// a página para onde ele deve ir; se não conseguir ler o perfil (sem rede), vai ao início
export async function destinoDoUtilizador(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'perfil', 'dados'));
    return destinoPorPerfil(snap.exists() ? snap.data() : null);
  } catch {
    return '/dashboard';
  }
}
