// respiração guiada — lógica pura. um ciclo tem três fases seguidas, em segundos.
// é só um exercício simples para abrandar, não é aconselhamento médico
export const PADRAO_RESPIRACAO = [
  { fase: 'inspira', segundos: 4, texto: 'Inspira devagar' },
  { fase: 'segura', segundos: 2, texto: 'Segura' },
  { fase: 'expira', segundos: 6, texto: 'Expira devagar' },
];

export const DURACAO_CICLO = PADRAO_RESPIRACAO.reduce((soma, f) => soma + f.segundos, 0);

// em que fase está, passados `segundos` desde o início
// devolve { fase, texto, restante (segundos até acabar a fase), ciclo (0, 1, 2...) }
export function faseDaRespiracao(segundos, padrao = PADRAO_RESPIRACAO) {
  const total = padrao.reduce((soma, f) => soma + f.segundos, 0);
  const s = Math.max(0, segundos);
  const ciclo = Math.floor(s / total);
  let dentro = s - ciclo * total;
  for (const f of padrao) {
    if (dentro < f.segundos) return { fase: f.fase, texto: f.texto, restante: f.segundos - dentro, ciclo };
    dentro -= f.segundos;
  }
  return { fase: padrao[0].fase, texto: padrao[0].texto, restante: padrao[0].segundos, ciclo };
}
