import { describe, it, expect } from 'vitest';
import {
  extraVazio, adicionarFrase, removerFrase, validarFrase, normalizarExtra, totalDeFrases, exportarParaCodigo, CATEGORIAS, LIMITE_FRASE,
} from './frasesExtra.js';
import { escolherResposta, escolherElogio, escolherPiada, escolherProativa, contactoDoLink } from './boneco.js';

describe('validarFrase', () => {
  it('limpa espaços e recusa vazias, longas, com travessão ou emoji', () => {
    expect(validarFrase('  olá   Necas ')).toEqual({ ok: true, frase: 'olá Necas' });
    expect(validarFrase('   ').ok).toBe(false);
    expect(validarFrase('x'.repeat(LIMITE_FRASE + 1)).ok).toBe(false);
    expect(validarFrase('isto \u2014 não').ok).toBe(false);
    expect(validarFrase('olá \u{1F600}').ok).toBe(false);
  });
});

describe('adicionar e remover', () => {
  it('adiciona sem duplicar e remove', () => {
    let e = extraVazio();
    e = adicionarFrase(e, 'elogios', 'Estás a arrasar.').extra;
    expect(adicionarFrase(e, 'elogios', 'Estás a arrasar.').erro).toBeTruthy();
    e = adicionarFrase(e, 'respostas.cansada', 'Pausa, Necas.').extra;
    expect(totalDeFrases(e)).toBe(2);
    e = removerFrase(e, 'elogios', 'Estás a arrasar.');
    expect(e.elogios).toEqual([]);
    expect(e.respostas.cansada).toEqual(['Pausa, Necas.']);
  });
  it('não há categoria para "estou mesmo mal"', () => {
    expect(CATEGORIAS.map((c) => c.id)).not.toContain('respostas.mal');
    expect(adicionarFrase(extraVazio(), 'respostas.mal', 'piada').erro).toBeTruthy();
  });
});

describe('normalizarExtra', () => {
  it('ignora lixo e aceita só o que cumpre as regras', () => {
    const e = normalizarExtra({ elogios: ['boa', 5, '', 'x \u2014 y'], respostas: { mal: ['não'], cansada: ['descansa'] }, outra: ['z'] });
    expect(e.elogios).toEqual(['boa']);
    expect(e.respostas.cansada).toEqual(['descansa']);
    expect(e.respostas.mal).toBeUndefined();
    expect(normalizarExtra(null)).toEqual(extraVazio());
  });
});

describe('exportarParaCodigo', () => {
  it('gera linhas com aspas escapadas', () => {
    const e = adicionarFrase(extraVazio(), 'piadas', "O juiz disse: 'basta'.").extra;
    const codigo = exportarParaCodigo(e);
    expect(codigo).toContain('// Piada');
    expect(codigo).toContain("  'O juiz disse: \\'basta\\'.',");
  });
});

describe('as frases extra entram no boneco', () => {
  const extra = { elogios: ['E1'], piadas: ['P1'], proativas: ['PR1'], respostas: { cansada: ['R1'], mal: ['NUNCA'] } };
  it('elogios, piadas e proativas misturam-se com as de base', () => {
    expect(escolherElogio(null, () => 0.999, extra)).toBe('E1');
    expect(escolherPiada(null, () => 0.999, extra)).toBe('P1');
    expect(escolherProativa(10, () => 0.9, extra).texto).toBeTruthy();
  });
  it('respostas brincalhonas entram; em "mal" nunca', () => {
    const r = escolherResposta('cansada', { aleatorio: (() => { let i = 0; return () => [0, 0.999][Math.min(i++, 1)]; })(), extra });
    expect(r.voz).toBe('brincalhona');
    expect(r.texto).toBe('R1');
    for (let i = 0; i < 20; i += 1) expect(escolherResposta('mal', { extra }).texto).not.toBe('NUNCA');
  });
});

describe('contactoDoLink', () => {
  it('lê o número do link e recusa o que não serve', () => {
    expect(contactoDoLink('?vini=931143554')).toBe('931143554');
    expect(contactoDoLink('?vini=%2B351%20931%20143%20554')).toBe('+351931143554');
    expect(contactoDoLink('?vini=abc')).toBeNull();
    expect(contactoDoLink('')).toBeNull();
  });
});
