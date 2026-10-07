import { describe, it, expect } from 'vitest';
import { DEFINICOES, GRUPOS, SECCOES, pesquisarDefinicoes, localDaDefinicao, seccaoValida, rotaDaSeccao } from './definicoes.js';

const ids = (termo) => pesquisarDefinicoes(termo).map((d) => d.id);

describe('catálogo', () => {
  it('os ids são únicos e cada subpágina e grupo existe', () => {
    expect(new Set(DEFINICOES.map((d) => d.id)).size).toBe(DEFINICOES.length);
    const grupos = GRUPOS.map((g) => g.id);
    for (const secao of Object.values(SECCOES)) expect(grupos).toContain(secao.grupo);
    for (const d of DEFINICOES) {
      if (d.destino.tipo === 'secao') expect(SECCOES).toHaveProperty(d.destino.secao);
      if (d.destino.tipo === 'rota') expect(d.destino.rota.startsWith('/')).toBe(true);
    }
  });

  it('as palavras-chave estão sem acentos (a pesquisa ignora-os)', () => {
    for (const d of DEFINICOES) for (const palavra of d.palavras) expect(palavra).toBe(palavra.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  });
});

describe('pesquisarDefinicoes', () => {
  it('sem texto não devolve nada', () => {
    expect(pesquisarDefinicoes('')).toEqual([]);
    expect(pesquisarDefinicoes('   ')).toEqual([]);
    expect(pesquisarDefinicoes(null)).toEqual([]);
  });

  it('encontra pelo nome, sem ligar a acentos nem a maiúsculas', () => {
    expect(ids('TEMA')).toContain('tema');
    expect(ids('sessao')).toContain('sair');
    expect(ids('academicos')).toContain('dados');
  });

  it('encontra pelas palavras-chave que ela usaria', () => {
    expect(ids('backup')).toEqual(['exportar-dados']);
    expect(ids('escuro')).toContain('tema');
    expect(ids('legendary')).toContain('barney');
    expect(ids('quadriculado')).toContain('folha');
    expect(ids('logout')).toContain('sair');
  });

  it('todas as palavras têm de bater', () => {
    expect(ids('mensagens vini')).toContain('vini');
    expect(ids('tema avião')).toEqual([]);
  });

  it('o que bate no nome vem primeiro', () => {
    const r = ids('vini');
    expect(r[0]).toBe('vini');
    expect(r).toContain('sobre');
  });

  it('não encontra o que não existe', () => {
    expect(ids('xyzxyz')).toEqual([]);
  });
});

describe('ajudas', () => {
  it('diz onde está cada resultado', () => {
    expect(localDaDefinicao(DEFINICOES.find((d) => d.id === 'tema'))).toBe('Aparência');
    expect(localDaDefinicao(DEFINICOES.find((d) => d.id === 'ajuda'))).toBe('Suporte');
    expect(localDaDefinicao(DEFINICOES.find((d) => d.id === 'sair'))).toBe('Conta');
  });

  it('só aceita subpáginas que existem', () => {
    expect(seccaoValida('aparencia')).toMatchObject({ titulo: 'Aparência' });
    expect(seccaoValida('xpto')).toBeNull();
    expect(seccaoValida('constructor')).toBeNull();
    expect(seccaoValida('__proto__')).toBeNull();
    expect(rotaDaSeccao('sobre')).toBe('/perfil/sobre');
  });
});
