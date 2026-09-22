// peças da toga que se desbloqueiam com marcos do semestre — função pura, sem firebase nem react
export const PECAS_TOGA = [
  { chave: 'capelo', icone: '🎓', nome: 'Capelo', descricao: 'Regista a primeira sessão de estudo.' },
  { chave: 'beca', icone: '🥋', nome: 'Beca', descricao: '7 dias seguidos a estudar.' },
  { chave: 'fita', icone: '🎗️', nome: 'Fita', descricao: '5 casos práticos resolvidos ou corrigidos.' },
  { chave: 'medalha', icone: '🏅', nome: 'Medalha', descricao: 'A primeira cadeira aprovada.' },
];

// { capelo, beca, fita, medalha } → true/false
export function pecasDesbloqueadas({ totalSessoes = 0, sequenciaDias = 0, casosResolvidos = 0, cadeirasAprovadas = 0 } = {}) {
  return {
    capelo: totalSessoes > 0,
    beca: sequenciaDias >= 7,
    fita: casosResolvidos >= 5,
    medalha: cadeirasAprovadas >= 1,
  };
}
