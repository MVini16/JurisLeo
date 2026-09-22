// modo exame — cronómetro de 90 minutos, a duração mínima do exame escrito (art. 24.º, n.º 1
// do regulamento: 90 a 120 minutos, cabe ao professor regente escolher; para treinar sozinha
// usa-se o mínimo). função pura, sem firebase nem react.

export const DURACAO_SEGUNDOS = 90 * 60;

// segundos que faltam, nunca negativo
export function segundosRestantes(inicioMs, agoraMs, duracaoSegundos = DURACAO_SEGUNDOS) {
  const passados = Math.floor((agoraMs - inicioMs) / 1000);
  return Math.max(0, duracaoSegundos - passados);
}

// "89:59" — sempre dois dígitos nos segundos
export function formatarTempo(segundos) {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const resto = s % 60;
  return `${m}:${String(resto).padStart(2, '0')}`;
}
