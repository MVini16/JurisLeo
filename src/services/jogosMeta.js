// o que prende nos jogos, em contas puras: pontos de experiência, nível de carreira, caixa de despachos (prémio com sorte),
// coleção de selos, audiência do dia e as mensagens de "quase". sem react nem firebase, para testar com vitest.
// tudo isto guarda-se só em localStorage (services/jogosLocal.js)
import { SELOS, RARIDADES } from '../data/selos.js';
import { ESCADA, misturar } from './jogos.js';

// ---------- nível de carreira (dez títulos, os mesmos da escada do "Quem Quer Ser Jurista") ----------

export const LIMIARES_XP = [0, 150, 400, 800, 1400, 2200, 3300, 4700, 6500, 9000];

export function nivelDeCarreira(xp) {
  const total = Math.max(0, xp || 0);
  let indice = 0;
  LIMIARES_XP.forEach((limiar, i) => { if (total >= limiar) indice = i; });
  const proximo = LIMIARES_XP[indice + 1] ?? null;
  const base = LIMIARES_XP[indice];
  return {
    indice,
    titulo: ESCADA[indice],
    proximoTitulo: proximo === null ? null : ESCADA[indice + 1],
    xpNoNivel: total - base,
    xpParaProximo: proximo === null ? 0 : proximo - total,
    fracao: proximo === null ? 1 : (total - base) / (proximo - base),
  };
}

// ---------- experiência de uma jogada ----------

export const XP_AUDIENCIA_DIA = 100;
export const XP_PERFEITA = 50;

// metade dos pontos (no mínimo 5 por jogada), mais o bónus de jogada perfeita
export function xpBase(pontos, perfeita = false) {
  return Math.max(5, Math.round((pontos || 0) / 2)) + (perfeita ? XP_PERFEITA : 0);
}

// ---------- caixa de despachos: o prémio com sorte (multiplicador do XP) ----------

export const CAIXA = [
  { multiplicador: 1, peso: 55, rotulo: 'Despacho simples' },
  { multiplicador: 2, peso: 30, rotulo: 'Despacho em dobro' },
  { multiplicador: 3, peso: 12, rotulo: 'Despacho triplo' },
  { multiplicador: 5, peso: 3, rotulo: 'Acórdão de ouro' },
];

// sorteia um prémio da caixa: `aleatorio` devolve um número entre 0 e 1 e percorre-se a lista pelos pesos
export function sortearCaixa(aleatorio = Math.random) {
  const total = CAIXA.reduce((s, c) => s + c.peso, 0);
  let ponto = aleatorio() * total;
  for (const c of CAIXA) {
    if (ponto < c.peso) return c;
    ponto -= c.peso;
  }
  return CAIXA[0];
}

// ---------- coleção de selos ----------

// a probabilidade de uma jogada dar um selo novo: sobe com a jogada perfeita e com o recorde
export function probabilidadeDeSelo({ perfeita = false, novoRecorde = false, diario = false } = {}) {
  return Math.min(0.9, 0.3 + (perfeita ? 0.3 : 0) + (novoRecorde ? 0.15 : 0) + (diario ? 0.2 : 0));
}

// escolhe um selo que ainda não tem, com peso pela raridade. null se já tem todos
export function sortearSelo(desbloqueados, aleatorio = Math.random) {
  const livres = SELOS.filter((s) => !desbloqueados.includes(s.id));
  if (livres.length === 0) return null;
  const total = livres.reduce((s, x) => s + RARIDADES[x.raridade].peso, 0);
  let ponto = aleatorio() * total;
  for (const s of livres) {
    const peso = RARIDADES[s.raridade].peso;
    if (ponto < peso) return s;
    ponto -= peso;
  }
  return livres[0];
}

// ---------- audiência do dia ----------

// gerador pseudoaleatório com semente (o mesmo dia dá sempre as mesmas perguntas)
export function aleatorioComSemente(texto) {
  let h = 1779033703;
  for (let i = 0; i < texto.length; i += 1) { h = Math.imul(h ^ texto.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// cinco perguntas de escolha múltipla, iguais para o dia todo, com as opções também baralhadas por semente
export function audienciaDoDia(escolha, hoje, n = 5) {
  const rng = aleatorioComSemente(`audiencia-${hoje}`);
  return misturar(escolha, rng).slice(0, n).map((p) => {
    const ordem = misturar(p.opcoes.map((_, i) => i), rng);
    return { ...p, opcoes: ordem.map((i) => p.opcoes[i]), certa: ordem.indexOf(p.certa) };
  });
}

// ---------- mensagens que dão vontade de jogar outra vez ----------

export function mensagemQuase({ pontos, melhor, novoRecorde }) {
  if (novoRecorde) return 'Recorde teu! Será que consegues mais?';
  if (!melhor) return 'Primeira jogada feita. Agora é só melhorar.';
  const falta = melhor - pontos;
  if (falta <= 0) return 'Igualaste o teu recorde.';
  if (falta <= Math.max(10, melhor * 0.1)) return `Faltaram só ${falta} pontos para o teu recorde. Mais uma?`;
  if (pontos >= melhor * 0.7) return 'Estiveste perto do teu recorde. Mais uma?';
  return 'A próxima corre melhor. Mais uma?';
}

// uma pausa a sério ajuda a memorizar: sugere-se depois de 25 minutos seguidos a jogar
export const MINUTOS_ATE_PAUSA = 25;
export function pausaSugerida(minutosJogados) {
  return minutosJogados >= MINUTOS_ATE_PAUSA;
}

// ---------- conquistas ----------

export const CONQUISTAS = [
  { id: 'primeira', nome: 'Primeira audiência', descricao: 'Joga o teu primeiro jogo.', ok: (r) => r.jogadas >= 1 },
  { id: 'dez', nome: 'Habituée do tribunal', descricao: 'Faz 10 jogadas.', ok: (r) => r.jogadas >= 10 },
  { id: 'cinquenta', nome: 'Sócia fundadora', descricao: 'Faz 50 jogadas.', ok: (r) => r.jogadas >= 50 },
  { id: 'perfeita', nome: 'Sem uma falha', descricao: 'Faz uma jogada perfeita.', ok: (r) => r.perfeitas >= 1 },
  { id: 'cinco-perfeitas', nome: 'Impecável', descricao: 'Faz 5 jogadas perfeitas.', ok: (r) => r.perfeitas >= 5 },
  { id: 'selos-5', nome: 'Colecionadora', descricao: 'Junta 5 selos.', ok: (r) => r.selos >= 5 },
  { id: 'selos-todos', nome: 'Arquivo completo', descricao: 'Junta todos os selos.', ok: (r) => r.selos >= SELOS.length },
  { id: 'audiencias-7', nome: 'Semana de audiências', descricao: 'Cumpre a audiência do dia 7 vezes.', ok: (r) => r.audiencias >= 7 },
  { id: 'advogada', nome: 'Advogada', descricao: 'Chega ao nível Advogada.', ok: (r) => r.nivel >= 3 },
];

// `estado`: { jogadas, perfeitas, selos, audiencias, nivel }. devolve os ids desbloqueados
export function conquistasDesbloqueadas(estado) {
  return CONQUISTAS.filter((c) => c.ok(estado)).map((c) => c.id);
}

// ---------- o perfil de jogador e o fim de cada jogada ----------

export function perfilVazio() {
  return { xp: 0, selos: [], jogadas: 0, perfeitas: 0, audiencias: 0, ultimaAudiencia: null, conquistas: [] };
}

// aplica uma jogada ao perfil: soma o XP (com a caixa de despachos), pode dar um selo e desbloqueia conquistas.
// `diario` é verdadeiro na audiência do dia (só conta uma vez por dia). devolve o novo perfil e tudo o que mudou, para o ecrã do fim
export function aplicarJogada(perfil, { pontos, perfeita = false, novoRecorde = false, diario = false, hoje }, aleatorio = Math.random) {
  const antes = perfil ?? perfilVazio();
  const jaFezHoje = diario && antes.ultimaAudiencia === hoje;
  const contaComoDiario = diario && !jaFezHoje;
  const nivelAntes = nivelDeCarreira(antes.xp);

  const caixa = sortearCaixa(aleatorio);
  const base = xpBase(pontos, perfeita);
  const xpJogada = base * caixa.multiplicador;
  const xpGanho = xpJogada + (contaComoDiario ? XP_AUDIENCIA_DIA : 0);

  let selo = null;
  if (aleatorio() < probabilidadeDeSelo({ perfeita, novoRecorde, diario: contaComoDiario })) selo = sortearSelo(antes.selos, aleatorio);

  const depois = {
    ...antes,
    xp: antes.xp + xpGanho,
    selos: selo ? [...antes.selos, selo.id] : antes.selos,
    jogadas: antes.jogadas + 1,
    perfeitas: antes.perfeitas + (perfeita ? 1 : 0),
    audiencias: antes.audiencias + (contaComoDiario ? 1 : 0),
    ultimaAudiencia: contaComoDiario ? hoje : antes.ultimaAudiencia,
  };
  const nivelDepois = nivelDeCarreira(depois.xp);
  const todas = conquistasDesbloqueadas({ jogadas: depois.jogadas, perfeitas: depois.perfeitas, selos: depois.selos.length, audiencias: depois.audiencias, nivel: nivelDepois.indice });
  const conquistasNovas = todas.filter((id) => !(antes.conquistas ?? []).includes(id));
  depois.conquistas = todas;

  return { perfil: depois, xpBase: base, caixa, xpGanho, bonusDiario: contaComoDiario ? XP_AUDIENCIA_DIA : 0, selo, nivelAntes, nivelDepois, subiuDeNivel: nivelDepois.indice > nivelAntes.indice, conquistasNovas };
}
