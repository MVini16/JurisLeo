// as frases que o vini acrescenta ao boneco na consola (/admin/boneco). ficam em localStorage deste aparelho e
// podem ser exportadas para o ficheiro data/boneco.js. lógica pura, sem react nem firebase, para testar sem mocks
import { ESTADOS } from '../data/boneco.js';

export const LIMITE_FRASE = 240;
export const MAXIMO_POR_LISTA = 200;

// onde uma frase pode entrar: as listas simples e as respostas brincalhonas de cada estado (menos "mal")
export const CATEGORIAS = [
  { id: 'elogios', rotulo: 'Elogio' },
  { id: 'piadas', rotulo: 'Piada' },
  { id: 'proativas', rotulo: 'Quando ele puxa conversa' },
  ...ESTADOS.filter((e) => e.id !== 'mal').map((e) => ({ id: `respostas.${e.id}`, rotulo: `Resposta brincalhona: ${e.rotulo.toLowerCase()}` })),
];

export function extraVazio() {
  return { elogios: [], piadas: [], proativas: [], respostas: {} };
}

function lista(extra, categoria) {
  if (categoria.startsWith('respostas.')) return extra.respostas?.[categoria.slice(10)] ?? [];
  return extra[categoria] ?? [];
}

export function categoriaValida(categoria) {
  return CATEGORIAS.some((c) => c.id === categoria);
}

// a frase serve? (sem travessões nem emojis, para manter o estilo, e com limite de tamanho)
export function validarFrase(texto) {
  const limpa = String(texto ?? '').replace(/\s+/g, ' ').trim();
  if (!limpa) return { ok: false, erro: 'Escreve a frase primeiro.' };
  if (limpa.length > LIMITE_FRASE) return { ok: false, erro: `Frase demasiado longa (máximo ${LIMITE_FRASE} carateres).` };
  if (/[\u2013\u2014]/.test(limpa)) return { ok: false, erro: 'Troca o travessão por vírgula ou ponto.' };
  if (/\p{Extended_Pictographic}/u.test(limpa)) return { ok: false, erro: 'Sem emojis, para manter o estilo do boneco.' };
  return { ok: true, frase: limpa };
}

export function adicionarFrase(extra, categoria, texto) {
  if (!categoriaValida(categoria)) return { extra, erro: 'Categoria desconhecida.' };
  const v = validarFrase(texto);
  if (!v.ok) return { extra, erro: v.erro };
  const atual = lista(extra, categoria);
  if (atual.includes(v.frase)) return { extra, erro: 'Essa frase já está na lista.' };
  if (atual.length >= MAXIMO_POR_LISTA) return { extra, erro: 'Lista cheia.' };
  return { extra: escrever(extra, categoria, [...atual, v.frase]) };
}

export function removerFrase(extra, categoria, frase) {
  return escrever(extra, categoria, lista(extra, categoria).filter((f) => f !== frase));
}

function escrever(extra, categoria, novaLista) {
  if (categoria.startsWith('respostas.')) {
    return { ...extra, respostas: { ...extra.respostas, [categoria.slice(10)]: novaLista } };
  }
  return { ...extra, [categoria]: novaLista };
}

export function totalDeFrases(extra) {
  return CATEGORIAS.reduce((soma, c) => soma + lista(extra, c.id).length, 0);
}

// o que vem de fora (ficheiro ou localStorage) pode estar estragado: só entra o que cumpre as regras
export function normalizarExtra(bruto) {
  let extra = extraVazio();
  if (!bruto || typeof bruto !== 'object') return extra;
  for (const c of CATEGORIAS) {
    const origem = c.id.startsWith('respostas.') ? bruto.respostas?.[c.id.slice(10)] : bruto[c.id];
    if (!Array.isArray(origem)) continue;
    for (const f of origem) {
      if (typeof f !== 'string') continue;
      extra = adicionarFrase(extra, c.id, f).extra;
    }
  }
  return extra;
}

// linhas prontas a colar em data/boneco.js, por lista (para as frases passarem a fazer parte do código)
export function exportarParaCodigo(extra) {
  const aspas = (f) => `  '${f.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`;
  const blocos = [];
  for (const c of CATEGORIAS) {
    const frases = lista(extra, c.id);
    if (frases.length === 0) continue;
    blocos.push(`// ${c.rotulo}\n${frases.map(aspas).join('\n')}`);
  }
  return blocos.join('\n\n');
}
