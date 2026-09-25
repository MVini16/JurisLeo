// cálculos dos widgets do ecrã de início — funções puras, sem firebase nem react
// cada widget recebe dados já lidos pelos hooks e só decide o que mostrar
import { chaveData } from '../data/feriados.js';
import { diasEntre, dataDeChave, paraData } from './datas.js';
import { proximaProva } from './provas.js';
import { paraMinutos } from './ocorrencias.js';
import { minutosPorDia } from './estatisticasEstudo.js';

// dias até à próxima prova marcada; sem prova, até ao início da janela de frequências.
// fracao enche à medida que a data se aproxima (0 a 60 dias → 0 a 1), ao contrário do anel antigo
export function contagemFrequencias(eventos, janela, hoje = new Date(), horizonte = 60) {
  const prova = proximaProva(eventos, hoje);
  let alvo = null;
  if (prova) {
    alvo = { origem: 'prova', titulo: prova.titulo, cadeira: prova.cadeira, tipo: prova.tipo, data: prova.data, dias: prova.diasRestantes };
  } else if (janela?.inicio) {
    const data = dataDeChave(janela.inicio);
    const dias = diasEntre(hoje, data);
    if (dias >= 0) alvo = { origem: 'janela', titulo: 'Janela de frequências', cadeira: null, tipo: 'janela', data, dias };
  }
  if (!alvo) return null;
  return { ...alvo, fracao: Math.max(0, Math.min(1, 1 - alvo.dias / horizonte)) };
}

// a prática que começa daqui a pouco (por defeito na próxima hora) e ainda não começou
export function proximaPratica(aulasHoje, agora = new Date(), antecedencia = 60) {
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const candidatas = aulasHoje
    .filter((a) => a.tipoAula === 'pratica' && a.horaInicio && a.estadoAula !== 'cancelada')
    .map((a) => ({ aula: a, faltam: paraMinutos(a.horaInicio) - minutosAgora }))
    .filter((c) => c.faltam > 0 && c.faltam <= antecedencia)
    .sort((a, b) => a.faltam - b.faltam);
  return candidatas[0] || null;
}

// o dia numa linha: blocos das aulas (em % do dia de aulas) e os furos entre elas
export function linhaDoDia(aulasHoje, minimoFuro = 10) {
  const aulas = aulasHoje
    .filter((a) => a.horaInicio && a.horaFim && a.estadoAula !== 'cancelada')
    .map((a) => ({ aula: a, ini: paraMinutos(a.horaInicio), fim: paraMinutos(a.horaFim) }))
    .sort((a, b) => a.ini - b.ini);
  if (aulas.length === 0) return null;
  const inicio = aulas[0].ini;
  const fim = Math.max(...aulas.map((a) => a.fim));
  const total = Math.max(1, fim - inicio);
  const pct = (m) => ((m - inicio) / total) * 100;

  const furos = [];
  for (let i = 1; i < aulas.length; i++) {
    const livre = aulas[i].ini - aulas[i - 1].fim;
    if (livre >= minimoFuro) furos.push({ inicio: aulas[i - 1].fim, fim: aulas[i].ini, minutos: livre, esquerda: pct(aulas[i - 1].fim), largura: (livre / total) * 100 });
  }
  return {
    inicio,
    fim,
    blocos: aulas.map((a) => ({ aula: a.aula, ini: a.ini, fim: a.fim, esquerda: pct(a.ini), largura: ((a.fim - a.ini) / total) * 100 })),
    furos,
  };
}

// minutos → "16:10"
export function horaDeMinutos(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// quanto domina cada cadeira, pela última confiança (1 a 5) dos cartões já revistos.
// é um guia, não uma nota: cartões nunca revistos não contam
export function dominioPorCadeira(flashcards) {
  const porCadeira = {};
  for (const f of flashcards) {
    const c = f.ultimaConfianca;
    if (!f.cadeiraId || !(c >= 1 && c <= 5)) continue;
    (porCadeira[f.cadeiraId] ||= []).push((c - 1) / 4);
  }
  return Object.entries(porCadeira)
    .map(([cadeiraId, valores]) => ({ cadeiraId, cartoes: valores.length, percentagem: Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 100) }))
    .sort((a, b) => b.percentagem - a.percentagem);
}

// média simples das cadeiras (cada cadeira pesa o mesmo)
export function dominioMedio(porCadeira) {
  if (porCadeira.length === 0) return null;
  return Math.round(porCadeira.reduce((s, c) => s + c.percentagem, 0) / porCadeira.length);
}

// a anotação criada há cerca de um mês (28 a 32 dias), a mais perto dos 30
export function anotacaoDeHaUmMes(anotacoes, hoje = new Date()) {
  const candidatas = anotacoes
    .map((a) => ({ a, d: paraData(a.criadoEm) }))
    .filter(({ d }) => d)
    .map(({ a, d }) => ({ a, dias: diasEntre(d, hoje), d }))
    .filter(({ dias }) => dias >= 28 && dias <= 32)
    .sort((x, y) => Math.abs(x.dias - 30) - Math.abs(y.dias - 30));
  return candidatas[0] ? { anotacao: candidatas[0].a, data: candidatas[0].d } : null;
}

// a semana de segunda a domingo: minutos por dia, total, cartões e sumários
export function resumoDaSemana({ sessoes = [], flashcards = [], sumarios = [] }, hoje = new Date()) {
  const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - ((hoje.getDay() + 6) % 7), 12);
  const dias = Array.from({ length: 7 }, (_, i) => chaveData(new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + i, 12)));
  const naSemana = new Set(dias);
  const mapa = minutosPorDia(sessoes);
  const porDia = dias.map((chave) => mapa[chave] || 0);
  const nesta = (valor) => {
    const d = paraData(valor);
    return !!d && naSemana.has(chaveData(d));
  };
  return {
    porDia,
    hojeIndice: dias.indexOf(chaveData(hoje)),
    minutos: porDia.reduce((s, m) => s + m, 0),
    cartoes: flashcards.filter((f) => nesta(f.ultimaRevisaoEm)).length,
    sumarios: sumarios.filter((s) => nesta(s.atualizadoEm)).length,
  };
}
