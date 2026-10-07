// hook das presenças às aulas, em tempo real — um documento por cadeira: cadeiras/{id}/presencas/dados
import { useState, useEffect } from 'react';
import { db } from '../services/firebase.js';
import { doc, onSnapshot, setDoc, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { idsCadeiras } from '../data/dadosLeonor.js';
import { chaveAula, normalizarMarca, normalizarNotasAula, dataParaChave } from '../services/presencas.js';

export function usePresencas() {
  const [porCadeira, setPorCadeira] = useState({});
  const [notasPorCadeira, setNotasPorCadeira] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsubs = idsCadeiras.map((id) =>
      onSnapshot(doc(db, 'users', userId, 'cadeiras', id, 'presencas', 'dados'), (snap) => {
        setPorCadeira((prev) => ({ ...prev, [id]: snap.data()?.marcas || {} }));
        setNotasPorCadeira((prev) => ({ ...prev, [id]: snap.data()?.notasAulas || {} }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  // todas as marcas juntas por chave (as chaves não se repetem entre cadeiras)
  const marcas = Object.assign({}, ...Object.values(porCadeira));

  // sumário, nota, trabalho para casa e dúvida de cada aula (ficam na conta, ao lado das marcas)
  const notasAulas = Object.assign({}, ...Object.values(notasPorCadeira));

  async function guardarNotasAula(ev, campos) {
    const userId = getAuth().currentUser?.uid;
    const chave = chaveAula(ev);
    if (!userId || !chave) return;
    const notas = normalizarNotasAula(campos);
    const dataEv = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
    const valor = notas ? { ...notas, em: Date.now(), data: dataEv ? dataParaChave(dataEv) : '', titulo: String(ev.titulo || '').slice(0, 80), cadeiraId: ev.cadeira } : deleteField();
    await setDoc(doc(db, 'users', userId, 'cadeiras', ev.cadeira, 'presencas', 'dados'), { notasAulas: { [chave]: valor } }, { merge: true });
  }

  async function marcar(ev, dados) {
    const userId = getAuth().currentUser?.uid;
    const chave = chaveAula(ev);
    const dataEv = ev.data instanceof Date ? ev.data : ev.data?.toDate?.();
    const marca = normalizarMarca({ ...dados, contaFalta: !!ev.contaFalta, data: dataEv ? dataParaChave(dataEv) : '', titulo: ev.titulo });
    if (!userId || !chave || !marca) return;
    await setDoc(doc(db, 'users', userId, 'cadeiras', ev.cadeira, 'presencas', 'dados'), { marcas: { [chave]: marca } }, { merge: true });
  }

  // corrige uma marca que já existe (ex.: dizer que entregou o comprovativo), sem passar pelo calendário
  async function atualizarMarca(cadeiraId, chave, marca) {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !cadeiraId || !chave) return;
    await setDoc(doc(db, 'users', userId, 'cadeiras', cadeiraId, 'presencas', 'dados'), { marcas: { [chave]: marca } }, { merge: true });
  }

  async function limpar(ev) {
    const userId = getAuth().currentUser?.uid;
    const chave = chaveAula(ev);
    if (!userId || !chave) return;
    await setDoc(doc(db, 'users', userId, 'cadeiras', ev.cadeira, 'presencas', 'dados'), { marcas: { [chave]: deleteField() } }, { merge: true });
  }

  const carregado = Object.keys(porCadeira).length === idsCadeiras.length;

  return { marcas, porCadeira, notasAulas, notasAulasPorCadeira: notasPorCadeira, carregado, marcar, limpar, atualizarMarca, guardarNotasAula };
}
