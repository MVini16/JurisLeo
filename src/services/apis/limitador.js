// travões para não rebentar os limites dos serviços gratuitos — genérico:
// os números de cada serviço (20 por minuto, 5000 caracteres por dia...) ficam no ficheiro dessa api
import { chaveData } from '../../data/feriados.js';

// ─── por minuto, em memória (ex. languagetool) ───────────────────────────────
// janela deslizante: conta os pedidos dos últimos 60 s, não os do "minuto do relógio"
export function criarLimitadorPorMinuto(maximo, { janelaMs = 60 * 1000, relogio = () => Date.now() } = {}) {
  let marcas = [];

  function limpar(agora) {
    marcas = marcas.filter((t) => agora - t < janelaMs);
  }

  return {
    podePedir() {
      limpar(relogio());
      return marcas.length < maximo;
    },
    // verifica e conta de uma vez; false quer dizer que o botão deve ficar desativado
    tentar() {
      const agora = relogio();
      limpar(agora);
      if (marcas.length >= maximo) return false;
      marcas.push(agora);
      return true;
    },
    // milissegundos até haver lugar outra vez (0 se já há)
    livreEm() {
      const agora = relogio();
      limpar(agora);
      if (marcas.length < maximo) return 0;
      return marcas[0] + janelaMs - agora;
    },
  };
}

// ─── por dia, em localStorage (ex. caracteres do mymemory) ───────────────────
export const PREFIXO_USO = 'jurisleo-uso:';

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

// quanto já se gastou hoje; noutro dia (depois da meia-noite, hora de lisboa do telemóvel) volta a 0
export function lerUsoDoDia(chave, { storage = armazenamentoPadrao(), agora = new Date() } = {}) {
  try {
    const guardado = JSON.parse(storage?.getItem(PREFIXO_USO + chave) || 'null');
    if (!guardado || guardado.dia !== chaveData(agora) || typeof guardado.usado !== 'number') return 0;
    return guardado.usado;
  } catch {
    return 0;
  }
}

export function cabeNoDia(chave, quantidade, maximo, deps = {}) {
  return lerUsoDoDia(chave, deps) + quantidade <= maximo;
}

// soma ao gasto de hoje e devolve o novo total; storage bloqueado não rebenta
export function registarUsoDoDia(chave, quantidade, { storage = armazenamentoPadrao(), agora = new Date() } = {}) {
  const usado = lerUsoDoDia(chave, { storage, agora }) + quantidade;
  try {
    storage?.setItem(PREFIXO_USO + chave, JSON.stringify({ dia: chaveData(agora), usado }));
  } catch {
    // sem storage o contador não sobrevive a fechar a app — o serviço trava-nos na mesma com um 429
  }
  return usado;
}
