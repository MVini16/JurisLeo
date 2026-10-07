// avisos entre partes da app que não se conhecem (o boneco ouve o que os jogos e o estudo anunciam)
export const EVENTO_ESTUDO_CONCLUIDO = 'jurisleo:estudo-concluido';

export function anunciarEstudoConcluido() {
  try { window.dispatchEvent(new Event(EVENTO_ESTUDO_CONCLUIDO)); } catch { /* sem window, ignora */ }
}
