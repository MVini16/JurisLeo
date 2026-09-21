// registo diário de bem-estar: users/{uid}/registosDiarios/{aaaa-mm-dd}, e os campos opcionais que ela ligou
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../services/firebase.js';
import { collection, doc, onSnapshot, query, where, documentId, setDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { chaveData } from '../data/feriados.js';

const DIAS_DE_HISTORICO = 100;

export function useBemEstar() {
  const [registos, setRegistos] = useState({});
  const [camposGuardados, setCamposGuardados] = useState({});
  const [loading, setLoading] = useState(() => !!getAuth().currentUser);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return undefined;
    const desde = new Date();
    desde.setDate(desde.getDate() - DIAS_DE_HISTORICO);
    // um só filtro, pelo id (a data): não precisa de índice composto
    const consulta = query(collection(db, 'users', userId, 'registosDiarios'), where(documentId(), '>=', chaveData(desde)));
    const unsub = onSnapshot(consulta, (snap) => {
      const mapa = {};
      snap.docs.forEach((d) => { mapa[d.id] = d.data(); });
      setRegistos(mapa);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return undefined;
    const unsub = onSnapshot(doc(db, 'users', userId, 'configuracoes', 'dados'), (snap) => {
      setCamposGuardados(snap.data()?.bemEstarCampos || {});
    });
    return () => unsub();
  }, []);

  const camposAtivos = useMemo(() => Object.keys(camposGuardados).filter((id) => camposGuardados[id]), [camposGuardados]);

  const guardar = useCallback(async (chave, janela, dados) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    await setDoc(doc(db, 'users', userId, 'registosDiarios', chave), {
      apagado: false,
      [janela]: { ...dados, preenchidoEm: serverTimestamp() },
    }, { merge: true });
  }, []);

  // apagar: o dia fica marcado como apagado, sem o conteúdo em lado nenhum (spec 25.11)
  const apagar = useCallback(async (chave) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('sem sessão');
    await setDoc(doc(db, 'users', userId, 'registosDiarios', chave), {
      apagado: true,
      apagadoEm: serverTimestamp(),
      manha: deleteField(),
      noite: deleteField(),
    }, { merge: true });
  }, []);

  const alternarCampo = useCallback(async (id) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), { bemEstarCampos: { [id]: !camposGuardados[id] } }, { merge: true });
  }, [camposGuardados]);

  return { registos, camposAtivos, loading, guardar, apagar, alternarCampo };
}
