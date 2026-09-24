// divisórias do caderno de cada cadeira — configuracoes/dados.divisorias = { [cadeiraId]: [{ id, nome, cor }] }
// as de base (teóricas e práticas) não se guardam: vêm sempre de services/cadernos.js
// também grava a ordem das páginas (campo ordem de cada anotação), numa só escrita
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { divisoriasDaCadeira, criarDivisoria, DIVISORIAS_BASE } from '../services/cadernos.js';

export function useDivisorias() {
  const [guardadas, setGuardadas] = useState({});

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'configuracoes', 'dados'), (snap) => {
      const dados = snap.data()?.divisorias;
      setGuardadas(dados && typeof dados === 'object' ? dados : {});
    });
    return () => unsub();
  }, []);

  const daCadeira = useCallback((cadeiraId) => divisoriasDaCadeira(guardadas, cadeiraId), [guardadas]);

  // só as dela (sem as de base), que são as que se guardam
  const gravar = useCallback((cadeiraId, proprias) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return Promise.resolve();
    return setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), { divisorias: { [cadeiraId]: proprias } }, { merge: true });
  }, []);

  const proprias = useCallback(
    (cadeiraId) => daCadeira(cadeiraId).filter((d) => !DIVISORIAS_BASE.some((b) => b.id === d.id)),
    [daCadeira],
  );

  // devolve a divisória criada (ou null se o nome estiver vazio)
  const adicionar = useCallback((cadeiraId, nome) => {
    const nova = criarDivisoria(nome, daCadeira(cadeiraId));
    if (!nova) return null;
    gravar(cadeiraId, [...proprias(cadeiraId), nova]);
    return nova;
  }, [daCadeira, proprias, gravar]);

  // as páginas de uma divisória apagada passam a aparecer nas teóricas (não se perde nada)
  const apagar = useCallback((cadeiraId, id) => gravar(cadeiraId, proprias(cadeiraId).filter((d) => d.id !== id)), [proprias, gravar]);

  // ordens = [{ id, ordem }] de moverPagina, gravadas todas de uma vez
  const gravarOrdem = useCallback((ordens) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId || !ordens?.length) return Promise.resolve();
    const lote = writeBatch(db);
    for (const { id, ordem } of ordens) lote.update(doc(db, 'users', userId, 'anotacoes', id), { ordem });
    return lote.commit();
  }, []);

  return { daCadeira, adicionar, apagar, gravarOrdem };
}
