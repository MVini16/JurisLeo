import { describe, it, expect, vi, afterEach } from 'vitest';
import { vozDisponivel, lerEmVozAlta, pararVoz } from './voz.js';

afterEach(() => vi.unstubAllGlobals());

describe('voz', () => {
  it('sem a api do browser não faz nada nem estoira', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(vozDisponivel()).toBe(false);
    expect(lerEmVozAlta('olá')).toBe(false);
    expect(() => pararVoz()).not.toThrow();
  });

  it('lê em português de Portugal, depois de parar o que estava a ler', () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', function (t) { this.text = t; });
    expect(lerEmVozAlta('O contrato é um negócio jurídico')).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toMatchObject({ text: 'O contrato é um negócio jurídico', lang: 'pt-PT' });
  });

  it('texto vazio não lê', () => {
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() });
    vi.stubGlobal('SpeechSynthesisUtterance', function () {});
    expect(lerEmVozAlta('   ')).toBe(false);
  });
});
