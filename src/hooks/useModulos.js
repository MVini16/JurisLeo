// liga a ui às escolhas da leonor sobre o que ver — configuracoes/dados.modulos e .dashboardOrdem
// sem escolhas guardadas, tudo fica como o registo manda (nenhuma migração)
import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, onSnapshot, setDoc, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { estadoModulos, ordemCartoes, moverCartao } from '../services/modulos.js';

export function useModulos() {
  const [guardados, setGuardados] = useState({});
  const [ordemGuardada, setOrdemGuardada] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'configuracoes', 'dados'), (snap) => {
      const dados = snap.data() || {};
      setGuardados(dados.modulos || {});
      setOrdemGuardada(dados.dashboardOrdem || null);
      setCarregado(true);
    });
    return () => unsub();
  }, []);

  const ativos = useMemo(() => estadoModulos(guardados), [guardados]);
  const ordem = useMemo(() => ordemCartoes(ordemGuardada), [ordemGuardada]);

  const gravar = useCallback((campos) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return Promise.resolve();
    return setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), campos, { merge: true });
  }, []);

  const alternar = useCallback((id) => gravar({ modulos: { [id]: !ativos[id] } }), [gravar, ativos]);
  const mover = useCallback((id, direcao) => gravar({ dashboardOrdem: moverCartao(ordem, id, direcao) }), [gravar, ordem]);
  // repor = apagar as escolhas, para voltar aos defeitos do registo
  const repor = useCallback(() => gravar({ modulos: deleteField(), dashboardOrdem: deleteField() }), [gravar]);

  return { ativos, ordem, carregado, alternar, mover, repor };
}
