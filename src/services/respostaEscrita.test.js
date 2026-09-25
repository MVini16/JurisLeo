import { describe, it, expect } from 'vitest';
import { normalizarPalavra, compararResposta, confiancaSugerida } from './respostaEscrita.js';

const CERTA = 'Facto voluntário, ilicitude, culpa, dano e nexo de causalidade (art. 483.º CC).';

describe('normalizarPalavra', () => {
  it('tira acentos, maiúsculas e pontuação', () => {
    expect(normalizarPalavra('Voluntário,')).toBe('voluntario');
    expect(normalizarPalavra('(art.')).toBe('art');
    expect(normalizarPalavra('...')).toBe('');
  });
});

describe('compararResposta', () => {
  it('marca o que ela acertou e o que faltou, ignorando acentos e maiúsculas', () => {
    const r = compararResposta('FACTO voluntario, ilicitude e culpa', CERTA);
    const estado = Object.fromEntries(r.palavras.map((p) => [normalizarPalavra(p.texto), p.estado]));
    expect(estado).toMatchObject({ facto: 'certa', voluntario: 'certa', ilicitude: 'certa', culpa: 'certa', dano: 'falta', nexo: 'falta', causalidade: 'falta' });
  });

  it('palavras de ligação e números de artigo não contam', () => {
    const r = compararResposta('', CERTA);
    const neutras = r.palavras.filter((p) => p.estado === 'neutra').map((p) => normalizarPalavra(p.texto));
    expect(neutras).toEqual(['e', 'de', 'art', '483º', 'cc']);
  });

  it('dá a percentagem das palavras que contam', () => {
    expect(compararResposta('facto voluntário ilicitude culpa dano nexo causalidade', CERTA).percentagem).toBe(100);
    expect(compararResposta('culpa', CERTA).percentagem).toBe(14);
    expect(compararResposta('', CERTA).percentagem).toBe(0);
  });

  it('uma resposta certa só com palavras de ligação não tem percentagem', () => {
    expect(compararResposta('sim', 'e de a').percentagem).toBeNull();
  });
});

describe('confiancaSugerida', () => {
  it('traduz a percentagem numa confiança de 1 a 5', () => {
    expect(confiancaSugerida(100)).toBe(5);
    expect(confiancaSugerida(75)).toBe(4);
    expect(confiancaSugerida(57)).toBe(3);
    expect(confiancaSugerida(20)).toBe(2);
    expect(confiancaSugerida(0)).toBe(1);
    expect(confiancaSugerida(null)).toBeNull();
  });
});
