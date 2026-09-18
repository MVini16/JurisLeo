// lógica pura de notas por cadeira — junta os elementos guardados com o motor de avaliação
// sem firebase, sem react: as páginas só chamam estas funções e mostram o resultado
import { avaliarCadeira, calcularNotaAC, calcularMediaAnual, escalaQualitativa, arredondar } from './avaliacao.js';

const PESOS_PADRAO = { provaEscrita: 0.5, outrosElementos: 0.5 };

// a prova escrita nunca pode valer mais de metade (regulamento de avaliação)
export function normalizarPesos(pesos) {
  const bruto = Number(pesos?.provaEscrita ?? PESOS_PADRAO.provaEscrita);
  const escrita = Math.round(Math.min(Math.max(Number.isNaN(bruto) ? 0.5 : bruto, 0), 0.5) * 100) / 100;
  return { provaEscrita: escrita, outrosElementos: Math.round((1 - escrita) * 100) / 100 };
}

// pesos guardados na cadeira, ou os de base (dadosLeonor), ou 50/50
export function pesosDaCadeira(cadeira, base) {
  return normalizarPesos(cadeira?.pesos ?? base?.pesos ?? PESOS_PADRAO);
}

// estado de uma cadeira a partir dos elementos em bruto guardados no firestore
export function estadoDaCadeira({ metodo, avaliacaoDados, pesos }) {
  const d = avaliacaoDados || {};
  const notaAC = d.provaEscrita != null && d.outrosElementos != null
    ? calcularNotaAC({ provaEscrita: d.provaEscrita, outrosElementos: d.outrosElementos, pesos: normalizarPesos(pesos) })
    : null;

  const resultado = avaliarCadeira({
    metodo,
    notaAC,
    exameEscrito: d.exameEscrito ?? null,
    exameOral: d.exameOral ?? null,
    exameRecurso: d.exameRecurso ?? null,
    melhoriaOral: d.melhoriaOral ?? null,
  });

  return { notaAC, resultado };
}

// resumo do ano: média das cadeiras já aprovadas, sem arredondamento
// o bónus de 0,6 só se aplica se fechar TODAS as cadeiras do ano letivo, por isso vai à parte
export function resumoDoAno(resultados) {
  const notas = resultados
    .filter((r) => r.estado === 'aprovada' && r.notaFinal != null)
    .map((r) => r.notaFinal);
  const todasAprovadas = resultados.length > 0 && notas.length === resultados.length;
  const media = notas.length > 0 ? calcularMediaAnual(notas, false) : null;

  return {
    media,
    mediaComBonus: media != null ? calcularMediaAnual(notas, true) : null,
    aprovadas: notas.length,
    total: resultados.length,
    todasAprovadas,
    escala: media != null ? escalaQualitativa(arredondar(media)) : null,
  };
}

// que campo(s) faz sentido lançar, consoante o método e o ponto em que a cadeira está
export function camposLancaveis(metodo) {
  const comuns = [
    { id: 'exameEscrito', rotulo: 'Exame escrito' },
    { id: 'exameOral', rotulo: 'Exame oral' },
    { id: 'exameRecurso', rotulo: 'Exame de recurso' },
    { id: 'melhoriaOral', rotulo: 'Melhoria (oral)' },
  ];
  if (metodo === 'A') {
    return [
      { id: 'provaEscrita', rotulo: 'Prova escrita (contínua)' },
      { id: 'outrosElementos', rotulo: 'Outros elementos (contínua)' },
      ...comuns,
    ];
  }
  return comuns;
}

// valida uma nota lançada à mão: inteiro entre 0 e 20, ou null se estiver vazia
export function lerNota(texto) {
  if (texto === '' || texto === null || texto === undefined) return { ok: true, valor: null };
  const n = Number(texto);
  if (Number.isNaN(n) || !Number.isInteger(n) || n < 0 || n > 20) return { ok: false, valor: null };
  return { ok: true, valor: n };
}
