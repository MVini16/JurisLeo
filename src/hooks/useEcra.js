// liga o ecrã de início editável ao firestore — configuracoes/dados.ecra
// uma conta sem ecrã guardado começa pelo inicial, respeitando os cartões que ela
// já tinha ligado ou desligado (data/modulos.js), sem precisar de migração
import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, onSnapshot, setDoc, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase.js';
import { semEsperar } from '../services/escritas.js';
import { estadoModulos } from '../services/modulos.js';
import { normalizarEcra, ecraDosModulos } from '../services/ecra.js';

export function useEcra() {
  const [guardado, setGuardado] = useState(null);
  const [modulos, setModulos] = useState({});
  // sem sessão não há nada a esperar
  const [carregado, setCarregado] = useState(() => !getAuth().currentUser);

  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId, 'configuracoes', 'dados'), (snap) => {
      const dados = snap.data() || {};
      setGuardado(dados.ecra || null);
      setModulos(dados.modulos || {});
      setCarregado(true);
    }, () => setCarregado(true));
    return () => unsub();
  }, []);

  const ecra = useMemo(
    () => (guardado ? normalizarEcra(guardado) : ecraDosModulos(estadoModulosSoEscolhas(modulos))),
    [guardado, modulos],
  );

  // grava logo na cache local (o onSnapshot devolve-o de imediato) e sobe quando houver rede
  const gravar = useCallback((novo) => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setGuardado(novo);
    semEsperar(setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), { ecra: novo }, { merge: true }));
  }, []);

  const repor = useCallback(() => {
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    setGuardado(null);
    semEsperar(setDoc(doc(db, 'users', userId, 'configuracoes', 'dados'), { ecra: deleteField() }, { merge: true }));
  }, []);

  return { ecra, carregado, gravar, repor };
}

// só as escolhas que ela fez de facto (true/false); os defeitos do registo não contam como escolha
function estadoModulosSoEscolhas(guardados) {
  const todos = estadoModulos(guardados);
  return Object.fromEntries(Object.keys(guardados).map((id) => [id, todos[id]]));
}
