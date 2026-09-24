// procura uma palavra no wikcionário e na wikipédia ao mesmo tempo (as duas com cache)
// só pede quando ela carrega em "significado" ou "procurar"; nunca enquanto escreve
import { useState, useRef, useEffect, useCallback } from 'react';
import { pedirSignificado, pedirResumo, limparTermo } from '../services/apis/wikimedia.js';

const VAZIO = { dados: null, erro: null, tentarDepois: null };

export function useSignificado() {
  const [estado, setEstado] = useState({ termo: '', aCarregar: false, dicionario: VAZIO, wikipedia: VAZIO });
  const montado = useRef(true);
  // se ela procurar outra palavra antes de a primeira chegar, só a última conta
  const ultimoPedido = useRef(0);

  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const procurar = useCallback(async (termo) => {
    const limpo = limparTermo(termo);
    const numero = ++ultimoPedido.current;
    setEstado({ termo: limpo, aCarregar: true, dicionario: VAZIO, wikipedia: VAZIO });
    const [dic, wiki] = await Promise.all([pedirSignificado(limpo), pedirResumo(limpo)]);
    if (!montado.current || numero !== ultimoPedido.current) return;
    const arrumar = (r) => ({ dados: r.dados, erro: r.dados ? null : r.erro, tentarDepois: r.tentarDepois });
    setEstado({ termo: limpo, aCarregar: false, dicionario: arrumar(dic), wikipedia: arrumar(wiki) });
  }, []);

  return { ...estado, procurar };
}
