// calculadora de prazos — funções puras, sem firebase nem react
// convenção usada: o dia em que o prazo começa NÃO conta; o primeiro dia a contar é o seguinte.
// dias úteis = sem sábados, domingos e feriados nacionais (data/feriados.js).
// não inclui tolerâncias, férias judiciais nem outros dias sem expediente: cada prazo real tem
// as suas regras, por isso a app avisa sempre para confirmar no diploma ou na notificação.
import { nomeFeriado, chaveData } from '../data/feriados.js';

export const TIPOS_PRAZO = [
  { id: 'uteis', nome: 'Dias úteis' },
  { id: 'seguidos', nome: 'Dias seguidos' },
];

// prazos que estão no regulamento de avaliação e nas regras de faltas (secção 5.3 da spec)
export const PRAZOS_PREDEFINIDOS = [
  { id: 'recurso-nota', nome: 'Recurso da nota do escrito', dias: 2, tipo: 'uteis', fonte: 'Regulamento de avaliação: 2 dias úteis após a publicação da nota.' },
  { id: 'comprovativo', nome: 'Comprovativo de falta', dias: 1, tipo: 'uteis', fonte: 'Regras de faltas: comprovativos até às 24h do dia útil seguinte.' },
];

function meioDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12);
}

function somaDias(data, n) {
  const d = new Date(data);
  d.setDate(d.getDate() + n);
  return d;
}

export function fimDeSemana(data) {
  const dia = data.getDay();
  return dia === 0 || dia === 6;
}

export function ehDiaUtil(data) {
  return !fimDeSemana(data) && nomeFeriado(data) === null;
}

// o dia útil mais próximo, para a frente, a começar no próprio dia
export function proximoDiaUtil(data) {
  let d = meioDia(data);
  while (!ehDiaUtil(d)) d = somaDias(d, 1);
  return d;
}

// por que razão um dia não conta: 'sábado', 'domingo' ou o nome do feriado
function motivoDeSalto(data) {
  const feriado = nomeFeriado(data);
  if (feriado) return feriado;
  if (data.getDay() === 6) return 'sábado';
  if (data.getDay() === 0) return 'domingo';
  return null;
}

// conta `dias` a partir de `inicio`.
// opcoes: { tipo: 'uteis' | 'seguidos', passaParaUtil: bool }
// passaParaUtil: se o último dia cair num dia sem expediente, passa para o dia útil seguinte
// devolve { fim, saltados: [{ data, motivo }], passouParaUtil: bool, motivoPassagem }
export function calcularPrazo(inicio, dias, { tipo = 'uteis', passaParaUtil = false } = {}) {
  const n = Math.max(0, Math.floor(Number(dias) || 0));
  const saltados = [];
  let atual = meioDia(inicio);

  if (tipo === 'uteis') {
    let contados = 0;
    while (contados < n) {
      atual = somaDias(atual, 1);
      if (ehDiaUtil(atual)) contados += 1;
      else saltados.push({ data: atual, motivo: motivoDeSalto(atual) });
    }
  } else {
    atual = somaDias(atual, n);
  }

  let passouParaUtil = false;
  let motivoPassagem = null;
  if (passaParaUtil && n > 0 && !ehDiaUtil(atual)) {
    motivoPassagem = motivoDeSalto(atual);
    atual = proximoDiaUtil(atual);
    passouParaUtil = true;
  }

  return { fim: atual, saltados, passouParaUtil, motivoPassagem };
}

// dias úteis entre duas datas, sem contar o início e contando o fim
export function diasUteisEntre(inicio, fim) {
  let d = meioDia(inicio);
  const limite = chaveData(fim);
  let total = 0;
  while (chaveData(d) < limite) {
    d = somaDias(d, 1);
    if (ehDiaUtil(d)) total += 1;
  }
  return total;
}

// o que a app diz para explicar o cálculo, em frases curtas
export function explicarPrazo({ saltados, passouParaUtil, motivoPassagem }) {
  const frases = ['O dia em que começa não conta.'];
  if (saltados.length) {
    const fins = saltados.filter((s) => s.motivo === 'sábado' || s.motivo === 'domingo').length;
    const feriados = saltados.filter((s) => s.motivo !== 'sábado' && s.motivo !== 'domingo');
    const partes = [];
    if (fins) partes.push(`${fins} ${fins === 1 ? 'dia de fim de semana' : 'dias de fim de semana'}`);
    if (feriados.length) partes.push(feriados.length === 1 ? `1 feriado (${feriados[0].motivo})` : `${feriados.length} feriados (${feriados.map((f) => f.motivo).join(', ')})`);
    frases.push(`Não contámos ${partes.join(' e ')}.`);
  }
  if (passouParaUtil) frases.push(`Acabava num dia sem expediente (${motivoPassagem}), por isso passou para o dia útil seguinte.`);
  return frases;
}
