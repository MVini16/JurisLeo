// a lógica do boneco do vini — pura, sem react nem firebase, para testar com vitest sem mocks:
// que resposta dar, quando pode puxar conversa sozinho, e as contas das tarefas e do contacto
import { PESO_DA_VOZ_BRINCALHONA, RESPOSTAS, PROATIVAS, ELOGIOS, PIADAS, REACOES, AULAS, BARNEY, SAUDADES } from '../data/boneco.js';

const UM_DIA_MS = 24 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;
const PEDIDOS_POR_NIVEL = {
  // máximo de conversas por dia e tempo mínimo entre duas
  'as-vezes': { maximoPorDia: 1, intervaloMs: 6 * HORA_MS },
  mais: { maximoPorDia: 3, intervaloMs: 3 * HORA_MS },
};

// escolhe uma frase da lista sem repetir a última (se houver alternativas)
export function escolherDe(lista, ultima, aleatorio = Math.random) {
  if (lista.length === 0) return null;
  const candidatas = lista.length > 1 && ultima != null ? lista.filter((t) => t !== ultima) : lista;
  return candidatas[Math.min(Math.floor(aleatorio() * candidatas.length), candidatas.length - 1)];
}

// a resposta a um estado: sorteia a voz (mais carinhosa quando ela está em baixo) e depois a frase
// `extra` são as frases que o vini acrescentou na consola (services/frasesExtra.js). em "estou mesmo mal" nunca entram
export function escolherResposta(estado, { ultima = null, aleatorio = Math.random, extra = {} } = {}) {
  const banco = RESPOSTAS[estado];
  if (!banco) return null;
  const extras = estado === 'mal' ? [] : (extra.respostas?.[estado] ?? []);
  const brincalhonas = [...banco.brincalhona, ...extras];
  const peso = PESO_DA_VOZ_BRINCALHONA[estado] ?? 0;
  const brincalhona = brincalhonas.length > 0 && aleatorio() < peso;
  const voz = brincalhona ? 'brincalhona' : 'carinhosa';
  return { texto: escolherDe(brincalhona ? brincalhonas : banco.carinhosa, ultima, aleatorio), voz };
}

// "uma coisa boa para ouvir": elogios, saudades e frases do barney misturados, mais as da consola
export function escolherElogio(ultimo, aleatorio = Math.random, extra = {}) {
  return escolherDe([...ELOGIOS, ...SAUDADES, ...BARNEY, ...(extra.elogios ?? [])], ultimo, aleatorio);
}

// o que ele diz depois de ela jogar ou estudar
export function escolherReacao(ultima, aleatorio = Math.random) {
  return escolherDe(REACOES, ultima, aleatorio);
}

// reage a um fim de jogo ou de estudo? nem sempre (senão cansava): ~metade das vezes e no máximo de 15 em 15 minutos
export const INTERVALO_REACOES_MS = 15 * 60 * 1000;
export function deveReagir({ agora, ultimaReacao = 0, aleatorio = Math.random }) {
  if (agora - ultimaReacao < INTERVALO_REACOES_MS) return false;
  return aleatorio() < 0.5;
}

export function escolherPiada(ultima, aleatorio = Math.random, extra = {}) {
  return escolherDe([...PIADAS, ...(extra.piadas ?? [])], ultima, aleatorio);
}

// ---------- quando ele puxa conversa ----------

export function motivoPorHora(hora) {
  if (hora >= 22 || hora < 2) return 'noite';
  if (hora >= 6 && hora < 12) return 'manha';
  return 'tarde';
}

// `diaDaSemana` (0 a 6, domingo é 0): de segunda a sexta, de manhã e à tarde, às vezes fala da aula
export function escolherProativa(hora, aleatorio = Math.random, extra = {}, diaDaSemana = null) {
  const motivo = motivoPorHora(hora);
  const voz = aleatorio() < 0.5 ? 'brincalhona' : 'carinhosa';
  const diaDeAulas = diaDaSemana !== null && diaDaSemana >= 1 && diaDaSemana <= 5;
  if (diaDeAulas && motivo !== 'noite' && aleatorio() < 0.2) return { motivo: 'aulas', voz, texto: escolherDe(AULAS, null, aleatorio) };
  return { motivo, voz, texto: escolherDe([...PROATIVAS[motivo][voz], ...(extra.proativas ?? [])], null, aleatorio) };
}

// páginas onde ele aparece mas fica quieto (ela está a escrever, a estudar ou a rever)
export function rotaOcupada(caminho) {
  return /^\/(anotacoes|casos)\/[^/]+/.test(caminho) || caminho === '/estudo' || caminho === '/flashcards';
}

// páginas de entrada, onde ele nem aparece
export function rotaSemBoneco(caminho) {
  return caminho === '/' || caminho === '/login' || caminho === '/onboarding';
}

// o fim do dia, na hora local: "hoje não" cala-o até lá
export function fimDoDia(agora) {
  const dia = new Date(agora);
  dia.setHours(24, 0, 0, 0);
  return dia.getTime();
}

// pode puxar conversa agora? só se ela deixar, não houver nada a meio, e já tiver passado tempo desde a última.
// `historico` são os momentos (em ms) das últimas conversas que ele puxou
export function podeFalarSozinho({ agora, prefs, caminho, historico = [], adiadoAte = 0, janelaAberta = false }) {
  if (!prefs.boneco || janelaAberta) return false;
  const nivel = PEDIDOS_POR_NIVEL[prefs.bonecoConversa];
  if (!nivel) return false;
  if (agora < adiadoAte) return false;
  if (rotaSemBoneco(caminho) || rotaOcupada(caminho)) return false;
  const recentes = historico.filter((t) => agora - t < UM_DIA_MS);
  if (recentes.length >= nivel.maximoPorDia) return false;
  const ultima = recentes.length > 0 ? Math.max(...recentes) : 0;
  return agora - ultima >= nivel.intervaloMs;
}

// guarda só o que interessa, para a lista não crescer sem fim
export function acrescentarAoHistorico(historico, agora) {
  return [...historico.filter((t) => agora - t < UM_DIA_MS), agora].slice(-10);
}

// ---------- as tarefas mais urgentes ----------

// as `n` tarefas por fazer com o prazo mais curto (as atrasadas primeiro, as sem prazo no fim)
export function tarefasUrgentes(tarefas, n = 3) {
  return tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => {
      if (!a.prazo && !b.prazo) return 0;
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;
      return a.prazo.localeCompare(b.prazo);
    })
    .slice(0, n);
}

// ---------- o contacto do vini ----------

// só dígitos (e um + à frente): é o que o telemóvel precisa para ligar
export function limparTelefone(texto) {
  const limpo = String(texto ?? '').trim();
  const sinal = limpo.startsWith('+') ? '+' : '';
  return `${sinal}${limpo.replace(/\D/g, '')}`;
}

export function telefoneValido(texto) {
  const digitos = limparTelefone(texto).replace(/^\+/, '');
  return digitos.length >= 9 && digitos.length <= 15;
}

// as ligações para ligar ou mandar mensagem, ou nada se o número não servir
export function ligacoesDoContacto(texto) {
  if (!telefoneValido(texto)) return null;
  const numero = limparTelefone(texto);
  // o WhatsApp precisa do indicativo: um número de 9 dígitos é português, por isso leva 351 à frente
  const digitos = numero.replace(/^\+/, '');
  const comIndicativo = digitos.length === 9 ? `351${digitos}` : digitos;
  return { ligar: `tel:${numero}`, mensagem: `sms:${numero}`, whatsapp: `https://wa.me/${comIndicativo}` };
}

export function ligacaoDaLinha(numero) {
  return `tel:${limparTelefone(numero)}`;
}

// o contacto do vini pode chegar por um link (jurisleo.../?vini=931143554): guarda-se só no telemóvel dela e o número
// não fica escrito em lado nenhum do código. devolve o número ou null
export function contactoDoLink(textoDaUrl) {
  const valor = new URLSearchParams(String(textoDaUrl ?? '')).get('vini');
  return valor && telefoneValido(valor) ? limparTelefone(valor) : null;
}
