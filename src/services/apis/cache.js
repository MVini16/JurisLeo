// gaveta efémera: respostas das apis de fora guardadas em localStorage, com prazo de validade
// se o iphone limpar isto, não se perde nada dela — volta-se a pedir
// lógica pura: armazenamento e relógio entram por parâmetro, para testar sem o browser

export const PREFIXO_CACHE = 'jurisleo-cache:';

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

// devolve { dados, guardadoEm, expirado } ou null — os expirados também vêm,
// para sem internet se poder mostrar o último valor com "atualizado há X"
export function lerCache(chave, { storage = armazenamentoPadrao(), agora = Date.now() } = {}) {
  try {
    const bruto = storage?.getItem(PREFIXO_CACHE + chave);
    if (!bruto) return null;
    const { dados, guardadoEm, expiraEm } = JSON.parse(bruto);
    if (typeof guardadoEm !== 'number' || typeof expiraEm !== 'number') return null;
    return { dados, guardadoEm, expirado: agora >= expiraEm };
  } catch {
    return null;
  }
}

// devolve true se guardou; cheio ou bloqueado (modo privado) não rebenta, só não guarda
export function guardarCache(chave, dados, validadeMs, { storage = armazenamentoPadrao(), agora = Date.now() } = {}) {
  try {
    if (!storage) return false;
    storage.setItem(PREFIXO_CACHE + chave, JSON.stringify({ dados, guardadoEm: agora, expiraEm: agora + validadeMs }));
    return true;
  } catch {
    return false;
  }
}

// junta cache e pedido: pedirFn é uma função sem argumentos que devolve o formato do cliente.js
// devolve { dados, guardadoEm, daCache, erro, tentarDepois } — dados é null se não houver nada para mostrar;
// com dados E erro, é a versão antiga guardada, e o ecrã mostra as duas coisas
export async function comCache(chave, validadeMs, pedirFn, { storage = armazenamentoPadrao(), agora = () => Date.now() } = {}) {
  const guardado = lerCache(chave, { storage, agora: agora() });
  if (guardado && !guardado.expirado) {
    return { dados: guardado.dados, guardadoEm: guardado.guardadoEm, daCache: true, erro: null, tentarDepois: null };
  }

  const resposta = await pedirFn();
  if (resposta.ok) {
    const momento = agora();
    guardarCache(chave, resposta.dados, validadeMs, { storage, agora: momento });
    return { dados: resposta.dados, guardadoEm: momento, daCache: false, erro: null, tentarDepois: null };
  }

  return {
    dados: guardado ? guardado.dados : null,
    guardadoEm: guardado ? guardado.guardadoEm : null,
    daCache: Boolean(guardado),
    erro: resposta.erro,
    tentarDepois: resposta.tentarDepois ?? null,
  };
}
