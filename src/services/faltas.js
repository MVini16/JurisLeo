// motor de faltas — função pura, sem firebase, sem react
//
// fica excluída da cadeira quem faltar:
// - sem justificação a um quarto ou mais das aulas práticas efetivamente lecionadas, ou
// - a metade ou mais das aulas práticas previstas no calendário escolar (justificadas + injustificadas)

export function estadoFaltas({
  aulasPraticasPrevistas,
  aulasPraticasLecionadas,
  faltasInjustificadas,
  faltasJustificadas,
}) {
  const limiteInjustificadas = aulasPraticasLecionadas / 4;
  const limiteTotal = aulasPraticasPrevistas / 2;

  const excluidaPorInjustificadas = faltasInjustificadas >= limiteInjustificadas;
  const excluidaPorTotal = (faltasInjustificadas + faltasJustificadas) >= limiteTotal;
  const excluida = excluidaPorInjustificadas || excluidaPorTotal;

  // motivo prioriza injustificadas, por ser em geral o que dispara primeiro
  const motivoExclusao = !excluida ? null : (excluidaPorInjustificadas ? 'injustificadas' : 'totalPrevistas');

  // maior nº inteiro de faltas que ainda fica abaixo do limite
  const maxInjustificadas = Math.ceil(limiteInjustificadas) - 1;
  const maxTotal = Math.ceil(limiteTotal) - 1;

  const faltasRestantesInjustificadas = Math.max(0, maxInjustificadas - faltasInjustificadas);
  const faltasRestantesTotal = Math.max(0, maxTotal - (faltasInjustificadas + faltasJustificadas));
  const faltasRestantes = Math.min(faltasRestantesInjustificadas, faltasRestantesTotal);

  let semaforo;
  if (excluida || faltasRestantes === 0) semaforo = 'vermelho';
  else if (faltasRestantes <= 2) semaforo = 'amarelo';
  else semaforo = 'verde';

  const explicacao = excluida
    ? (motivoExclusao === 'injustificadas'
      ? `Excluída — ${faltasInjustificadas} faltas injustificadas é um quarto ou mais das ${aulasPraticasLecionadas} aulas práticas já dadas.`
      : `Excluída — o total de faltas já chega a metade das ${aulasPraticasPrevistas} aulas práticas previstas para o semestre.`)
    : `Podes dar mais ${faltasRestantes} falta${faltasRestantes === 1 ? '' : 's'} injustificada${faltasRestantes === 1 ? '' : 's'} sem risco de exclusão.`;

  const aviso = aulasPraticasLecionadas < aulasPraticasPrevistas / 2
    ? 'No início do semestre cada falta pesa mais, porque a conta é feita sobre as aulas que já foram dadas.'
    : null;

  return {
    excluida,
    motivoExclusao,
    limiteInjustificadas,
    limiteTotal,
    faltasRestantesInjustificadas,
    faltasRestantesTotal,
    faltasRestantes,
    semaforo,
    explicacao,
    aviso,
  };
}
