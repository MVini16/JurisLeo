// lógica pura dos minijogos: baralhar, juntar as perguntas do banco com os flashcards dela, pontuar e guardar recordes.
// sem react nem firebase, para testar com vitest sem mocks. as perguntas do banco estão em data/jogos.js

// o jurista pede 11: dez degraus e uma pergunta de reserva para a ajuda "saltar"
export const PERGUNTAS_POR_JOGO = { vf: 40, jurista: 11, caso: 6, pares: 18 };
export const TAMANHO_MAX_PAR = 70; // pares com texto maior ficam de fora (não cabem nos botões)

// ---------- baralhar e escolher ----------

export function misturar(lista, aleatorio = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function escolherN(lista, n, aleatorio = Math.random) {
  return misturar(lista, aleatorio).slice(0, n);
}

export function filtrarPorCadeira(lista, cadeiraId) {
  return !cadeiraId || cadeiraId === 'todas' ? lista : lista.filter((p) => p.cadeiraId === cadeiraId);
}

// ---------- as perguntas dela (flashcards) viram perguntas de jogo ----------

const SO_TEXTO = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

// um flashcard com `tipo: 'vf'` é uma afirmação dela (frente) com `verdade` (boolean) e explicação (trás)
export function flashcardsParaVF(flashcards, aleatorio = Math.random) {
  const proprios = flashcards
    .filter((f) => f.tipo === 'vf' && typeof f.verdade === 'boolean' && SO_TEXTO(f.frente))
    .map((f) => ({ id: `fc-${f.id}`, cadeiraId: f.cadeiraId, afirmacao: SO_TEXTO(f.frente), verdade: f.verdade, explicacao: SO_TEXTO(f.tras) || 'Sem explicação.', fonte: 'A tua pergunta', dela: true }));
  // os flashcards normais viram afirmações: metade com a resposta certa e metade com a de outro cartão
  const normais = flashcards.filter((f) => !f.tipo && SO_TEXTO(f.frente) && SO_TEXTO(f.tras));
  const derivadas = normais.length < 2 ? [] : normais.map((f, i) => {
    const verdadeira = i % 2 === 0;
    const outros = normais.filter((o) => o.id !== f.id && SO_TEXTO(o.tras) !== SO_TEXTO(f.tras));
    const alheio = outros.length ? outros[Math.floor(aleatorio() * outros.length)] : null;
    if (!verdadeira && !alheio) return null;
    const resposta = verdadeira ? SO_TEXTO(f.tras) : SO_TEXTO(alheio.tras);
    return { id: `fc-${f.id}-${verdadeira ? 'v' : 'f'}`, cadeiraId: f.cadeiraId, afirmacao: `${SO_TEXTO(f.frente)} Resposta: ${resposta}`, verdade: verdadeira, explicacao: `A resposta certa é: ${SO_TEXTO(f.tras)}`, fonte: 'O teu flashcard', dela: true };
  }).filter(Boolean);
  return [...proprios, ...derivadas];
}

// escolha múltipla a partir de um flashcard. se ela escreveu as opções erradas (`opcoes`), usa-as; senão tira as
// respostas de outros cartões (da mesma cadeira primeiro). devolve null se não houver opções suficientes
export function flashcardParaEscolha(flashcard, todos, aleatorio = Math.random) {
  const certa = SO_TEXTO(flashcard.tras);
  if (!SO_TEXTO(flashcard.frente) || !certa) return null;
  let erradas = Array.isArray(flashcard.opcoes) ? flashcard.opcoes.map(SO_TEXTO).filter((o) => o && o !== certa) : [];
  erradas = [...new Set(erradas)];
  if (erradas.length < 3) {
    const candidatas = todos.filter((o) => o.id !== flashcard.id && !o.tipo).map((o) => SO_TEXTO(o.tras)).filter((t) => t && t !== certa && !erradas.includes(t));
    const mesmaCadeira = todos.filter((o) => o.id !== flashcard.id && !o.tipo && o.cadeiraId === flashcard.cadeiraId).map((o) => SO_TEXTO(o.tras)).filter((t) => candidatas.includes(t));
    const resto = candidatas.filter((t) => !mesmaCadeira.includes(t));
    erradas = [...erradas, ...misturar([...new Set(mesmaCadeira)], aleatorio), ...misturar([...new Set(resto)], aleatorio)];
  }
  if (erradas.length < 3) return null;
  const opcoes = misturar([certa, ...erradas.slice(0, 3)], aleatorio);
  return { id: `fc-${flashcard.id}`, cadeiraId: flashcard.cadeiraId, pergunta: SO_TEXTO(flashcard.frente), opcoes, certa: opcoes.indexOf(certa), explicacao: SO_TEXTO(flashcard.explicacao) || `A resposta certa é: ${certa}`, fonte: 'O teu flashcard', dela: true };
}

export function flashcardsParaEscolha(flashcards, aleatorio = Math.random) {
  return flashcards.filter((f) => !f.tipo || f.tipo === 'escolha').map((f) => flashcardParaEscolha(f, flashcards, aleatorio)).filter(Boolean);
}

// pares para ligar: só os flashcards com textos curtos dos dois lados
export function flashcardsParaPares(flashcards) {
  return flashcards
    .filter((f) => !f.tipo && SO_TEXTO(f.frente) && SO_TEXTO(f.tras) && SO_TEXTO(f.frente).length <= TAMANHO_MAX_PAR && SO_TEXTO(f.tras).length <= TAMANHO_MAX_PAR)
    .map((f) => ({ id: `fc-${f.id}`, cadeiraId: f.cadeiraId, a: SO_TEXTO(f.frente), b: SO_TEXTO(f.tras), fonte: 'O teu flashcard', dela: true }));
}

// ---------- montar uma ronda ----------

export const FONTES = [
  { id: 'banco', rotulo: 'Perguntas do Claude' },
  { id: 'minhas', rotulo: 'As minhas perguntas' },
  { id: 'mistura', rotulo: 'Mistura das duas' },
];

function juntar(banco, minhas, fonte, aleatorio) {
  if (fonte === 'banco') return banco;
  if (fonte === 'minhas') return minhas;
  return misturar([...banco, ...minhas], aleatorio);
}

// `entrada`: { banco: {vf, escolha, casos, pares}, flashcards, fonte, cadeiraId, aleatorio }
export function montarRonda(jogo, { banco, flashcards = [], fonte = 'mistura', cadeiraId = 'todas', aleatorio = Math.random }) {
  const filtrar = (l) => filtrarPorCadeira(l, cadeiraId);
  const meus = filtrar(flashcards);
  let lista;
  if (jogo === 'vf') lista = juntar(filtrar(banco.vf), flashcardsParaVF(meus, aleatorio), fonte, aleatorio);
  else if (jogo === 'jurista') lista = juntar(filtrar(banco.escolha), flashcardsParaEscolha(meus, aleatorio), fonte, aleatorio);
  else if (jogo === 'caso') lista = filtrar(banco.casos);
  else if (jogo === 'pares') lista = juntar(filtrar(banco.pares), flashcardsParaPares(meus), fonte, aleatorio);
  else lista = [];
  const n = PERGUNTAS_POR_JOGO[jogo] ?? 10;
  const escolhidas = escolherN(lista, n, aleatorio);
  // nas escolhas do banco, baralha também a ordem das opções (a certa muda de sítio)
  if (jogo === 'jurista' || jogo === 'caso') return escolhidas.map((p) => baralharOpcoes(p, aleatorio));
  return escolhidas;
}

export function baralharOpcoes(pergunta, aleatorio = Math.random) {
  const ordem = misturar(pergunta.opcoes.map((_, i) => i), aleatorio);
  return { ...pergunta, opcoes: ordem.map((i) => pergunta.opcoes[i]), certa: ordem.indexOf(pergunta.certa) };
}

// ---------- verdadeiro ou falso ----------

// o relógio é de resistência: começa em 30s, cada certa dá mais 2s e cada erro tira 4s (nunca passa de 60s)
export const SEGUNDOS_VF = 30;
export const SEGUNDOS_MAX_VF = 60;
export const BONUS_CERTA_VF = 2;
export const PENALIZACAO_ERRO_VF = 4;

export function relogioVF(restante, acertou) {
  const novo = restante + (acertou ? BONUS_CERTA_VF : -PENALIZACAO_ERRO_VF);
  return Math.min(SEGUNDOS_MAX_VF, Math.max(0, novo));
}

// quem acerta muitas seguidas multiplica os pontos: x1 (1 e 2 seguidas), x2 (3 a 5), x3 (6 a 9), x4 (10 ou mais)
export function multiplicadorVF(seguidas) {
  if (seguidas >= 10) return 4;
  if (seguidas >= 6) return 3;
  if (seguidas >= 3) return 2;
  return 1;
}

// pontos de uma resposta certa, com `seguidas` já a contar com esta
export function pontosVF(seguidas) {
  return 10 * multiplicadorVF(seguidas);
}

export function resultadoVF(respostas) {
  let seguidas = 0;
  let melhorSerie = 0;
  let pontos = 0;
  let certas = 0;
  respostas.forEach((certa) => {
    if (certa) { seguidas += 1; certas += 1; pontos += pontosVF(seguidas); melhorSerie = Math.max(melhorSerie, seguidas); } else seguidas = 0;
  });
  return { pontos, certas, erradas: respostas.length - certas, melhorSerie };
}

// ---------- quem quer ser jurista ----------

export const ESCADA = [
  'Caloira', 'Estagiária', 'Solicitadora', 'Advogada', 'Procuradora',
  'Juíza de Direito', 'Desembargadora', 'Juíza Conselheira', 'Procuradora-Geral', 'Ministra da Justiça',
];
export const PATAMARES = [2, 5]; // índices (0 a 9) onde a escada guarda o que já subiste: níveis 3 e 6

// o título que fica garantido quando erras no nível `nivel` (0 a 9): o do último patamar que passaste
export function tituloGarantido(nivel) {
  const patamar = [...PATAMARES].reverse().find((p) => nivel > p);
  return patamar === undefined ? 'Sem título (por agora)' : ESCADA[patamar];
}

// pontos por degrau subido; quem falha fica só com o último patamar, quem desiste leva tudo o que subiu
export const PONTOS_POR_DEGRAU = 100;

export function pontosDoJurista({ nivel, resultado, degraus }) {
  if (resultado === 'completou') return degraus * PONTOS_POR_DEGRAU;
  if (resultado === 'desistiu') return nivel * PONTOS_POR_DEGRAU;
  const patamar = [...PATAMARES].reverse().find((p) => nivel > p);
  return patamar === undefined ? 0 : (patamar + 1) * PONTOS_POR_DEGRAU;
}

// "50/50": esconde duas respostas erradas. devolve os índices a esconder
export function meiaMeia(pergunta, aleatorio = Math.random) {
  const erradas = pergunta.opcoes.map((_, i) => i).filter((i) => i !== pergunta.certa);
  return misturar(erradas, aleatorio).slice(0, 2);
}

// "pergunta ao Vini": não diz a resposta, diz onde ir ver
export function pistaDoVini(pergunta) {
  return `O Vini diz: a resposta está em ${pergunta.fonte}. Vai espreitar.`;
}

// ---------- caso prático: a aposta ----------

// antes de responder escolhe-se a convicção: 1 (prudente), 2 (convicta) ou 3 (tudo ou nada). certa: 20 x aposta; errada: perde 8 por cada nível acima do 1
export const APOSTAS = [
  { id: 1, rotulo: 'Prudente', descricao: 'Sem risco' },
  { id: 2, rotulo: 'Convicta', descricao: 'Dobro, arriscas 8' },
  { id: 3, rotulo: 'Tudo ou nada', descricao: 'Triplo, arriscas 16' },
];
export const PONTOS_CASO = 20;
export const CUSTO_DICA_CASO = 10;

export function pontosDoCaso(aposta, acertou) {
  return acertou ? PONTOS_CASO * aposta : 0 - 8 * (aposta - 1);
}

// o total nunca desce abaixo de zero
export function totalDoCaso(movimentos) {
  return Math.max(0, movimentos.reduce((s, m) => s + m, 0));
}

// ---------- ligar os pares ----------

// os dois lados baralhados, cada um com o id do par a que pertence
export function prepararTabuleiro(pares, aleatorio = Math.random) {
  return {
    esquerda: misturar(pares.map((p) => ({ id: p.id, texto: p.a })), aleatorio),
    direita: misturar(pares.map((p) => ({ id: p.id, texto: p.b })), aleatorio),
  };
}

export function eParCerto(idEsquerda, idDireita) {
  return !!idEsquerda && idEsquerda === idDireita;
}

// ligar os pares em rondas: 90s de início, mais 15s por cada ronda completa, até 3 rondas
export const TEMPO_INICIAL_PARES = 90;
export const TEMPO_POR_RONDA_PARES = 15;
export const RONDAS_PARES = 3;

// quem liga pares seguidos sem errar multiplica os pontos: x1 (1 e 2), x2 (3 a 5), x3 (6 ou mais)
export function multiplicadorPares(seguidos) {
  if (seguidos >= 6) return 3;
  if (seguidos >= 3) return 2;
  return 1;
}

export function pontosDoPar(seguidos) {
  return 20 * multiplicadorPares(seguidos);
}

// um erro tira 5 pontos
export const PENALIZACAO_PAR = 5;

// ---------- recordes ----------

export function registarRecorde(registo, jogo, pontos) {
  const anterior = registo?.[jogo]?.melhor ?? 0;
  const jogadas = (registo?.[jogo]?.jogadas ?? 0) + 1;
  const novoRecorde = pontos > anterior;
  return { registo: { ...registo, [jogo]: { melhor: Math.max(anterior, pontos), jogadas } }, novoRecorde };
}

// ---------- criar uma pergunta para os jogos ----------

// o formulário da Leonor vira os campos de um flashcard (mesma coleção; os campos a mais são opcionais):
// escolha: frente=pergunta, tras=resposta certa, opcoes=3 erradas, explicacao. vf: frente=afirmação, tras=explicação, verdade
export function construirPerguntaDela({ tipo, cadeiraId, texto, certa, erradas = [], verdade = true, explicacao = '' }) {
  const enunciado = SO_TEXTO(texto);
  const explica = SO_TEXTO(explicacao);
  if (!enunciado) return { ok: false, erro: tipo === 'vf' ? 'Escreve a afirmação.' : 'Escreve a pergunta.' };
  if (tipo === 'vf') {
    return { ok: true, dados: { frente: enunciado, tras: explica || (verdade ? 'Verdadeiro.' : 'Falso.'), cadeiraId, tipo: 'vf', verdade: !!verdade } };
  }
  const resposta = SO_TEXTO(certa);
  if (!resposta) return { ok: false, erro: 'Escreve a resposta certa.' };
  const limpas = erradas.map(SO_TEXTO).filter(Boolean);
  if (limpas.length < 3) return { ok: false, erro: 'Escreve as três respostas erradas.' };
  if (new Set([resposta, ...limpas]).size < 4) return { ok: false, erro: 'As quatro respostas têm de ser diferentes.' };
  return { ok: true, dados: { frente: enunciado, tras: resposta, cadeiraId, tipo: 'escolha', opcoes: limpas.slice(0, 3), ...(explica ? { explicacao: explica } : {}) } };
}
