// cópia do que só está guardado no telemóvel (localStorage): preferências, recordes e selos dos jogos, série de estudo, etc.
// serve para não perder nada quando se instala a app de novo. lógica pura: recebe o "storage" como argumento, para testar sem browser

const PREFIXO = 'jurisleo-';
// estas chaves não se copiam: dizem respeito a esta instalação e não ao que a Leonor guardou
const IGNORAR = ['jurisleo-versao-vista', 'jurisleo-versao-adiado'];
export const FORMATO = 'jurisleo-copia-local-v1';

function chavesDe(storage) {
  const chaves = [];
  for (let i = 0; i < storage.length; i += 1) {
    const chave = storage.key(i);
    if (chave?.startsWith(PREFIXO) && !IGNORAR.includes(chave)) chaves.push(chave);
  }
  return chaves.sort();
}

// devolve o texto (json) com tudo o que vale a pena guardar
export function recolherCopia(storage) {
  const dados = {};
  chavesDe(storage).forEach((chave) => { dados[chave] = storage.getItem(chave); });
  return JSON.stringify({ formato: FORMATO, dados });
}

// repõe a cópia: só aceita o formato certo e só chaves da app. devolve quantas chaves repôs, ou um erro legível
export function restaurarCopia(storage, texto) {
  let lido;
  try { lido = JSON.parse(String(texto ?? '').trim()); } catch { return { ok: false, erro: 'Esse texto não é uma cópia do JurisLeo.' }; }
  if (!lido || lido.formato !== FORMATO || typeof lido.dados !== 'object' || lido.dados === null) {
    return { ok: false, erro: 'Esse texto não é uma cópia do JurisLeo.' };
  }
  let repostas = 0;
  Object.entries(lido.dados).forEach(([chave, valor]) => {
    if (!chave.startsWith(PREFIXO) || IGNORAR.includes(chave) || typeof valor !== 'string') return;
    storage.setItem(chave, valor);
    repostas += 1;
  });
  return repostas === 0 ? { ok: false, erro: 'A cópia está vazia.' } : { ok: true, repostas };
}
