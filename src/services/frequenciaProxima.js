// vai ver ao firestore, só quando o boneco está para falar, as datas das frequências (eventos do tipo 'frequencia').
// uma leitura por dia no máximo, e só se ela já tiver entrado; não deixa listeners abertos
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './firebase.js';

let guardado = { dia: '', datas: [] };

export async function datasDasFrequencias(agora = Date.now()) {
  const dia = new Date(agora).toDateString();
  if (guardado.dia === dia) return guardado.datas;
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  try {
    const resultado = await getDocs(query(collection(db, 'users', uid, 'eventos'), where('tipo', '==', 'frequencia')));
    const datas = resultado.docs.map((d) => d.data().data?.toMillis?.()).filter((t) => Number.isFinite(t));
    guardado = { dia, datas };
    return datas;
  } catch {
    return [];
  }
}
