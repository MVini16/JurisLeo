import { describe, it, expect } from 'vitest';
import { destinoPorPerfil } from './destinoLogin.js';

describe('para onde vai quem entra', () => {
  it('vai para o início se já fez o onboarding', () => {
    expect(destinoPorPerfil({ onboardingFeito: true })).toBe('/dashboard');
  });
  it('vai para o onboarding se ainda não fez ou se não há perfil', () => {
    expect(destinoPorPerfil({ onboardingFeito: false })).toBe('/onboarding');
    expect(destinoPorPerfil({})).toBe('/onboarding');
    expect(destinoPorPerfil(null)).toBe('/onboarding');
  });
});
