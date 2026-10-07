// para onde vai quem acabou de entrar — lógica pura, sem firebase, usada no login e na entrada automática
// `perfil` são os dados de users/{uid}/perfil/dados (ou null se ainda não existirem)
export function destinoPorPerfil(perfil) {
  return perfil?.onboardingFeito ? '/dashboard' : '/onboarding';
}
