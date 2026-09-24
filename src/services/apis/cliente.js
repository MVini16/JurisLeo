// o pedido único que todas as apis de fora usam — nunca rebenta, devolve sempre o mesmo formato:
// { ok, dados, erro, tentarDepois }, com erro a ser uma chave de src/data/errosApi.js (ou null)
// lógica pura: fetch, espera, rede e relógio entram por parâmetro, para testar sem o browser

export const TIMEOUT_MS = 8000;
export const ESPERA_REPETICAO_MS = 1000;

// o retry-after pode vir em segundos ("120") ou como data http ("Wed, 24 Sep 2026 10:00:00 GMT")
export function lerRetryAfter(valor, agora = Date.now()) {
  if (valor == null || String(valor).trim() === '') return null;
  const segundos = Number(valor);
  if (Number.isFinite(segundos)) return new Date(agora + Math.max(0, segundos) * 1000);
  const data = Date.parse(valor);
  return Number.isNaN(data) ? null : new Date(data);
}

function esperarPadrao(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

// sem navigator (testes, servidor) assume-se que há rede
function onlinePadrao() {
  return globalThis.navigator?.onLine !== false;
}

// uma tentativa só; o corpo também é lido dentro do tempo limite, senão uma resposta lenta ficava pendurada
async function tentar(url, opcoes, { fetch, timeoutMs, agora }) {
  const { formato = 'json', ...opcoesFetch } = opcoes;
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  try {
    const resposta = await fetch(url, { ...opcoesFetch, signal: controlador.signal });
    // 429: o serviço pediu para parar — nunca se repete
    if (resposta.status === 429) {
      return { fim: true, erro: 'limite', tentarDepois: lerRetryAfter(resposta.headers?.get?.('Retry-After'), agora()) };
    }
    if (resposta.status >= 500) return { repetir: true };
    // 404: o que se procurou não existe (ex. uma palavra sem página) — não é culpa do serviço
    if (resposta.status === 404) return { fim: true, erro: 'naoEncontrado' };
    // outros 4xx: o pedido está mal feito, repetir não muda nada
    if (!resposta.ok) return { fim: true, erro: 'respostaInvalida' };
    try {
      const dados = formato === 'texto' ? await resposta.text() : await resposta.json();
      return { fim: true, dados };
    } catch (e) {
      if (e?.name === 'AbortError') return { repetir: true };
      return { fim: true, erro: 'respostaInvalida' };
    }
  } catch {
    // timeout (abort) ou falha de rede: vale a pena uma segunda tentativa
    return { repetir: true };
  } finally {
    clearTimeout(temporizador);
  }
}

export async function pedir(url, opcoes = {}, deps = {}) {
  const {
    fetch = (...args) => globalThis.fetch(...args),
    esperar = esperarPadrao,
    online = onlinePadrao,
    timeoutMs = TIMEOUT_MS,
    agora = () => Date.now(),
  } = deps;

  if (!online()) return { ok: false, dados: null, erro: 'semLigacao', tentarDepois: null };

  let resultado = await tentar(url, opcoes, { fetch, timeoutMs, agora });
  // 5xx ou timeout: repete uma vez, ao fim de 1 segundo
  if (resultado.repetir) {
    await esperar(ESPERA_REPETICAO_MS);
    resultado = await tentar(url, opcoes, { fetch, timeoutMs, agora });
  }

  if (resultado.repetir) {
    // se a rede caiu entretanto, é "sem ligação" e não culpa do serviço
    return { ok: false, dados: null, erro: online() ? 'servicoEmBaixo' : 'semLigacao', tentarDepois: null };
  }
  if (resultado.erro) return { ok: false, dados: null, erro: resultado.erro, tentarDepois: resultado.tentarDepois ?? null };
  return { ok: true, dados: resultado.dados, erro: null, tentarDepois: null };
}
