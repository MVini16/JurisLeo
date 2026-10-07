import { describe, it, expect } from 'vitest';
import {
  CADERNO_LIVRE, SECCOES_PADRAO, SECCAO_FREQUENCIA, mesmoNome, normalizarNomeSeccao, cadernoDaNota,
  seccaoDaNota, eParaFrequencia, filtrarNotas, contarPorAba, contarPorCaderno, seccoesDoCaderno,
  agruparPorSeccao, previewTexto, dataCurta,
} from './cadernos.js';

const IDS = ['do', 'df'];
const ts = (ms) => ({ toMillis: () => ms, toDate: () => new Date(ms) });

describe('nomes de secção', () => {
  it('compara sem ligar a maiúsculas nem acentos', () => {
    expect(mesmoNome('Práticas', 'praticas')).toBe(true);
    expect(mesmoNome('Práticas', 'Teóricas')).toBe(false);
  });

  it('limpa espaços a mais e corta nomes enormes', () => {
    expect(normalizarNomeSeccao('  casos   da   aula ')).toBe('casos da aula');
    expect(normalizarNomeSeccao('x'.repeat(100))).toHaveLength(40);
    expect(normalizarNomeSeccao(null)).toBe('');
  });
});

describe('cadernoDaNota e seccaoDaNota', () => {
  it('cadeira desconhecida ou em falta vai para o caderno livre', () => {
    expect(cadernoDaNota({ cadeiraId: 'do' }, IDS)).toBe('do');
    expect(cadernoDaNota({ cadeiraId: 'xpto' }, IDS)).toBe(CADERNO_LIVRE);
    expect(cadernoDaNota({}, IDS)).toBe(CADERNO_LIVRE);
  });

  it('notas antigas ficam em Teóricas ou Práticas pelo tipo', () => {
    expect(seccaoDaNota({ tipo: 'pratica' }, 'do')).toBe('Práticas');
    expect(seccaoDaNota({ tipo: 'teorica' }, 'do')).toBe('Teóricas');
    expect(seccaoDaNota({}, 'do')).toBe('Teóricas');
  });

  it('a secção guardada ganha ao tipo, e uma padrão escrita sem acento volta ao nome certo', () => {
    expect(seccaoDaNota({ tipo: 'pratica', seccao: 'Resumos' }, 'do')).toBe('Resumos');
    expect(seccaoDaNota({ seccao: 'praticas' }, 'do')).toBe('Práticas');
  });

  it('no caderno livre a secção por omissão é Ideias', () => {
    expect(seccaoDaNota({}, CADERNO_LIVRE)).toBe('Ideias');
  });

  it('reconhece as páginas de perguntas para frequência', () => {
    expect(eParaFrequencia({ cadeiraId: 'do', seccao: SECCAO_FREQUENCIA }, IDS)).toBe(true);
    expect(eParaFrequencia({ cadeiraId: 'do', seccao: 'Resumos' }, IDS)).toBe(false);
  });
});

describe('filtrar e contar', () => {
  const notas = [
    { id: 1, titulo: 'Responsabilidade civil', conteudo: 'art. 483.º', cadeiraId: 'do', favorita: true },
    { id: 2, titulo: 'Casamento', conteudo: 'requisitos', cadeiraId: 'df', rascunho: true },
    { id: 3, titulo: 'Pressupostos', conteudo: '', cadeiraId: 'do', seccao: SECCAO_FREQUENCIA, tags: ['Prescrição'] },
    { id: 4, titulo: 'Ideia solta', cadeiraId: undefined },
  ];

  it('filtra por separador', () => {
    const ids = (aba) => filtrarNotas(notas, { aba, idsConhecidos: IDS }).map((n) => n.id);
    expect(ids('todas')).toEqual([1, 2, 3, 4]);
    expect(ids('fav')).toEqual([1]);
    expect(ids('rasc')).toEqual([2]);
    expect(ids('freq')).toEqual([3]);
  });

  it('filtra por caderno e pesquisa ignorando acentos e tags', () => {
    expect(filtrarNotas(notas, { cadernoId: 'do', idsConhecidos: IDS }).map((n) => n.id)).toEqual([1, 3]);
    expect(filtrarNotas(notas, { cadernoId: CADERNO_LIVRE, idsConhecidos: IDS }).map((n) => n.id)).toEqual([4]);
    expect(filtrarNotas(notas, { pesquisa: 'prescricao', idsConhecidos: IDS }).map((n) => n.id)).toEqual([3]);
    expect(filtrarNotas(notas, { pesquisa: 'ESPONSABILIDADE', idsConhecidos: IDS }).map((n) => n.id)).toEqual([1]);
  });

  it('conta por separador e por caderno, incluindo os vazios', () => {
    expect(contarPorAba(notas, IDS)).toEqual({ todas: 4, fav: 1, rasc: 1, freq: 1 });
    expect(contarPorCaderno(notas, IDS)).toEqual({ do: 2, df: 1, livre: 1 });
    expect(contarPorCaderno([], IDS)).toEqual({ do: 0, df: 0, livre: 0 });
  });
});

describe('árvore do caderno', () => {
  const notas = [
    { id: 'a', cadeiraId: 'do', tipo: 'teorica', atualizadoEm: ts(100) },
    { id: 'b', cadeiraId: 'do', tipo: 'teorica', atualizadoEm: ts(300) },
    { id: 'c', cadeiraId: 'do', seccao: 'Casos da aula', atualizadoEm: ts(200) },
    { id: 'd', cadeiraId: 'df', tipo: 'pratica', atualizadoEm: ts(400) },
  ];

  it('as secções padrão aparecem sempre, mesmo vazias, e as personalizadas vêm depois', () => {
    expect(seccoesDoCaderno(notas, 'do', IDS)).toEqual([...SECCOES_PADRAO, 'Casos da aula']);
    expect(seccoesDoCaderno([], 'do', IDS)).toEqual(SECCOES_PADRAO);
  });

  it('não duplica uma secção personalizada escrita de outra maneira', () => {
    const duplicadas = [{ cadeiraId: 'do', seccao: 'casos da aula' }, { cadeiraId: 'do', seccao: 'Casos da Aula' }];
    expect(seccoesDoCaderno(duplicadas, 'do', IDS).filter((s) => mesmoNome(s, 'casos da aula'))).toHaveLength(1);
  });

  it('agrupa as páginas, mais recentes primeiro, só do caderno pedido', () => {
    const grupos = agruparPorSeccao(notas, 'do', IDS);
    const teoricas = grupos.find((g) => g.nome === 'Teóricas');
    expect(teoricas.notas.map((n) => n.id)).toEqual(['b', 'a']);
    expect(grupos.find((g) => g.nome === 'Casos da aula')).toMatchObject({ personalizada: true });
    expect(grupos.find((g) => g.nome === 'Práticas').notas).toEqual([]);
    expect(grupos.flatMap((g) => g.notas).some((n) => n.id === 'd')).toBe(false);
  });
});

describe('texto e datas', () => {
  it('o resumo junta espaços e corta com reticências', () => {
    expect(previewTexto({ conteudo: 'um\n\n dois   três' })).toBe('um dois três');
    expect(previewTexto({ conteudo: 'a'.repeat(300) }, 10)).toBe(`${'a'.repeat(10)}…`);
    expect(previewTexto(null)).toBe('');
  });

  it('formata a data curta e aguenta datas em falta', () => {
    expect(dataCurta(ts(Date.UTC(2026, 9, 7, 12)))).toBe('7 Out');
    expect(dataCurta(null)).toBe('');
  });
});
