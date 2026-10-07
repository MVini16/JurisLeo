// lógica pura do desenho à mão — sem react, sem canvas e sem firebase, para testar com vitest sem mocks.
// o desenho é vetorial: uma lista de traços. as coordenadas são "unidades lógicas" relativas à largura
// da página (1000 unidades = a largura toda), por isso o desenho escala bem entre telemóvel e computador.
// guarda-se como texto num campo opcional da nota (`desenho`), sem coleções novas no firestore

export const LARGURA_LOGICA = 1000;
export const FERRAMENTAS = ['caneta', 'marcador', 'borracha'];
export const CORES = ['tinta', 'azul', 'vinho', 'verde', 'ouro', 'roxo'];
// largura de cada traço em unidades lógicas, por ferramenta e espessura (1 fina, 2 média, 3 grossa)
export const LARGURAS = { caneta: [4, 7, 12], marcador: [30, 45, 70] };
export const MAX_TRACOS = 4000;
export const MAX_PONTOS_POR_TRACO = 3000;
// quanto uma linha pode ter de erro ao ser simplificada (em unidades): invisível a olho
const TOLERANCIA = 1.2;
const MARGEM_ALTURA = 60;

const LETRA_DA_FERRAMENTA = { caneta: 'c', marcador: 'm' };
const FERRAMENTA_DA_LETRA = { c: 'caneta', m: 'marcador' };

// ---------- geometria ----------

function distanciaPontoSegmento(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const quadrado = dx * dx + dy * dy;
  if (quadrado === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / quadrado));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// Ramer–Douglas–Peucker: tira os pontos que não mudam a forma da linha. sem recursão, para linhas compridas
export function simplificarPontos(pontos, tolerancia = TOLERANCIA) {
  if (pontos.length <= 2) return pontos;
  const manter = new Array(pontos.length).fill(false);
  manter[0] = true;
  manter[pontos.length - 1] = true;
  const pilha = [[0, pontos.length - 1]];
  while (pilha.length > 0) {
    const [inicio, fim] = pilha.pop();
    let maior = 0;
    let indice = -1;
    for (let i = inicio + 1; i < fim; i++) {
      const d = distanciaPontoSegmento(pontos[i], pontos[inicio], pontos[fim]);
      if (d > maior) { maior = d; indice = i; }
    }
    if (maior > tolerancia && indice !== -1) {
      manter[indice] = true;
      pilha.push([inicio, indice], [indice, fim]);
    }
  }
  return pontos.filter((_, i) => manter[i]);
}

// ---------- traços ----------

// guarda os pontos em inteiros, só o primeiro absoluto e os outros como diferenças (ocupa uns 3 bytes por número)
function comprimir(pontos) {
  const inteiros = pontos.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }));
  const saida = [inteiros[0].x, inteiros[0].y];
  for (let i = 1; i < inteiros.length; i++) {
    saida.push(inteiros[i].x - inteiros[i - 1].x, inteiros[i].y - inteiros[i - 1].y);
  }
  return saida;
}

export function pontosDoTraco(traco) {
  const pontos = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < traco.p.length; i += 2) {
    x = i === 0 ? traco.p[0] : x + traco.p[i];
    y = i === 0 ? traco.p[1] : y + traco.p[i + 1];
    pontos.push({ x, y });
  }
  return pontos;
}

// cria o traço guardável a partir dos pontos desenhados (em unidades lógicas)
// um toque sem arrasto vira um pontinho (dois pontos iguais)
export function novoTraco({ ferramenta, cor, espessura, pontos }) {
  const limitados = pontos.slice(0, MAX_PONTOS_POR_TRACO);
  const simples = simplificarPontos(limitados);
  const final = simples.length === 1 ? [simples[0], simples[0]] : simples;
  return { f: LETRA_DA_FERRAMENTA[ferramenta], k: CORES.includes(cor) ? cor : 'tinta', l: Math.min(3, Math.max(1, espessura)), p: comprimir(final) };
}

export function ferramentaDoTraco(traco) {
  return FERRAMENTA_DA_LETRA[traco.f];
}

export function larguraDoTraco(traco) {
  return LARGURAS[ferramentaDoTraco(traco)][traco.l - 1];
}

function tracoValido(traco) {
  return !!traco
    && (traco.f === 'c' || traco.f === 'm')
    && Array.isArray(traco.p)
    && traco.p.length >= 4
    && traco.p.length % 2 === 0
    && traco.p.length <= MAX_PONTOS_POR_TRACO * 2
    && traco.p.every((n) => Number.isInteger(n) && Math.abs(n) < 100000);
}

// a partir deste desvio de direção (em graus) um ponto passa a ser um canto e não uma curva
const ANGULO_DO_CANTO = 35;
const COSSENO_DO_CANTO = Math.cos((ANGULO_DO_CANTO * Math.PI) / 180);

function eCanto(anterior, atual, seguinte) {
  const ax = atual.x - anterior.x;
  const ay = atual.y - anterior.y;
  const bx = seguinte.x - atual.x;
  const by = seguinte.y - atual.y;
  const normas = Math.hypot(ax, ay) * Math.hypot(bx, by);
  return normas > 0 && (ax * bx + ay * by) / normas < COSSENO_DO_CANTO;
}

// como se desenha o traço: curvas suaves entre os pontos médios, mas os cantos ficam cantos
// (uma caixa ou uma seta não podem ficar arredondadas). é a mesma receita para o ecrã, o pdf e o word
// devolve comandos { t: 'M' | 'L' | 'Q', x, y, cx?, cy? }
export function comandosDoTraco(pontos) {
  const comandos = [{ t: 'M', x: pontos[0].x, y: pontos[0].y }];
  for (let i = 1; i < pontos.length - 1; i++) {
    if (eCanto(pontos[i - 1], pontos[i], pontos[i + 1])) {
      comandos.push({ t: 'L', x: pontos[i].x, y: pontos[i].y });
    } else {
      comandos.push({ t: 'Q', cx: pontos[i].x, cy: pontos[i].y, x: (pontos[i].x + pontos[i + 1].x) / 2, y: (pontos[i].y + pontos[i + 1].y) / 2 });
    }
  }
  const ultimo = pontos[pontos.length - 1];
  comandos.push({ t: 'L', x: ultimo.x, y: ultimo.y });
  return comandos;
}

// o mesmo caminho em svg (para o pdf). um pontinho dá uma linha de comprimento zero que, com as
// pontas redondas, aparece como um ponto
export function caminhoSvg(traco) {
  const arredondar = (n) => Math.round(n * 10) / 10;
  return comandosDoTraco(pontosDoTraco(traco)).map((c) => (
    c.t === 'Q' ? `Q${arredondar(c.cx)} ${arredondar(c.cy)} ${arredondar(c.x)} ${arredondar(c.y)}` : `${c.t}${arredondar(c.x)} ${arredondar(c.y)}`
  )).join('');
}

// ---------- guardar e abrir ----------

export function serializarDesenho(tracos) {
  return tracos.length === 0 ? '' : JSON.stringify({ v: 1, t: tracos });
}

// abre o texto guardado; um desenho estragado nunca rebenta a nota, só se perde o que não presta
export function lerDesenho(texto) {
  if (!texto) return [];
  try {
    const dados = JSON.parse(texto);
    if (!dados || !Array.isArray(dados.t)) return [];
    return dados.t.slice(0, MAX_TRACOS).filter(tracoValido).map((t) => ({
      f: t.f,
      k: CORES.includes(t.k) ? t.k : 'tinta',
      l: [1, 2, 3].includes(t.l) ? t.l : 2,
      p: t.p,
    }));
  } catch {
    return [];
  }
}

export function tamanhoDoDesenhoEmBytes(tracos) {
  return new TextEncoder().encode(serializarDesenho(tracos)).length;
}

// ---------- o que está no papel ----------

// altura (em unidades) que a página tem de ter para caber o desenho todo
export function alturaDoDesenho(tracos) {
  let maior = 0;
  for (const traco of tracos) {
    for (const ponto of pontosDoTraco(traco)) maior = Math.max(maior, ponto.y + larguraDoTraco(traco) / 2);
  }
  return tracos.length === 0 ? 0 : Math.ceil(maior + MARGEM_ALTURA);
}

// a borracha apaga o traço inteiro que tocar: devolve os índices dos traços a menos de `raio` do ponto
export function tracosTocados(tracos, ponto, raio) {
  const tocados = [];
  tracos.forEach((traco, indice) => {
    const pontos = pontosDoTraco(traco);
    const alcance = raio + larguraDoTraco(traco) / 2;
    for (let i = 0; i < pontos.length; i++) {
      const perto = i === 0
        ? Math.hypot(ponto.x - pontos[0].x, ponto.y - pontos[0].y) <= alcance
        : distanciaPontoSegmento(ponto, pontos[i - 1], pontos[i]) <= alcance;
      if (perto) { tocados.push(indice); break; }
    }
  });
  return tocados;
}

// ---------- desfazer e refazer (cada alteração guarda a lista anterior) ----------

const MAX_HISTORICO = 60;

export function historicoInicial(tracos = []) {
  return { tracos, passado: [], futuro: [] };
}

function mudar(estado, novos) {
  return { tracos: novos, passado: [...estado.passado, estado.tracos].slice(-MAX_HISTORICO), futuro: [] };
}

export function adicionarTraco(estado, traco) {
  return estado.tracos.length >= MAX_TRACOS ? estado : mudar(estado, [...estado.tracos, traco]);
}

export function apagarTracos(estado, indices) {
  if (indices.length === 0) return estado;
  const fora = new Set(indices);
  return mudar(estado, estado.tracos.filter((_, i) => !fora.has(i)));
}

export function limparTudo(estado) {
  return estado.tracos.length === 0 ? estado : mudar(estado, []);
}

export function desfazer(estado) {
  if (estado.passado.length === 0) return estado;
  return { tracos: estado.passado.at(-1), passado: estado.passado.slice(0, -1), futuro: [estado.tracos, ...estado.futuro] };
}

export function refazer(estado) {
  if (estado.futuro.length === 0) return estado;
  return { tracos: estado.futuro[0], passado: [...estado.passado, estado.tracos], futuro: estado.futuro.slice(1) };
}
