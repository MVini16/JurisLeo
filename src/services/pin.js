// pin da consola — lógica pura; o armazenamento entra por parâmetro
// o pin protege o caso real de o telemóvel ou o pc ficarem abertos na conta dele.
// não é criptografia forte: seis dígitos num frontend quebram-se depressa. a segurança de verdade
// está nas regras do firestore (só a conta dele lê os dados dela).
// hash sha-256 com sal aleatório, guardado só neste aparelho (localStorage)

export const TAMANHO_PIN = 6;
export const MAX_TENTATIVAS = 3;
export const BLOQUEIO_MS = 60 * 60 * 1000;
export const INATIVIDADE_MS = 15 * 60 * 1000;

const CHAVE_CREDENCIAL = 'jurisleo-consola-pin';
const CHAVE_BLOQUEIO = 'jurisleo-consola-bloqueio';

export function pinValido(pin) {
  return new RegExp(`^\\d{${TAMANHO_PIN}}$`).test(String(pin ?? ''));
}

function paraHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function gerarSal() {
  return paraHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPin(pin, sal) {
  const dados = new TextEncoder().encode(`${sal}:${pin}`);
  const resumo = await globalThis.crypto.subtle.digest('SHA-256', dados);
  return paraHex(new Uint8Array(resumo));
}

export async function criarCredencial(pin) {
  const sal = gerarSal();
  return { sal, hash: await hashPin(pin, sal) };
}

export async function verificarPin(pin, credencial) {
  if (!credencial?.sal || !credencial?.hash || !pinValido(pin)) return false;
  return (await hashPin(pin, credencial.sal)) === credencial.hash;
}

// --- bloqueio depois de tentativas erradas ---
export function estadoInicialBloqueio() {
  return { tentativas: 0, bloqueadoAte: 0 };
}

export function estaBloqueado(estado, agora = Date.now()) {
  return (estado?.bloqueadoAte || 0) > agora;
}

export function minutosDeBloqueio(estado, agora = Date.now()) {
  return Math.max(0, Math.ceil(((estado?.bloqueadoAte || 0) - agora) / 60000));
}

// depois de um pin errado; à terceira tentativa bloqueia uma hora
export function aposTentativaErrada(estado, agora = Date.now()) {
  const tentativas = (estado?.tentativas || 0) + 1;
  if (tentativas >= MAX_TENTATIVAS) return { tentativas: 0, bloqueadoAte: agora + BLOQUEIO_MS };
  return { tentativas, bloqueadoAte: 0 };
}

export function sessaoExpirada(ultimaAtividade, agora = Date.now()) {
  return agora - ultimaAtividade >= INATIVIDADE_MS;
}

// --- armazenamento (localStorage ou um falso, nos testes) ---
function lerJson(storage, chave) {
  try {
    return JSON.parse(storage?.getItem(chave) || 'null');
  } catch {
    return null;
  }
}

export function lerCredencial(storage) {
  const c = lerJson(storage, CHAVE_CREDENCIAL);
  return c?.sal && c?.hash ? c : null;
}

export function guardarCredencial(storage, credencial) {
  storage.setItem(CHAVE_CREDENCIAL, JSON.stringify(credencial));
}

export function lerBloqueio(storage) {
  const b = lerJson(storage, CHAVE_BLOQUEIO);
  return b && typeof b.tentativas === 'number' ? b : estadoInicialBloqueio();
}

export function guardarBloqueio(storage, estado) {
  storage.setItem(CHAVE_BLOQUEIO, JSON.stringify(estado));
}
