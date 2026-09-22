import { describe, it, expect } from 'vitest';
import { ondeAparece } from './backlinks.js';

describe('ondeAparece', () => {
  it('encontra o termo no conteúdo de uma anotação', () => {
    const anotacoes = [{ id: 'a1', titulo: 'Aula de hoje', conteudo: 'Falámos do artigo 483 do Código Civil.' }];
    const r = ondeAparece('483', { anotacoes });
    expect(r).toEqual([{ tipo: 'anotacoes', id: 'a1', titulo: 'Aula de hoje' }]);
  });

  it('encontra o termo num caso, incluindo a estrutura', () => {
    const casos = [{ id: 'c1', titulo: 'Caso do contrato', estrutura: { enquadramento: 'Aplica-se o artigo 483.' } }];
    const r = ondeAparece('483', { casos });
    expect(r).toEqual([{ tipo: 'casos', id: 'c1', titulo: 'Caso do contrato' }]);
  });

  it('ignora acentos e maiúsculas', () => {
    const anotacoes = [{ id: 'a1', titulo: 'x', conteudo: 'A BOA FÉ é central aqui.' }];
    expect(ondeAparece('boa fe', { anotacoes })).toHaveLength(1);
  });

  it('exclui o próprio item', () => {
    const casos = [{ id: 'c1', titulo: 'Caso 483', enunciado: 'sobre o 483' }];
    expect(ondeAparece('483', { casos }, { tipo: 'casos', id: 'c1' })).toEqual([]);
  });

  it('sem termo, não encontra nada', () => {
    expect(ondeAparece('', { anotacoes: [{ id: 'a1', conteudo: 'qualquer coisa' }] })).toEqual([]);
  });
});
