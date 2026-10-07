import { describe, it, expect } from 'vitest';
import {
  precisaDeAtualizar, estaAdiado, deveMostrarNovidades, lerVersaoDoServidor, detetarPlataforma, passosDoTutorial, ADIAR_MS, AVISO_DE_REINSTALAR,
} from './atualizacao.js';
import { NOVIDADES, VERSAO_ATUAL } from '../data/novidades.js';

describe('precisaDeAtualizar', () => {
  it('só avisa quando o servidor tem uma versão diferente da que corre', () => {
    expect(precisaDeAtualizar({ local: '2026-10-07', servidor: '2026-10-20' })).toBe(true);
    expect(precisaDeAtualizar({ local: '2026-10-07', servidor: '2026-10-07' })).toBe(false);
    expect(precisaDeAtualizar({ local: '2026-10-07', servidor: null })).toBe(false);
    expect(precisaDeAtualizar({ local: '', servidor: 'x' })).toBe(false);
  });
});

describe('adiar e novidades', () => {
  it('adiado até uma hora', () => {
    expect(estaAdiado(1000 + ADIAR_MS, 1000)).toBe(true);
    expect(estaAdiado(1000, 2000)).toBe(false);
    expect(estaAdiado(0, 5)).toBe(false);
  });
  it('mostra novidades só depois de atualizar (e nunca na primeira vez)', () => {
    expect(deveMostrarNovidades({ vista: null, atual: 'b' })).toBe(false);
    expect(deveMostrarNovidades({ vista: 'a', atual: 'b' })).toBe(true);
    expect(deveMostrarNovidades({ vista: 'b', atual: 'b' })).toBe(false);
  });
});

describe('lerVersaoDoServidor', () => {
  it('aceita o formato certo e recusa o resto', () => {
    expect(lerVersaoDoServidor({ versao: 'v2', titulo: 'Novo', itens: ['a', 3, 'b'] })).toEqual({ versao: 'v2', titulo: 'Novo', itens: ['a', 'b'] });
    expect(lerVersaoDoServidor({ versao: 'v2' })).toEqual({ versao: 'v2', titulo: '', itens: [] });
    expect(lerVersaoDoServidor('<html>erro</html>')).toBeNull();
    expect(lerVersaoDoServidor({ versao: '' })).toBeNull();
    expect(lerVersaoDoServidor(null)).toBeNull();
  });
});

describe('detetarPlataforma', () => {
  it('reconhece iPhone, iPad moderno, Android e o resto', () => {
    expect(detetarPlataforma('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
    expect(detetarPlataforma('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe('ios');
    expect(detetarPlataforma('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe('outra');
    expect(detetarPlataforma('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBe('android');
    expect(detetarPlataforma('')).toBe('outra');
  });
});

describe('o tutorial', () => {
  it('tem caminho rápido e completo, e o endereço aparece nos passos', () => {
    const t = passosDoTutorial('ios', 'https://jurisleo.exemplo');
    expect(t.rapido.length).toBeGreaterThanOrEqual(3);
    expect(t.completo.some((p) => p.texto.includes('https://jurisleo.exemplo'))).toBe(true);
    expect(t.completo.some((p) => /ecrã principal/i.test(p.texto))).toBe(true);
  });
  it('uma plataforma desconhecida cai no caminho genérico', () => {
    expect(passosDoTutorial('xpto', 'x').completo.length).toBeGreaterThan(0);
  });
  it('avisa do que se perde ao reinstalar', () => {
    expect(AVISO_DE_REINSTALAR).toMatch(/perde-se/);
    expect(passosDoTutorial('ios', 'x').completo[0].titulo).toMatch(/cópia/);
  });
  it('sem travessões nem emojis', () => {
    const t = passosDoTutorial('android', 'x');
    [...t.rapido, ...t.completo].forEach((p) => {
      expect(`${p.titulo}${p.texto}`).not.toMatch(/[–—]/);
      expect(`${p.titulo}${p.texto}`).not.toMatch(/\p{Extended_Pictographic}/u);
    });
  });
});

describe('novidades', () => {
  it('a versão atual é a da primeira entrada e há itens', () => {
    expect(VERSAO_ATUAL).toBe(NOVIDADES[0].versao);
    expect(NOVIDADES[0].itens.length).toBeGreaterThan(0);
  });
  it('as versões são únicas', () => {
    expect(new Set(NOVIDADES.map((n) => n.versao)).size).toBe(NOVIDADES.length);
  });
});
