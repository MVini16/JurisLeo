// cartões com lacunas: escreve-se uma frase e põe-se entre {{ }} o que se quer esconder
// exemplo: "O contrato é um {{negócio jurídico}} bilateral" → frente "O contrato é um [...] bilateral"
// função pura, sem firebase nem react. trabalha sempre sobre o texto dela, nunca sobre o texto da lei

const LACUNA = /\{\{([^{}]+?)\}\}/g;

export function temLacunas(texto) {
  return new RegExp(LACUNA.source).test(String(texto ?? ''));
}

// devolve { frente, tras, escondidas } ou null se não houver nenhuma lacuna válida
export function converterLacunas(texto) {
  const original = String(texto ?? '').trim();
  const escondidas = [];
  const frente = original.replace(LACUNA, (_, escondida) => {
    escondidas.push(escondida.trim());
    return '[...]';
  });
  if (escondidas.length === 0 || escondidas.some((e) => !e)) return null;
  const tras = original.replace(LACUNA, (_, escondida) => escondida.trim());
  return { frente, tras, escondidas };
}
