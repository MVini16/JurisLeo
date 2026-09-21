// preferências deste aparelho (animações e abertura da app) — guardadas em localStorage
// ficam aqui e não no firestore porque têm de valer antes de ela entrar na conta
// lógica pura: o armazenamento entra por parâmetro, para testar sem o browser
export const CHAVE_PREFERENCIAS = 'jurisleo-preferencias';

export const PADROES = { animacoes: 'on', abertura: 'dia', frases: 'misto', series: 'on' };

const VALIDOS = {
  animacoes: ['on', 'off'],
  abertura: ['dia', 'sempre', 'curta', 'nunca'],
  frases: ['misto', 'originais', 'citacoes'],
  series: ['on', 'off'],
};

export const OPCOES_ABERTURA = [
  { id: 'dia', nome: 'Completa uma vez por dia', descricao: 'A primeira abertura do dia é a completa, as seguintes são rápidas.' },
  { id: 'sempre', nome: 'Sempre completa', descricao: 'Todas as vezes que abres a app.' },
  { id: 'curta', nome: 'Sempre rápida', descricao: 'A mesma animação, mais depressa.' },
  { id: 'nunca', nome: 'Sem abertura', descricao: 'Vais direta para a app.' },
];

export const OPCOES_FRASES = [
  { id: 'misto', nome: 'Misturadas', descricao: 'As frases do Vini e citações com fonte, sem repetir.' },
  { id: 'originais', nome: 'Só as do Vini', descricao: 'As frases escritas para ti.' },
  { id: 'citacoes', nome: 'Só citações', descricao: 'Brocardos, juristas e falas com fonte.' },
];

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

// lê e valida: um valor estranho volta ao padrão
export function lerPreferencias(storage = armazenamentoPadrao()) {
  const guardadas = {};
  try {
    Object.assign(guardadas, JSON.parse(storage?.getItem(CHAVE_PREFERENCIAS) || '{}'));
  } catch {
    // ficheiro estragado ou sem armazenamento: usa os padrões
  }
  const prefs = { ...PADROES };
  for (const chave of Object.keys(VALIDOS)) {
    if (VALIDOS[chave].includes(guardadas[chave])) prefs[chave] = guardadas[chave];
  }
  return prefs;
}

export function guardarPreferencia(chave, valor, storage = armazenamentoPadrao()) {
  if (!VALIDOS[chave]?.includes(valor)) return lerPreferencias(storage);
  const novas = { ...lerPreferencias(storage), [chave]: valor };
  try {
    storage?.setItem(CHAVE_PREFERENCIAS, JSON.stringify(novas));
  } catch {
    // sem espaço ou bloqueado: a escolha vale só nesta sessão
  }
  return novas;
}

// põe no <html> o que as preferências pedem (o css trata do resto)
export function aplicarPreferencias(prefs, raiz = globalThis.document?.documentElement) {
  if (!raiz) return;
  if (prefs.animacoes === 'off') raiz.setAttribute('data-animacoes', 'off');
  else raiz.removeAttribute('data-animacoes');
}

// que abertura mostrar: 'completa', 'curta' ou 'nenhuma'
export function modoAbertura(abertura, jaViuHoje) {
  if (abertura === 'nunca') return 'nenhuma';
  if (abertura === 'sempre') return 'completa';
  if (abertura === 'curta') return 'curta';
  return jaViuHoje ? 'curta' : 'completa';
}
