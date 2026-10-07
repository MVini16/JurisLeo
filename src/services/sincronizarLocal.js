// copia automática do que só está no telemóvel (escolhas, séries, recordes, guardados...) para a conta dela, e traz de volta.
// lógica pura, sem firebase nem react: recebe o storage como argumento. ganha sempre a versão mais recente de cada chave.
// vai para o documento que já existia (configuracoes/dados, campo copiaLocal): não cria coleções nem mexe nas regras

export const PREFIXO = 'jurisleo-';
export const CHAVE_META = 'jurisleo-sync-meta';
// não se copiam: dizem respeito a esta instalação ou à consola do vini, não ao que a leonor guardou
const IGNORAR = new Set(['jurisleo-versao-vista', 'jurisleo-versao-adiado', 'jurisleo-boneco-checkin', 'jurisleo-admin-resumos', 'jurisleo-theme']);
export const MAX_VALOR = 100000;

export function copiavel(chave) {
  return typeof chave === 'string' && chave.startsWith(PREFIXO) && !chave.startsWith('jurisleo-sync-') && !IGNORAR.has(chave);
}

export function hash(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i += 1) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return String(h);
}

function chavesDe(storage) {
  const chaves = [];
  for (let i = 0; i < storage.length; i += 1) {
    const chave = storage.key(i);
    if (copiavel(chave)) chaves.push(chave);
  }
  return chaves.sort();
}

export function lerMeta(storage) {
  try { return JSON.parse(storage.getItem(CHAVE_META)) ?? {}; } catch { return {}; }
}
export function guardarMeta(storage, meta) {
  try { storage.setItem(CHAVE_META, JSON.stringify(meta)); } catch { /* sem espaço, esquece */ }
}

// regista as chaves que mudaram desde a última vez (hash diferente) com a hora de agora
export function atualizarMeta(storage, meta, agora) {
  const novo = { ...meta };
  chavesDe(storage).forEach((chave) => {
    const valor = storage.getItem(chave);
    if (valor === null || valor.length > MAX_VALOR) return;
    const h = hash(valor);
    if (!novo[chave] || novo[chave].h !== h) novo[chave] = { h, em: agora };
  });
  return novo;
}

// compara com o que está na nuvem: o que for mais recente na nuvem aplica-se aqui; o resto sobe
export function planear(storage, meta, remoto = {}) {
  const aplicar = {};
  const enviar = {};
  const todas = new Set([...chavesDe(storage), ...Object.keys(remoto).filter(copiavel)]);
  todas.forEach((chave) => {
    const local = meta[chave];
    const nuvem = remoto[chave];
    const valorLocal = storage.getItem(chave);
    const temLocal = local && valorLocal !== null;
    const nuvemValida = nuvem && typeof nuvem.v === 'string' && Number.isFinite(nuvem.em) && nuvem.v.length <= MAX_VALOR;
    if (nuvemValida && (!temLocal || nuvem.em > local.em)) {
      if (!temLocal || hash(nuvem.v) !== local.h) aplicar[chave] = { v: nuvem.v, em: nuvem.em };
    } else if (temLocal && (!nuvemValida || local.em > nuvem.em)) {
      enviar[chave] = { v: valorLocal, em: local.em };
    }
  });
  return { aplicar, enviar };
}

// escreve no storage o que veio da nuvem e actualiza o meta, para não ser enviado de volta
export function aplicarDaNuvem(storage, meta, aplicar) {
  const novo = { ...meta };
  Object.entries(aplicar).forEach(([chave, { v, em }]) => {
    try { storage.setItem(chave, v); novo[chave] = { h: hash(v), em }; } catch { /* sem espaço, esquece */ }
  });
  return novo;
}
