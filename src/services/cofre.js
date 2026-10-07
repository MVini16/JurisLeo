// o cofre: uma cópia completa de tudo o que a leonor tem na conta, guardada uma vez por dia na própria conta
// (users/{uid}/cofre/{AAAA-MM-DD}), para nada se perder nem com uma versão nova, nem com a app reinstalada,
// nem com um botão carregado por engano. lógica pura (sem firebase nem react): serializar, partir, escolher o que apagar e resumir.
// a parte que fala com o firestore está em cofreConta.js

export const MANTER_DIAS = 14; // guarda as últimas 14 cópias
export const TAMANHO_PARTE = 300000; // carateres por parte: mesmo com acentos fica abaixo do limite de 1 MB de um documento

// AAAA-MM-DD na hora de lisboa do telemóvel (não em utc, para o dia mudar à meia-noite dela)
export function diaDe(data) {
  const d = data instanceof Date ? data : new Date(data);
  const doisDig = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${doisDig(d.getMonth() + 1)}-${doisDig(d.getDate())}`;
}

function eTimestamp(v) {
  return !!v && typeof v === 'object' && typeof v.toMillis === 'function' && typeof v.seconds === 'number' && typeof v.nanoseconds === 'number';
}

// passa tudo para texto sem perder as datas do firestore (ficam como { __ts: [segundos, nanos] })
// e as datas normais (ficam como { __data: iso }), para voltarem ao tipo certo ao repor
export function serializar(dados) {
  return JSON.stringify(dados, function substituir(chave, valor) {
    const original = this[chave];
    if (eTimestamp(original)) return { __ts: [original.seconds, original.nanoseconds] };
    if (original instanceof Date) return { __data: original.toISOString() };
    return valor;
  });
}

// o contrário de serializar. `criarTimestamp(segundos, nanos)` vem de fora (do firestore), para isto continuar puro
export function desserializar(texto, criarTimestamp) {
  return JSON.parse(texto, (_chave, valor) => {
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      if (Array.isArray(valor.__ts) && valor.__ts.length === 2 && Object.keys(valor).length === 1) return criarTimestamp(valor.__ts[0], valor.__ts[1]);
      if (typeof valor.__data === 'string' && Object.keys(valor).length === 1) return new Date(valor.__data);
    }
    return valor;
  });
}

// parte um texto grande em pedaços que cabem num documento cada
export function partir(texto, tamanho = TAMANHO_PARTE) {
  if (!texto) return [''];
  const partes = [];
  for (let i = 0; i < texto.length; i += tamanho) partes.push(texto.slice(i, i + tamanho));
  return partes;
}

// das cópias que existem (ids AAAA-MM-DD, às vezes com sufixo), as que já estão a mais e podem ir embora
export function copiasAApagar(ids, manter = MANTER_DIAS) {
  const diarias = ids.filter((id) => /^\d{4}-\d{2}-\d{2}$/.test(id)).sort().reverse();
  const extras = ids.filter((id) => !/^\d{4}-\d{2}-\d{2}$/.test(id)).sort().reverse();
  // as cópias especiais (ex.: "antes de repor") também não ficam para sempre: no máximo 5
  return [...diarias.slice(manter), ...extras.slice(5)];
}

// números simples de uma cópia, para a lista do cofre e para a consola do vini
export function resumir(dados) {
  const contar = (v) => (Array.isArray(v) ? v.length : 0);
  const cadeiras = Array.isArray(dados?.cadeiras) ? dados.cadeiras : [];
  let presencas = 0; let notasAulas = 0;
  cadeiras.forEach((c) => {
    presencas += Object.keys(c?.presencas?.marcas || {}).length;
    notasAulas += Object.keys(c?.presencas?.notasAulas || {}).length;
  });
  return {
    cadeiras: cadeiras.length,
    presencas,
    notasAulas,
    notas: contar(dados?.anotacoes),
    tarefas: contar(dados?.tarefas),
    flashcards: contar(dados?.flashcards),
    eventos: contar(dados?.eventos),
    casos: contar(dados?.casos),
    estudo: contar(dados?.sessoesEstudo),
    definicoes: Object.keys(dados?.configuracoes?.copiaLocal || {}).length,
  };
}

// o resumo em palavras, para a lista do cofre ("14 aulas marcadas, 3 sumários, 2 notas")
const NOMES_RESUMO = [
  ['presencas', 'aula marcada', 'aulas marcadas'],
  ['notasAulas', 'sumário', 'sumários'],
  ['notas', 'nota', 'notas'],
  ['tarefas', 'tarefa', 'tarefas'],
  ['flashcards', 'flashcard', 'flashcards'],
  ['eventos', 'evento', 'eventos'],
  ['casos', 'caso prático', 'casos práticos'],
  ['estudo', 'sessão de estudo', 'sessões de estudo'],
  ['definicoes', 'escolha guardada', 'escolhas guardadas'],
];
export function descreverResumo(resumo) {
  const partes = NOMES_RESUMO
    .filter(([k]) => resumo?.[k] > 0)
    .map(([k, um, varios]) => `${resumo[k]} ${resumo[k] === 1 ? um : varios}`);
  return partes.length ? partes.join(', ') : 'só as cadeiras, ainda sem nada teu';
}

// uma cópia "vazia" (só as cadeiras que a app cria sozinha, nada que ela tenha feito): não vale a pena guardar
// e, na consola, é sinal de que os dados não estão a chegar à conta
export function pareceVazia(resumo) {
  // eslint-disable-next-line no-unused-vars
  const { cadeiras, ...resto } = resumo || {};
  return Object.values(resto).every((n) => !n);
}
