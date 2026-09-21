// hooks da consola do Vini: quem está a entrar e os dados dela, lidos de uma vez (não em tempo real)
// ler em direto todas as coleções gasta leituras do firestore; aqui lê-se ao abrir e quando ele atualiza
import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';
import { EMAIL_ADMIN, UID_DA_LEONOR } from '../data/consola.js';

const COLECOES = ['cadeiras', 'tarefas', 'sessoesEstudo', 'anotacoes', 'casos', 'flashcards', 'eventos', 'registosDiarios'];

// fases: a-verificar | sem-sessao | nao-admin | email-por-verificar | admin
export function useAcessoAdmin() {
  const [acesso, setAcesso] = useState({ fase: 'a-verificar', utilizador: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) setAcesso({ fase: 'sem-sessao', utilizador: null });
      else if (u.email !== EMAIL_ADMIN) setAcesso({ fase: 'nao-admin', utilizador: u });
      else setAcesso({ fase: u.emailVerified ? 'admin' : 'email-por-verificar', utilizador: u });
    });
    return unsub;
  }, []);

  return acesso;
}

export function useDadosDela(ativo) {
  const [estado, setEstado] = useState({ dados: null, loading: false, erro: '', lidoEm: null });

  const carregar = useCallback(async () => {
    if (!UID_DA_LEONOR) return;
    setEstado((e) => ({ ...e, loading: true, erro: '' }));
    try {
      const base = ['users', UID_DA_LEONOR];
      const listas = await Promise.all(COLECOES.map(async (nome) => {
        const snap = await getDocs(collection(db, ...base, nome));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }));
      const [cadeiras, tarefas, sessoes, anotacoes, casos, flashcards, eventos, listaRegistos] = listas;
      const registosDiarios = Object.fromEntries(listaRegistos.map(({ id, ...resto }) => [id, resto]));

      const faltas = {};
      const avaliacoes = {};
      await Promise.all(cadeiras.map(async (c) => {
        const [f, a] = await Promise.all([
          getDoc(doc(db, ...base, 'cadeiras', c.id, 'faltas', 'dados')),
          getDoc(doc(db, ...base, 'cadeiras', c.id, 'avaliacao', 'dados')),
        ]);
        faltas[c.id] = f.data() || {};
        avaliacoes[c.id] = a.data() || {};
      }));

      setEstado({ dados: { cadeiras, faltas, avaliacoes, tarefas, sessoes, anotacoes, casos, flashcards, eventos, registosDiarios }, loading: false, erro: '', lidoEm: new Date() });
    } catch (e) {
      setEstado((prev) => ({ ...prev, loading: false, erro: e?.code === 'permission-denied' ? 'permissao' : 'falhou' }));
    }
  }, []);

  useEffect(() => {
    if (ativo) carregar();
  }, [ativo, carregar]);

  return { ...estado, carregar };
}
