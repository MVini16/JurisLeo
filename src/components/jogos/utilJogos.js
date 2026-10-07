// pequenas ajudas dos jogos (fora dos componentes, para o fast refresh funcionar)
export const LETRAS = ['A', 'B', 'C', 'D'];

export function vibrar(padrao) {
  try { navigator.vibrate?.(padrao); } catch { /* sem vibração */ }
}
