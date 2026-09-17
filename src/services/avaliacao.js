// motor de avaliação — função pura, sem firebase, sem react
// regulamento de avaliação de conhecimentos da licenciatura em direito, fdul

// arredonda ao inteiro mais próximo, com 0,5 sempre para cima
export function arredondar(valor) {
  return Math.floor(valor + 0.5);
}

// calcula a nota de avaliação contínua a partir dos elementos
// pesos somam 1. o peso da prova escrita nunca pode passar 0.5
export function calcularNotaAC({ provaEscrita, outrosElementos, pesos }) {
  const pesoEscrita = Math.min(pesos.provaEscrita, 0.5);
  const pesoOutros = 1 - pesoEscrita;
  return arredondar(provaEscrita * pesoEscrita + outrosElementos * pesoOutros);
}

// aplica a regra do exame oral, igual nos dois métodos —
// a oral só prevalece se for positiva e melhor que a nota de entrada
function avaliarOral(entrada, exameOral) {
  const media = arredondar((exameOral + entrada) / 2);
  if (exameOral >= 10 && exameOral > entrada) {
    return { estado: 'aprovada', notaFinal: exameOral };
  }
  if (media >= 10) {
    return { estado: 'aprovada', notaFinal: media };
  }
  return { estado: 'excluida', notaFinal: media };
}

// devolve o estado completo de uma cadeira
export function avaliarCadeira({ metodo, notaAC = null, exameEscrito = null, exameOral = null, exameRecurso = null, melhoriaOral = null }) {
  const avisos = [];
  let resultado;

  if (metodo === 'A') {
    resultado = avaliarMetodoA({ notaAC, exameEscrito, exameOral, avisos });
  } else {
    resultado = avaliarMetodoB({ exameEscrito, exameOral, avisos });
  }

  // exame de recurso — só se a cadeira ficou excluída
  if (resultado.estado === 'excluida' && exameRecurso != null) {
    avisos.push('Máximo de 4 cadeiras em recurso por ano letivo.');
    if (exameRecurso >= 10) {
      resultado = { ...resultado, estado: 'aprovada', notaFinal: exameRecurso, explicacao: `Aprovada no recurso com ${exameRecurso} valores.`, proximoPasso: 'Cadeira concluída.' };
    } else {
      resultado = { ...resultado, estado: 'excluida', notaFinal: exameRecurso, explicacao: `Continuas excluída — ${exameRecurso} valores no recurso não chegam.`, proximoPasso: 'Sem mais hipóteses este ano letivo, a não ser inscrição no ano seguinte.' };
    }
  }

  // melhoria de nota — só se já havia uma nota final e a cadeira estava aprovada
  if (resultado.estado === 'aprovada' && melhoriaOral != null) {
    avisos.push('Só podes fazer uma melhoria por cadeira.');
    if (melhoriaOral > resultado.notaFinal) {
      resultado = { ...resultado, notaFinal: melhoriaOral, explicacao: `A melhoria correu bem — a nota sobe de volta para ${melhoriaOral}.`, proximoPasso: 'Cadeira concluída.' };
    } else {
      resultado = { ...resultado, explicacao: `A melhoria (${melhoriaOral}) não superou a nota anterior (${resultado.notaFinal}), por isso mantém-se.`, proximoPasso: 'Cadeira concluída.' };
    }
  }

  return {
    estado: resultado.estado,
    notaFinal: resultado.notaFinal ?? null,
    notaEntradaOral: resultado.notaEntradaOral ?? null,
    explicacao: resultado.explicacao,
    proximoPasso: resultado.proximoPasso,
    podeRequererReinscricaoMetodoA: resultado.podeRequererReinscricaoMetodoA || false,
    avisos: [...avisos, ...(resultado.avisos || [])],
  };
}

function avaliarMetodoA({ notaAC, exameEscrito, exameOral, avisos }) {
  if (notaAC == null) {
    return { estado: 'semDados', notaFinal: null, explicacao: 'Ainda não há nota de avaliação contínua.', proximoPasso: 'Aguarda os elementos de avaliação.' };
  }

  if (notaAC >= 12) {
    let base = { estado: 'aprovada', notaFinal: notaAC, explicacao: `Aprovada com ${notaAC} valores. A tua nota de avaliação contínua chegou aos ${notaAC}, por isso não tens de ir a exame.`, proximoPasso: 'Cadeira concluída.' };
    return base;
  }

  if (notaAC === 10 || notaAC === 11) {
    if (exameEscrito == null) {
      return { estado: 'admitidaEscrito', notaFinal: null, explicacao: `Ficaste com ${notaAC} na avaliação contínua — vais a exame escrito.`, proximoPasso: 'Fazer o exame escrito.' };
    }

    const media = (notaAC + exameEscrito) / 2;
    const mediaArredondada = arredondar(media);

    if (exameEscrito <= 7) {
      return { estado: 'excluida', notaFinal: exameEscrito, explicacao: `Ficaste excluída com ${exameEscrito} no exame escrito.`, proximoPasso: 'Podes inscrever-te no exame de recurso.' };
    }
    if (exameEscrito >= 10) {
      return { estado: 'aprovada', notaFinal: mediaArredondada, explicacao: `Aprovada com ${mediaArredondada} valores (${notaAC} na contínua, ${exameEscrito} no escrito).`, proximoPasso: 'Cadeira concluída.' };
    }
    if (mediaArredondada >= 12) {
      return { estado: 'aprovada', notaFinal: mediaArredondada, explicacao: `Aprovada com ${mediaArredondada} valores.`, proximoPasso: 'Cadeira concluída.' };
    }

    if (exameOral != null) {
      const oral = avaliarOral(mediaArredondada, exameOral);
      const explicacaoOral = oral.estado === 'aprovada'
        ? `Aprovada com ${oral.notaFinal} valores depois da oral.`
        : `Ficaste excluída com ${oral.notaFinal} depois da oral.`;
      return { ...oral, notaEntradaOral: mediaArredondada, explicacao: explicacaoOral, proximoPasso: oral.estado === 'aprovada' ? 'Cadeira concluída.' : 'Podes inscrever-te no exame de recurso.' };
    }

    return {
      estado: 'admitidaOral',
      notaFinal: null,
      notaEntradaOral: mediaArredondada,
      explicacao: `Vais a oral com ${mediaArredondada} de entrada. Se tirares mais do que isso na oral, a nota da oral substitui esta.`,
      proximoPasso: 'Fazer a prova oral.',
    };
  }

  // notaAC <= 9
  const podeReinscricao = notaAC === 8 || notaAC === 9;
  if (podeReinscricao) {
    avisos.push('Tens 24 horas para pedir reinscrição em Método A.');
  }
  return {
    estado: 'passaMetodoB',
    notaFinal: notaAC,
    explicacao: `Ficaste com ${notaAC} na avaliação contínua — passas para Método B.`,
    proximoPasso: podeReinscricao ? 'Podes pedir reinscrição em Método A nas próximas 24 horas.' : 'Fazer o exame de Método B.',
    podeRequererReinscricaoMetodoA: podeReinscricao,
  };
}

function avaliarMetodoB({ exameEscrito, exameOral }) {
  if (exameEscrito == null) {
    return { estado: 'semDados', notaFinal: null, explicacao: 'Ainda não há nota do exame escrito.', proximoPasso: 'Fazer o exame escrito.' };
  }

  if (exameEscrito >= 12) {
    return { estado: 'aprovada', notaFinal: exameEscrito, explicacao: `Aprovada com ${exameEscrito} valores.`, proximoPasso: 'Cadeira concluída.' };
  }
  if (exameEscrito <= 7) {
    return { estado: 'excluida', notaFinal: exameEscrito, explicacao: `Ficaste excluída com ${exameEscrito} no exame escrito.`, proximoPasso: 'Podes inscrever-te no exame de recurso.' };
  }

  // 8 a 11 — admitida a oral
  if (exameOral != null) {
    const oral = avaliarOral(exameEscrito, exameOral);
    const explicacaoOral = oral.estado === 'aprovada'
      ? `Aprovada com ${oral.notaFinal} valores depois da oral.`
      : `Ficaste excluída com ${oral.notaFinal} depois da oral.`;
    return { ...oral, notaEntradaOral: exameEscrito, explicacao: explicacaoOral, proximoPasso: oral.estado === 'aprovada' ? 'Cadeira concluída.' : 'Podes inscrever-te no exame de recurso.' };
  }

  return {
    estado: 'admitidaOral',
    notaFinal: null,
    notaEntradaOral: exameEscrito,
    explicacao: `Vais a oral com ${exameEscrito} de entrada. Se tirares mais do que isso na oral, a nota da oral substitui esta.`,
    proximoPasso: 'Fazer a prova oral.',
  };
}

// calcula o que ela precisa no próximo momento de avaliação para atingir notaDesejada
// devolve null se não houver dados suficientes para simular
export function simularNotaNecessaria({ metodo, notaAC = null, exameEscrito = null, notaDesejada }) {
  if (metodo === 'B') {
    if (exameEscrito != null) return null; // já não há nada para simular
    const necessaria = Math.min(20, Math.max(0, notaDesejada));
    if (notaDesejada > 20) {
      return { momento: 'exame escrito', notaNecessaria: 20, texto: 'Não é possível tirar mais do que 20.', impossivel: true, maximoPossivel: 20 };
    }
    return { momento: 'exame escrito', notaNecessaria: necessaria, texto: `Precisas de ${necessaria} no escrito para ficares com ${notaDesejada}.`, impossivel: false };
  }

  // método a, ainda na fase de avaliação contínua → exame escrito
  if (notaAC != null && exameEscrito == null) {
    const necessariaRaw = 2 * notaDesejada - notaAC;
    const maximoPossivel = arredondar((notaAC + 20) / 2);

    if (necessariaRaw > 20) {
      return {
        momento: 'exame escrito',
        notaNecessaria: 20,
        texto: `Com ${notaAC} na contínua, nem com 20 no escrito chegas aos ${notaDesejada}.\nO máximo possível é ${maximoPossivel}. Se quiseres os ${notaDesejada}, o caminho é a melhoria de nota.`,
        impossivel: true,
        maximoPossivel,
      };
    }
    const necessaria = Math.max(0, necessariaRaw);
    return { momento: 'exame escrito', notaNecessaria: necessaria, texto: `Precisas de ${necessaria} no escrito para ficares com ${notaDesejada}.`, impossivel: false };
  }

  return null;
}

// média anual — soma aritmética das cadeiras aprovadas, sem arredondamento
// acresce 0,6 valores se concluir com aproveitamento todas as cadeiras do ano nesse mesmo ano letivo
export function calcularMediaAnual(cadeirasAprovadas, concluiuTudoNoAno) {
  const media = cadeirasAprovadas.reduce((soma, nota) => soma + nota, 0) / cadeirasAprovadas.length;
  return concluiuTudoNoAno ? media + 0.6 : media;
}

// escala qualitativa final — só faz sentido para notas de aprovação (>= 10)
export function escalaQualitativa(nota) {
  if (nota < 10) return null;
  if (nota <= 13) return 'Suficiente';
  if (nota <= 15) return 'Bom';
  if (nota <= 17) return 'Muito Bom';
  return 'Excelente';
}
