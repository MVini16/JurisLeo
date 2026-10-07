// easter eggs — frases curtas de séries usadas só como piada.
// ficam aqui, fora de frases.js: o banco de frases é 100% original por decisão do vini,
// e o barney é uma exceção pedida por ele (a leonor adora how i met your mother)
export const BARNEY = { inicio: 'Legen', espera: 'wait for it…', fim: 'dary!' };

// sítios da app onde a piada salta
// - garantido: aparece sempre que o momento acontece
// - probabilidade + cooldownMs: só de vez em quando, para não cansar
export const LOCAIS_BARNEY = {
  abertura: { variante: 'suspense', probabilidade: 0.4, cooldownMs: 20 * 60 * 1000 },
  tarefa: { variante: 'carimbo', probabilidade: 0.35, cooldownMs: 2 * 60 * 1000 },
  notaAlta: { variante: 'carimbo', garantido: true },
  exportacao: { variante: 'carimbo', garantido: true },
  estudo25: { variante: 'suspense', garantido: true },
  flashcards: { variante: 'suspense', garantido: true },
  segredo: { variante: 'segredo', garantido: true },
};
