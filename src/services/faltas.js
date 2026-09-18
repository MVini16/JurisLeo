// motor de faltas — função pura, sem firebase, sem react
//
// fica excluída da cadeira quem faltar:
// - sem justificação a um quarto ou mais das aulas práticas efetivamente lecionadas, ou
// - a metade ou mais das aulas práticas previstas no calendário escolar (justificadas + injustificadas)
//
// no início do semestre a regra do quarto é apertadíssima, porque conta sobre as aulas já dadas
// (com 8 aulas, 2 faltas já são 25%). por isso o número principal é quantas faltas ainda pode
// dar até ao fim do semestre (sobre as previstas) e a proporção atual é só informação —
// nunca dá vermelho antes de metade do semestre só por causa dela (secção 7.4 da spec)

// estados de uma ocorrência de aula
export const ESTADOS_AULA = {
  porMarcar: 'porMarcar',
  fui: 'fui',
  faltei: 'faltei',
  stotFaltou: 'stotFaltou',
  cancelada: 'cancelada',
};

// só as aulas a que fui ou faltei foram efetivamente lecionadas para ela
export function contaComoLecionada(estado) {
  return estado === 'fui' || estado === 'faltei';
}

export function contaComoFalta(estado) {
  return estado === 'faltei';
}

// conta lecionadas e faltas a partir das ocorrências marcadas e dos registos de falta
// - ocorrencias: [{ tipo: 'pratica'|'teorica', estado }]
// - registos: [{ justificada: bool, ocorrenciaId?: string }]
// - ajusteLecionadas: correção manual (pode ser negativa) para quando a contagem não bate certo
// uma falta registada sem aula marcada no calendário também conta como aula dada
export function contarFaltas({ ocorrencias = [], registos = [], ajusteLecionadas = 0 }) {
  const praticasDadas = ocorrencias.filter((o) => o.tipo === 'pratica' && contaComoLecionada(o.estado)).length;
  const faltasSoltas = registos.filter((r) => !r.ocorrenciaId).length;

  return {
    aulasPraticasLecionadas: Math.max(0, praticasDadas + faltasSoltas + ajusteLecionadas),
    faltasInjustificadas: registos.filter((r) => !r.justificada).length,
    faltasJustificadas: registos.filter((r) => r.justificada).length,
  };
}

export function estadoFaltas({
  aulasPraticasPrevistas,
  aulasPraticasLecionadas,
  faltasInjustificadas,
  faltasJustificadas,
}) {
  const previstas = aulasPraticasPrevistas;
  const lecionadas = aulasPraticasLecionadas;
  const faltasTotal = faltasInjustificadas + faltasJustificadas;

  const limiteInjustificadas = lecionadas / 4;
  const limiteTotal = previstas / 2;

  // sem nenhuma falta nunca está excluída, mesmo que ainda não tenha havido aulas
  const excluidaPorInjustificadas = faltasInjustificadas > 0 && faltasInjustificadas >= limiteInjustificadas;
  const excluidaPorTotal = faltasTotal > 0 && faltasTotal >= limiteTotal;
  const excluida = excluidaPorInjustificadas || excluidaPorTotal;

  // motivo prioriza injustificadas, por ser em geral o que dispara primeiro
  const motivoExclusao = !excluida ? null : (excluidaPorInjustificadas ? 'injustificadas' : 'totalPrevistas');

  // margens sobre as aulas lecionadas até hoje (o que vale "agora")
  const maxInjustificadas = Math.ceil(limiteInjustificadas) - 1;
  const maxTotal = Math.ceil(limiteTotal) - 1;
  const faltasRestantesInjustificadas = Math.max(0, maxInjustificadas - faltasInjustificadas);
  const faltasRestantesTotal = Math.max(0, maxTotal - faltasTotal);
  const faltasRestantes = Math.min(faltasRestantesInjustificadas, faltasRestantesTotal);

  // margens sobre as aulas previstas (o que vale no fim do semestre) — é este o número principal
  const maxInjustificadasSemestre = Math.ceil(previstas / 4) - 1;
  const faltasRestantesSemestre = Math.min(
    Math.max(0, maxInjustificadasSemestre - faltasInjustificadas),
    Math.max(0, maxTotal - faltasTotal)
  );

  const passouMeioSemestre = lecionadas >= previstas / 2;
  // a proporção corrente só exclui a sério depois de metade do semestre
  const excluidaConfirmada = excluidaPorTotal || (excluidaPorInjustificadas && passouMeioSemestre);

  const proporcaoAtual = lecionadas > 0 ? faltasInjustificadas / lecionadas : 0;
  const percentagemAtual = Math.round(proporcaoAtual * 100);

  let semaforo;
  if (excluidaConfirmada || faltasRestantesSemestre === 0) semaforo = 'vermelho';
  else if (faltasRestantesSemestre <= 2 || excluidaPorInjustificadas) semaforo = 'amarelo';
  else semaforo = 'verde';

  let explicacao;
  if (excluidaConfirmada) {
    explicacao = excluidaPorInjustificadas && passouMeioSemestre && !excluidaPorTotal
      ? `Excluída — ${faltasInjustificadas} faltas injustificadas é um quarto ou mais das ${lecionadas} aulas práticas já dadas.`
      : `Excluída — o total de faltas já chega a metade das ${previstas} aulas práticas previstas para o semestre.`;
  } else if (faltasRestantesSemestre === 0) {
    explicacao = 'Já não podes faltar mais este semestre sem risco de exclusão.';
  } else {
    explicacao = `Ainda podes faltar mais ${faltasRestantesSemestre} ${faltasRestantesSemestre === 1 ? 'vez' : 'vezes'} até ao fim do semestre sem risco de exclusão, contando as ${previstas} aulas previstas.`;
  }

  const explicacaoAgora = lecionadas > 0
    ? `Neste momento, ${faltasInjustificadas} ${faltasInjustificadas === 1 ? 'falta injustificada é' : 'faltas injustificadas são'} ${percentagemAtual}% das ${lecionadas} aulas já dadas (o limite é 25%).`
    : 'Ainda não houve aulas práticas, por isso ainda não há proporção para calcular.';

  const aviso = !passouMeioSemestre
    ? 'No início do semestre cada falta pesa mais, porque a conta é feita sobre as aulas que já foram dadas.'
    : null;

  return {
    excluida,
    excluidaConfirmada,
    motivoExclusao,
    limiteInjustificadas,
    limiteTotal,
    faltasRestantesInjustificadas,
    faltasRestantesTotal,
    faltasRestantes,
    faltasRestantesSemestre,
    proporcaoAtual,
    percentagemAtual,
    semaforo,
    explicacao,
    explicacaoAgora,
    aviso,
    // aviso quando faltam duas ou menos para o limite
    quaseNoLimite: !excluidaConfirmada && faltasRestantesSemestre > 0 && faltasRestantesSemestre <= 2,
  };
}

// prazo do comprovativo: até às 24h do dia útil seguinte (sábado e domingo não contam)
// devolve a data-limite às 23:59:59, ou null se for uma data inválida
export function prazoComprovativo(dataFalta) {
  const d = new Date(dataFalta);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 0);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}
