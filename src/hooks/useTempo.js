// tempo e avisos de lisboa (ipma) para o dashboard — sem firestore, só pedidos com cache em localStorage
// atualiza ao abrir, quando a rede volta e quando ela regressa à app (a cache evita pedidos a mais)
import { useState, useEffect } from 'react';
import { pedirPrevisao, pedirAvisos, avisosAtivos } from '../services/apis/ipma.js';

export function useTempo() {
  // inicializador em função: corre uma só vez, por isso o Date.now() aqui é permitido
  const [estado, setEstado] = useState(() => ({
    previsao: null,
    avisos: [],
    guardadoEm: null,
    erro: null,
    tentarDepois: null,
    aCarregar: true,
    agora: Date.now(),
  }));

  useEffect(() => {
    // evita mexer no estado depois de a página fechar, se o pedido acabar tarde
    let ativo = true;

    async function atualizar() {
      const [previsao, avisos] = await Promise.all([pedirPrevisao(), pedirAvisos()]);
      if (!ativo) return;
      setEstado({
        previsao: previsao.dados,
        // os avisos filtram-se aqui (e não no render) porque dependem da hora de agora
        avisos: avisosAtivos(avisos.dados),
        guardadoEm: previsao.guardadoEm,
        // o erro que conta é o da previsão; um aviso que falha não estraga o cartão
        erro: previsao.erro,
        tentarDepois: previsao.tentarDepois,
        aCarregar: false,
        // o momento desta atualização, para o cartão não chamar Date.now() no render
        agora: Date.now(),
      });
    }

    function aoVoltar() {
      if (document.visibilityState === 'visible') atualizar();
    }

    atualizar();
    window.addEventListener('online', atualizar);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      ativo = false;
      window.removeEventListener('online', atualizar);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, []);

  return estado;
}
