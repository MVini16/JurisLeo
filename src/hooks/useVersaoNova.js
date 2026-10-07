// vê se há uma versão nova da app no servidor (/versao.json) e se há novidades para mostrar depois de atualizar.
// só guarda no localStorage a última versão vista e o "lembra-me mais tarde"; não toca no firebase
import { useCallback, useEffect, useState } from 'react';
import { NOVIDADES, VERSAO_ATUAL } from '../data/novidades.js';
import {
  ADIAR_MS, VERIFICAR_CADA_MS, deveMostrarNovidades, estaAdiado, lerVersaoDoServidor, precisaDeAtualizar,
} from '../services/atualizacao.js';

const CHAVE_VISTA = 'jurisleo-versao-vista';
const CHAVE_CHECKIN = 'jurisleo-boneco-checkin';
const CHAVE_ADIADO = 'jurisleo-versao-adiado';

function ler(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}
function guardar(chave, valor) {
  try { localStorage.setItem(chave, String(valor)); } catch { /* sem localstorage, volta a perguntar */ }
}

export function useVersaoNova() {
  // há uma versão mais nova no servidor: { versao, titulo, itens } ou null
  const [aviso, setAviso] = useState(null);
  // acabou de atualizar: as novidades desta versão, uma vez (na primeira abertura nunca mostra nada)
  const [novidades, setNovidades] = useState(() => {
    const vista = ler(CHAVE_VISTA);
    if (!vista) { guardar(CHAVE_VISTA, VERSAO_ATUAL); return null; }
    return deveMostrarNovidades({ vista, atual: VERSAO_ATUAL }) ? NOVIDADES[0] : null;
  });

  useEffect(() => {
    let vivo = true;
    async function ver() {
      try {
        const resposta = await fetch(`/versao.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!resposta.ok) return;
        const servidor = lerVersaoDoServidor(await resposta.json());
        if (!vivo || !servidor) return;
        const adiado = Number(ler(CHAVE_ADIADO)) || 0;
        setAviso(precisaDeAtualizar({ local: VERSAO_ATUAL, servidor: servidor.versao }) && !estaAdiado(adiado, Date.now()) ? servidor : null);
      } catch { /* sem rede ou sem ficheiro (por exemplo em desenvolvimento): não avisa */ }
    }
    ver();
    const id = setInterval(ver, VERIFICAR_CADA_MS);
    const aoVoltar = () => { if (document.visibilityState === 'visible') ver(); };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => { vivo = false; clearInterval(id); document.removeEventListener('visibilitychange', aoVoltar); };
  }, []);

  const adiar = useCallback(() => {
    guardar(CHAVE_ADIADO, Date.now() + ADIAR_MS);
    setAviso(null);
  }, []);

  const dispensarNovidades = useCallback(() => {
    guardar(CHAVE_VISTA, VERSAO_ATUAL);
    // o boneco pergunta mais tarde o que ela achou e como está (ver checkInPendente)
    guardar(CHAVE_CHECKIN, JSON.stringify({ versao: VERSAO_ATUAL, desde: Date.now(), feito: false }));
    setNovidades(null);
  }, []);

  return { aviso, novidades, adiar, dispensarNovidades };
}
