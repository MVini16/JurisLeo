// lógica pura das brincadeiras (barney e provocações do vini) — sem react nem firebase,
// para dar para testar com vitest sem mocks

// espaço mínimo entre duas brincadeiras "soltas" (as garantidas ignoram isto)
export const COOLDOWN_GLOBAL_MS = 90 * 1000;

// decide se uma brincadeira pode aparecer agora
// - garantido: aparece sempre que o momento acontece (ex: nota alta), ignora o cooldown global
// - probabilidade: de 0 a 1, para as que só saltam de vez em quando
export function podeDisparar({
  ativo,
  agora,
  ultimoGlobal = 0,
  ultimoLocal = 0,
  cooldownLocalMs = 0,
  probabilidade = 1,
  garantido = false,
  aleatorio = Math.random(),
}) {
  if (!ativo) return false;
  if (garantido) return true;
  if (agora - ultimoGlobal < COOLDOWN_GLOBAL_MS) return false;
  if (agora - ultimoLocal < cooldownLocalMs) return false;
  return aleatorio < probabilidade;
}

// escolhe um item da lista sem repetir o último (se houver mais do que um)
export function escolherSemRepetir(lista, ultimo, aleatorio = Math.random()) {
  if (lista.length === 0) return null;
  const candidatas = (lista.length > 1 && ultimo != null) ? lista.filter((item) => item !== ultimo) : lista;
  return candidatas[Math.min(Math.floor(aleatorio * candidatas.length), candidatas.length - 1)];
}

// conta toques seguidos (o segredo do barney: 3 toques em 1,5 segundos)
// devolve o novo estado e se o segredo ficou completo
export function registarToque(estado, agora, { janelaMs = 1500, alvo = 3 } = {}) {
  const recentes = (estado?.toques || []).filter((t) => agora - t <= janelaMs);
  recentes.push(agora);
  if (recentes.length >= alvo) return { toques: [], completo: true };
  return { toques: recentes, completo: false };
}

// soma tempo de escrita "a sério": só conta se a última tecla foi há pouco
export function acumularEscrita({ ativoMs, ultimaTecla, agora, passoMs = 15000, ociosoMs = 20000 }) {
  const aEscrever = ultimaTecla != null && agora - ultimaTecla < ociosoMs;
  return aEscrever ? ativoMs + passoMs : ativoMs;
}
