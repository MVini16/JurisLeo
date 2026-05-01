// importa a função principal do firebase
import { initializeApp } from "firebase/app";

// importa o firestore (base de dados)
import { getFirestore } from "firebase/firestore";

// importa o authentication
import { getAuth } from "firebase/auth";

// configuração do projeto firebase com variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// inicializa o firebase com a configuração
const app = initializeApp(firebaseConfig);

// cria e exporta a instância do firestore
export const db = getFirestore(app);

// cria e exporta a instância do auth
export const auth = getAuth(app);
