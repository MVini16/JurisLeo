// escritas no firestore que não esperam pelo servidor
// com a cache persistente, um await setDoc/addDoc só resolve quando o servidor confirma:
// numa sala sem rede os botões ficavam presos em "a guardar...". a escrita entra logo na
// cache local (os onSnapshot já a mostram) e sobe sozinha quando a ligação voltar.
import { doc, setDoc } from 'firebase/firestore';

// deixa a escrita seguir; se o servidor a recusar, fica registado na consola do browser
export function semEsperar(promessa) {
  promessa.catch((erro) => console.error('escrita no firestore falhou', erro));
}

// cria um documento com id gerado no telemóvel e devolve a referência logo
export function criarSemEsperar(colecao, dados) {
  const ref = doc(colecao);
  semEsperar(setDoc(ref, dados));
  return ref;
}
