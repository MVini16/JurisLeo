import { describe, it, expect } from 'vitest';
import {
  janelaAtual, registoDaJanela, janelaParaMostrar, aposDispensar, valoresDoDia, estaEmBaixo, sequenciaRegisto,
  alertaPersistencia, serieParaGrafico, ultimoTexto, prepararRegisto,
} from './bemEstar.js';
import { CAMPOS_OPCIONAIS, CAMPOS_PRINCIPAIS } from '../data/bemEstar.js';

const HOJE = new Date(2026, 8, 23, 12); // quarta, 23 de setembro de 2026
const reg = (h, e, m, extra = {}) => ({ noite: { humor: h, energia: e, motivacao: m }, ...extra });

describe('dados', () => {
  it('há três campos principais com cinco níveis cada', () => {
    expect(CAMPOS_PRINCIPAIS).toHaveLength(3);
    for (const c of CAMPOS_PRINCIPAIS) expect(c.niveis.map((n) => n.valor)).toEqual([1, 2, 3, 4, 5]);
  });

  it('nos opcionais não há calorias, peso nem quantidades', () => {
    const texto = JSON.stringify(CAMPOS_OPCIONAIS).toLowerCase();
    for (const proibida of ['caloria', 'peso', 'kg', 'gramas', 'meta']) expect(texto).not.toContain(proibida);
  });

  it('a comida tem só três respostas', () => {
    expect(CAMPOS_OPCIONAIS.find((c) => c.id === 'comeu').opcoes).toEqual(['Sim', 'Mal', 'Não']);
  });

  it('os ids dos opcionais são únicos', () => {
    const ids = CAMPOS_OPCIONAIS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('janelas', () => {
  it('manhã antes do meio-dia, noite depois das 19h, e nada entre as duas', () => {
    expect(janelaAtual(8)).toBe('manha');
    expect(janelaAtual(11)).toBe('manha');
    expect(janelaAtual(12)).toBeNull();
    expect(janelaAtual(18)).toBeNull();
    expect(janelaAtual(19)).toBe('noite');
    expect(janelaAtual(23)).toBe('noite');
  });

  it('a madrugada conta como manhã', () => {
    expect(janelaAtual(2)).toBe('manha');
  });
});

describe('janelaParaMostrar', () => {
  const base = { hora: 9, registoHoje: undefined, aviso: null, hojeChave: '2026-09-23' };

  it('mostra a da janela atual', () => {
    expect(janelaParaMostrar(base)).toBe('manha');
    expect(janelaParaMostrar({ ...base, hora: 20 })).toBe('noite');
  });

  it('fora das janelas não mostra', () => {
    expect(janelaParaMostrar({ ...base, hora: 15 })).toBeNull();
  });

  it('já preenchida não mostra; a da noite ainda pode aparecer se só fez a manhã', () => {
    const registoHoje = { manha: { humor: 3, energia: 3, motivacao: 3 } };
    expect(janelaParaMostrar({ ...base, registoHoje })).toBeNull();
    expect(janelaParaMostrar({ ...base, hora: 21, registoHoje })).toBe('noite');
  });

  it('um registo apagado conta como não preenchido', () => {
    expect(janelaParaMostrar({ ...base, registoHoje: { apagado: true, manha: { humor: 3, energia: 3, motivacao: 3 } } })).toBe('manha');
  });

  it('insiste uma vez e depois cala-se até à janela seguinte', () => {
    let aviso = aposDispensar(null, 'manha', '2026-09-23');
    expect(aviso.dispensadas).toBe(1);
    expect(janelaParaMostrar({ ...base, aviso })).toBe('manha');
    aviso = aposDispensar(aviso, 'manha', '2026-09-23');
    expect(aviso.dispensadas).toBe(2);
    expect(janelaParaMostrar({ ...base, aviso })).toBeNull();
    expect(janelaParaMostrar({ ...base, hora: 21, aviso })).toBe('noite');
  });

  it('o aviso de outro dia não conta', () => {
    const aviso = { data: '2026-09-22', janela: 'manha', dispensadas: 2 };
    expect(janelaParaMostrar({ ...base, aviso })).toBe('manha');
  });
});

describe('valores e "em baixo"', () => {
  it('a noite manda sobre a manhã', () => {
    expect(valoresDoDia({ manha: { humor: 2, energia: 2, motivacao: 2 }, noite: { humor: 4, energia: 4, motivacao: 4 } })).toEqual({ humor: 4, energia: 4, motivacao: 4 });
    expect(valoresDoDia({ manha: { humor: 2, energia: 3, motivacao: 5 } })).toEqual({ humor: 2, energia: 3, motivacao: 5 });
  });

  it('apagado ou sem nada não tem valores', () => {
    expect(valoresDoDia({ apagado: true })).toBeNull();
    expect(valoresDoDia(undefined)).toBeNull();
  });

  it('em baixo é qualquer um dos três nos dois níveis mais baixos', () => {
    expect(estaEmBaixo({ humor: 2, energia: 4, motivacao: 5 })).toBe(true);
    expect(estaEmBaixo({ humor: 3, energia: 3, motivacao: 3 })).toBe(false);
    expect(estaEmBaixo({ humor: 5, energia: 5, motivacao: 1 })).toBe(true);
    expect(estaEmBaixo(null)).toBe(false);
  });
});

describe('sequenciaRegisto', () => {
  it('conta dias seguidos, e hoje por fazer não quebra', () => {
    const r = { '2026-09-22': reg(3, 3, 3), '2026-09-21': reg(3, 3, 3) };
    expect(sequenciaRegisto(r, HOJE)).toBe(2);
    r['2026-09-23'] = reg(3, 3, 3);
    expect(sequenciaRegisto(r, HOJE)).toBe(3);
  });

  it('um dia em baixo não quebra a série', () => {
    expect(sequenciaRegisto({ '2026-09-23': reg(1, 1, 1), '2026-09-22': reg(2, 2, 2) }, HOJE)).toBe(2);
  });

  it('falhar um dia quebra a série', () => {
    expect(sequenciaRegisto({ '2026-09-23': reg(3, 3, 3), '2026-09-21': reg(3, 3, 3) }, HOJE)).toBe(1);
  });
});

describe('alertaPersistencia', () => {
  it('três dias seguidos em baixo num campo dispara', () => {
    const r = { '2026-09-23': reg(3, 2, 4), '2026-09-22': reg(4, 1, 4), '2026-09-21': reg(3, 2, 3) };
    expect(alertaPersistencia(r, HOJE)).toEqual({ campo: 'energia', dias: 3, desde: '2026-09-21' });
  });

  it('dois dias não chegam', () => {
    expect(alertaPersistencia({ '2026-09-23': reg(1, 3, 3), '2026-09-22': reg(1, 3, 3) }, HOJE)).toBeNull();
  });

  it('um dia bom no meio desfaz', () => {
    const r = { '2026-09-23': reg(2, 3, 3), '2026-09-22': reg(4, 3, 3), '2026-09-21': reg(2, 3, 3) };
    expect(alertaPersistencia(r, HOJE)).toBeNull();
  });

  it('se hoje ainda não registou, conta desde ontem', () => {
    const r = { '2026-09-22': reg(2, 3, 3), '2026-09-21': reg(1, 3, 3), '2026-09-20': reg(2, 3, 3) };
    expect(alertaPersistencia(r, HOJE)?.campo).toBe('humor');
  });

  it('se o último registo é mais velho do que ontem, não dispara', () => {
    const r = { '2026-09-21': reg(1, 3, 3), '2026-09-20': reg(1, 3, 3), '2026-09-19': reg(1, 3, 3) };
    expect(alertaPersistencia(r, HOJE)).toBeNull();
  });

  it('dias apagados quebram a contagem', () => {
    const r = { '2026-09-23': reg(2, 3, 3), '2026-09-22': { apagado: true }, '2026-09-21': reg(2, 3, 3) };
    expect(alertaPersistencia(r, HOJE)).toBeNull();
  });
});

describe('serieParaGrafico', () => {
  it('devolve um ponto por dia, do mais antigo para o mais recente, com buracos onde não há registo', () => {
    const s = serieParaGrafico({ '2026-09-23': reg(4, 3, 2, { noite: { humor: 4, energia: 3, motivacao: 2, texto: 'olá' } }) }, 3, HOJE);
    expect(s.map((p) => p.chave)).toEqual(['2026-09-21', '2026-09-22', '2026-09-23']);
    expect(s[0]).toMatchObject({ humor: null, apagado: false });
    expect(s[2]).toMatchObject({ humor: 4, energia: 3, motivacao: 2, temTexto: true });
  });

  it('um dia apagado aparece marcado, sem valores', () => {
    const s = serieParaGrafico({ '2026-09-22': { apagado: true } }, 2, HOJE);
    expect(s[0]).toMatchObject({ apagado: true, humor: null });
  });
});

describe('ultimoTexto', () => {
  it('devolve o texto mais recente que não foi apagado', () => {
    const r = {
      '2026-09-20': { noite: { humor: 3, energia: 3, motivacao: 3, texto: 'antigo' } },
      '2026-09-22': { noite: { humor: 3, energia: 3, motivacao: 3, texto: 'novo' } },
      '2026-09-23': { apagado: true, noite: { texto: 'apagado' } },
    };
    expect(ultimoTexto(r)).toEqual({ data: '2026-09-22', texto: 'novo' });
    expect(ultimoTexto({})).toBeNull();
  });
});

describe('prepararRegisto', () => {
  it('a manhã pede os três valores e aceita o sono', () => {
    expect(prepararRegisto('manha', { humor: 3, energia: 4 }).erro).toBeDefined();
    expect(prepararRegisto('manha', { humor: 3, energia: 4, motivacao: 6 }).erro).toBeDefined();
    expect(prepararRegisto('manha', { humor: 3, energia: 4, motivacao: 2, sono: 7 }).dados).toEqual({ humor: 3, energia: 4, motivacao: 2, sono: 7 });
    expect(prepararRegisto('manha', { humor: 3, energia: 4, motivacao: 2, sono: 20 }).erro).toBeDefined();
  });

  it('a noite guarda o texto sem espaços a mais e limita o tamanho', () => {
    const r = prepararRegisto('noite', { humor: 3, energia: 3, motivacao: 3, texto: '  dia longo  ' });
    expect(r.dados.texto).toBe('dia longo');
    expect(prepararRegisto('noite', { humor: 3, energia: 3, motivacao: 3, texto: 'a'.repeat(5000) }).dados.texto).toHaveLength(1000);
  });

  it('só guarda os opcionais que ela tem ligados e com valores válidos', () => {
    const r = prepararRegisto('noite',
      { humor: 3, energia: 3, motivacao: 3, opcionais: { ansiedade: 4, comeu: 'Sim', agua: 'Muitíssima', stress: 3, doresCabeca: 'Não' } },
      ['ansiedade', 'comeu', 'agua', 'doresCabeca']);
    expect(r.dados.opcionais).toEqual({ ansiedade: 4, comeu: 'Sim', doresCabeca: 'Não' });
  });

  it('sem opcionais ligados, o objeto fica vazio', () => {
    expect(prepararRegisto('noite', { humor: 3, energia: 3, motivacao: 3, opcionais: { ansiedade: 4 } }, []).dados.opcionais).toEqual({});
  });
});

describe('registoDaJanela', () => {
  it('lê a janela pedida e ignora apagados', () => {
    expect(registoDaJanela({ manha: { humor: 3 } }, 'manha')).toEqual({ humor: 3 });
    expect(registoDaJanela({ manha: { humor: 3 } }, 'noite')).toBeNull();
    expect(registoDaJanela({ apagado: true, manha: { humor: 3 } }, 'manha')).toBeNull();
  });
});
