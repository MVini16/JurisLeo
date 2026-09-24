// lógica pura do caderno digital — sem firebase nem react
// cada cadeira é um caderno; dentro há divisórias (teóricas e práticas de base, mais as que ela criar)
// e cada anotação é uma página de uma divisória
// as anotações antigas não têm divisória: entram pelas teóricas ou práticas conforme o tipo (sem migração)

export const DIVISORIAS_BASE = [
  { id: 'teoricas', nome: 'Teóricas', cor: 'var(--burgundy)' },
  { id: 'praticas', nome: 'Práticas', cor: 'var(--gold-escuro)' },
];

// cores das divisórias novas, sempre por variáveis do index.css (rodam pela ordem)
export const CORES_DIVISORIA = ['var(--info)', 'var(--sucesso)', 'var(--familia-profissional)', 'var(--familia-social)', 'var(--aviso)'];

export const MAX_NOME_DIVISORIA = 30;

// Timestamp do firestore, Date ou número → milissegundos (0 se não houver)
function emMs(valor) {
  if (!valor) return 0;
  if (typeof valor.toMillis === 'function') return valor.toMillis();
  if (valor instanceof Date) return valor.getTime();
  return typeof valor === 'number' ? valor : 0;
}

// as de base mais as dela (configuracoes/dados.divisorias[cadeiraId]), sem ids repetidos nem lixo
export function divisoriasDaCadeira(guardadas, cadeiraId) {
  const dela = Array.isArray(guardadas?.[cadeiraId]) ? guardadas[cadeiraId] : [];
  const vistas = new Set();
  return [...DIVISORIAS_BASE, ...dela].filter((d) => {
    if (!d || typeof d.id !== 'string' || typeof d.nome !== 'string' || vistas.has(d.id)) return false;
    vistas.add(d.id);
    return true;
  });
}

// a divisória de uma página; sem divisória (anotações antigas) vale o tipo
export function divisoriaDaAnotacao(anotacao) {
  if (anotacao?.divisoria) return anotacao.divisoria;
  return anotacao?.tipo === 'pratica' ? 'praticas' : 'teoricas';
}

// páginas de uma divisória, pela ordem que ela escolheu (e depois pela data de criação);
// se a divisória de uma página já não existir (foi apagada), a página aparece nas teóricas, nunca desaparece
export function paginasDaDivisoria(anotacoes, cadeiraId, divisoriaId, divisorias = DIVISORIAS_BASE) {
  const ids = new Set(divisorias.map((d) => d.id));
  return (anotacoes ?? [])
    .filter((a) => a.cadeiraId === cadeiraId)
    .filter((a) => {
      const div = divisoriaDaAnotacao(a);
      return (ids.has(div) ? div : 'teoricas') === divisoriaId;
    })
    .sort((a, b) => {
      const oa = Number.isFinite(a.ordem) ? a.ordem : Infinity;
      const ob = Number.isFinite(b.ordem) ? b.ordem : Infinity;
      if (oa !== ob) return oa - ob;
      return emMs(a.criadoEm) - emMs(b.criadoEm);
    });
}

// quantas páginas tem cada caderno: { [cadeiraId]: n }
export function contarPaginas(anotacoes) {
  const contas = {};
  for (const a of anotacoes ?? []) {
    if (a.cadeiraId) contas[a.cadeiraId] = (contas[a.cadeiraId] ?? 0) + 1;
  }
  return contas;
}

// a página mexida há menos tempo, para o "continuar onde ficaste" (ou null)
export function ultimaEditada(anotacoes) {
  let melhor = null;
  for (const a of anotacoes ?? []) {
    if (!melhor || emMs(a.atualizadoEm) > emMs(melhor.atualizadoEm)) melhor = a;
  }
  return melhor;
}

// "Cap. 1 · Fontes" → "cap-1-fontes"; sem letras vira "divisoria"
function slug(nome) {
  const base = nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || 'divisoria';
}

// divisória nova com id único e cor a seguir; null se o nome estiver vazio
export function criarDivisoria(nome, existentes) {
  const limpo = String(nome ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NOME_DIVISORIA);
  if (!limpo) return null;
  const ids = new Set((existentes ?? []).map((d) => d.id));
  const base = slug(limpo);
  let id = base;
  for (let n = 2; ids.has(id); n += 1) id = `${base}-${n}`;
  const proprias = (existentes ?? []).filter((d) => !DIVISORIAS_BASE.some((b) => b.id === d.id)).length;
  return { id, nome: limpo, cor: CORES_DIVISORIA[proprias % CORES_DIVISORIA.length] };
}

// troca uma página com a vizinha (-1 sobe, +1 desce) e devolve a ordem nova de todas: [{ id, ordem }]
// numera tudo de novo (0, 1, 2...) para as páginas antigas sem ordem ficarem arrumadas de vez
export function moverPagina(paginas, id, direcao) {
  const lista = [...(paginas ?? [])];
  const i = lista.findIndex((p) => p.id === id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return null;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  return lista.map((p, ordem) => ({ id: p.id, ordem }));
}

// ordem para uma página nova: fica no fim da divisória
export function ordemNova(paginas) {
  const ordens = (paginas ?? []).map((p) => p.ordem).filter(Number.isFinite);
  return ordens.length ? Math.max(...ordens) + 1 : (paginas ?? []).length;
}
