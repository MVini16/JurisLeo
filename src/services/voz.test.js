import { describe, it, expect, vi, afterEach } from 'vitest';
import { vozDisponivel, lerEmVozAlta, pararVoz, partirEmFrases, escolherVoz } from './voz.js';

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

describe('partirEmFrases', () => {
  it('parte nas frases e junta os espaços a mais', () => {
    expect(partirEmFrases('O contrato é válido.  Mas pode ser anulado!\nQuando?')).toEqual([
      'O contrato é válido.', 'Mas pode ser anulado!', 'Quando?',
    ]);
  });

  it('não parte em abreviaturas seguidas de número', () => {
    expect(partirEmFrases('Ver o art. 234.º do Código do Trabalho.')).toEqual([
      'Ver o art. 234.º do Código do Trabalho.',
    ]);
  });

  it('frase maior que o máximo vai palavra a palavra, sem pedaços acima do máximo', () => {
    const frase = 'palavra '.repeat(60).trim();
    const partes = partirEmFrases(frase, 50);
    expect(partes.length).toBeGreaterThan(1);
    expect(partes.every((p) => p.length <= 50)).toBe(true);
    expect(partes.join(' ')).toBe(frase);
  });

  it('texto vazio ou nulo dá lista vazia', () => {
    expect(partirEmFrases('   ')).toEqual([]);
    expect(partirEmFrases(null)).toEqual([]);
  });
});

describe('escolherVoz', () => {
  const br = { name: 'Luciana', lang: 'pt-BR' };
  const pt = { name: 'Joana', lang: 'pt-PT' };
  const en = { name: 'Samantha', lang: 'en-US' };

  it('prefere a voz de portugal', () => {
    expect(escolherVoz([en, br, pt])).toBe(pt);
  });

  it('aceita o formato pt_PT de alguns sistemas', () => {
    const android = { name: 'x', lang: 'pt_PT' };
    expect(escolherVoz([br, android])).toBe(android);
  });

  it('sem pt-PT usa outro português; sem português nenhum dá null', () => {
    expect(escolherVoz([en, br])).toBe(br);
    expect(escolherVoz([en])).toBeNull();
    expect(escolherVoz(undefined)).toBeNull();
  });
});

describe('lerEmVozAlta frase a frase', () => {
  it('fala uma frase de cada vez e usa a voz pt-PT se existir', () => {
    const speak = vi.fn();
    const voz = { name: 'Joana', lang: 'pt-PT' };
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn(), getVoices: () => [voz] });
    vi.stubGlobal('SpeechSynthesisUtterance', function (t) { this.text = t; });
    lerEmVozAlta('Primeira frase. Segunda frase.');
    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[1][0]).toMatchObject({ text: 'Segunda frase.', lang: 'pt-PT', voice: voz });
  });
});
