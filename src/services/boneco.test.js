import { describe, it, expect } from 'vitest';
import {
  escolherDe, escolherResposta, motivoPorHora, escolherProativa, rotaOcupada, rotaSemBoneco, fimDoDia,
  podeFalarSozinho, acrescentarAoHistorico, deveReagir, escolherReacao, escolherElogio, INTERVALO_REACOES_MS, tarefasUrgentes, limparTelefone, telefoneValido, ligacoesDoContacto, ligacaoDaLinha, faseDaFrequencia, escolherFrequencia, checkInPendente,
} from './boneco.js';
import { RESPOSTAS, ESTADOS, ACOES, ABERTURAS, PROATIVAS, LINHAS_DE_APOIO, ELOGIOS, PIADAS, REACOES, FREQUENCIA, CHECKIN_BALOES, CHECKIN_ABERTURAS, AULAS, BARNEY, SAUDADES } from '../data/boneco.js';

// um "aleatório" que devolve os valores por ordem, e depois repete o último
const sequencia = (...valores) => { let i = 0; return () => valores[Math.min(i++, valores.length - 1)]; };
const H = 60 * 60 * 1000;

describe('as frases do boneco (dados)', () => {
  it('todos os estados têm respostas, ações que existem e pelo menos uma frase carinhosa', () => {
    for (const { id } of ESTADOS) {
      expect(RESPOSTAS[id], id).toBeDefined();
      expect(RESPOSTAS[id].carinhosa.length).toBeGreaterThan(0);
      for (const acao of RESPOSTAS[id].acoes) expect(ACOES).toHaveProperty(acao);
    }
  });

  it('"estou mesmo mal" nunca tem voz brincalhona e leva à linha de apoio e ao Vini', () => {
    expect(RESPOSTAS.mal.brincalhona).toEqual([]);
    expect(RESPOSTAS.mal.acoes).toEqual(expect.arrayContaining(['viniSerio', 'linhasApoio']));
    expect(RESPOSTAS.mal.cuidado).toContain('112');
  });

  it('as frases não têm travessões nem emojis, e nenhuma lista tem repetidas', () => {
    const todas = [
      ...ABERTURAS, ...ELOGIOS, ...PIADAS,
      ...Object.values(RESPOSTAS).flatMap((r) => [...r.carinhosa, ...r.brincalhona]),
      ...Object.values(PROATIVAS).flatMap((p) => [...p.carinhosa, ...p.brincalhona]),
    ];
    for (const frase of todas) {
      expect(frase, frase).not.toMatch(/—|–/);
      expect(frase, frase).not.toMatch(/\p{Extended_Pictographic}/u);
    }
    for (const lista of [ELOGIOS, PIADAS, ...Object.values(RESPOSTAS).map((r) => r.carinhosa)]) expect(new Set(lista).size).toBe(lista.length);
  });

  it('as linhas de apoio são só as confirmadas e têm número', () => {
    expect(LINHAS_DE_APOIO.map((l) => l.numero)).toEqual(['808 24 24 24', '213 544 545', '112']);
    for (const l of LINHAS_DE_APOIO) expect(telefoneValido(l.numero) || l.numero === '112').toBe(true);
  });
});

describe('escolherResposta', () => {
  it('a voz brincalhona entra conforme o peso do estado', () => {
    expect(escolherResposta('cansada', { aleatorio: sequencia(0.1, 0) }).voz).toBe('brincalhona');
    expect(escolherResposta('cansada', { aleatorio: sequencia(0.9, 0) }).voz).toBe('carinhosa');
  });

  it('quando está triste, a voz carinhosa ganha quase sempre', () => {
    expect(escolherResposta('triste', { aleatorio: sequencia(0.5, 0) }).voz).toBe('carinhosa');
    expect(escolherResposta('triste', { aleatorio: sequencia(0.1, 0) }).voz).toBe('brincalhona');
  });

  it('"estou mesmo mal" é sempre carinhosa, seja qual for o sorteio', () => {
    for (const n of [0, 0.01, 0.5, 0.99]) expect(escolherResposta('mal', { aleatorio: sequencia(n, 0) }).voz).toBe('carinhosa');
  });

  it('não repete a última frase', () => {
    const ultima = RESPOSTAS.cansada.carinhosa[0];
    for (const n of [0, 0.2, 0.5, 0.99]) {
      expect(escolherResposta('cansada', { ultima, aleatorio: sequencia(0.9, n) }).texto).not.toBe(ultima);
    }
  });

  it('um estado desconhecido não rebenta', () => {
    expect(escolherResposta('xpto')).toBeNull();
    expect(escolherDe([], null)).toBeNull();
    expect(escolherDe(['só uma'], 'só uma', () => 0.5)).toBe('só uma');
  });
});

describe('puxar conversa', () => {
  it('a hora decide o motivo', () => {
    expect(motivoPorHora(23)).toBe('noite');
    expect(motivoPorHora(1)).toBe('noite');
    expect(motivoPorHora(8)).toBe('manha');
    expect(motivoPorHora(15)).toBe('tarde');
    expect(motivoPorHora(3)).toBe('tarde');
  });

  it('a frase vem do banco certo', () => {
    const p = escolherProativa(23, sequencia(0.1, 0));
    expect(p).toMatchObject({ motivo: 'noite', voz: 'brincalhona' });
    expect(PROATIVAS.noite.brincalhona).toContain(p.texto);
  });

  it('fica quieto onde ela está a escrever, a estudar ou a rever, e nem aparece na entrada', () => {
    for (const r of ['/anotacoes/abc', '/anotacoes/nova', '/casos/xyz', '/estudo', '/flashcards']) expect(rotaOcupada(r), r).toBe(true);
    for (const r of ['/dashboard', '/anotacoes', '/cadernos/do', '/perfil', '/tarefas', '/casos']) expect(rotaOcupada(r), r).toBe(false);
    for (const r of ['/', '/login', '/onboarding']) expect(rotaSemBoneco(r)).toBe(true);
    expect(rotaSemBoneco('/dashboard')).toBe(false);
  });

  const base = { agora: new Date(2026, 9, 7, 23, 0).getTime(), prefs: { boneco: true, bonecoConversa: 'as-vezes' }, caminho: '/dashboard', historico: [], adiadoAte: 0 };

  it('pode falar quando tudo deixa', () => {
    expect(podeFalarSozinho(base)).toBe(true);
  });

  it('não fala se ela o escondeu ou pôs em "nunca"', () => {
    expect(podeFalarSozinho({ ...base, prefs: { boneco: false, bonecoConversa: 'mais' } })).toBe(false);
    expect(podeFalarSozinho({ ...base, prefs: { boneco: true, bonecoConversa: 'nunca' } })).toBe(false);
    expect(podeFalarSozinho({ ...base, prefs: { boneco: true, bonecoConversa: 'xpto' } })).toBe(false);
  });

  it('não fala em páginas ocupadas nem com a conversa aberta', () => {
    expect(podeFalarSozinho({ ...base, caminho: '/anotacoes/abc' })).toBe(false);
    expect(podeFalarSozinho({ ...base, caminho: '/login' })).toBe(false);
    expect(podeFalarSozinho({ ...base, janelaAberta: true })).toBe(false);
  });

  it('"hoje não" cala-o até ao fim do dia', () => {
    const noite = new Date(2026, 9, 7, 23, 0).getTime();
    const ate = fimDoDia(noite);
    expect(new Date(ate).getHours()).toBe(0);
    expect(new Date(ate).getDate()).toBe(8);
    expect(podeFalarSozinho({ ...base, agora: noite, adiadoAte: ate })).toBe(false);
    expect(podeFalarSozinho({ ...base, agora: ate + H * 9, adiadoAte: ate })).toBe(true);
  });

  it('"de vez em quando" é uma conversa por dia, com seis horas de intervalo', () => {
    expect(podeFalarSozinho({ ...base, historico: [base.agora - 2 * H] })).toBe(false);
    expect(podeFalarSozinho({ ...base, historico: [base.agora - 23 * H] })).toBe(false);
    expect(podeFalarSozinho({ ...base, historico: [base.agora - 25 * H] })).toBe(true);
  });

  it('"mais vezes" deixa três por dia, com três horas de intervalo', () => {
    const prefs = { boneco: true, bonecoConversa: 'mais' };
    expect(podeFalarSozinho({ ...base, prefs, historico: [base.agora - 4 * H] })).toBe(true);
    expect(podeFalarSozinho({ ...base, prefs, historico: [base.agora - 1 * H] })).toBe(false);
    expect(podeFalarSozinho({ ...base, prefs, historico: [base.agora - 20 * H, base.agora - 10 * H, base.agora - 4 * H] })).toBe(false);
  });

  it('o histórico esquece o que é velho e tem tamanho limitado', () => {
    const agora = 1e12;
    expect(acrescentarAoHistorico([agora - 30 * H, agora - 2 * H], agora)).toEqual([agora - 2 * H, agora]);
    const muitos = Array.from({ length: 30 }, (_, i) => agora - i * 1000);
    expect(acrescentarAoHistorico(muitos, agora).length).toBe(10);
  });
});

describe('tarefasUrgentes', () => {
  const t = (id, prazo, concluida = false) => ({ id, prazo, concluida });

  it('as atrasadas e as de prazo mais curto primeiro, as sem prazo no fim, sem as concluídas', () => {
    const tarefas = [t('c', '2026-11-20'), t('a', '2026-10-01'), t('semprazo', ''), t('feita', '2026-09-01', true), t('b', '2026-10-15'), t('d', '2026-12-01')];
    expect(tarefasUrgentes(tarefas).map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(tarefasUrgentes(tarefas, 5).map((x) => x.id)).toEqual(['a', 'b', 'c', 'd', 'semprazo']);
  });

  it('sem tarefas dá uma lista vazia e não estraga a lista original', () => {
    expect(tarefasUrgentes([])).toEqual([]);
    const original = [t('b', '2026-10-15'), t('a', '2026-10-01')];
    tarefasUrgentes(original);
    expect(original.map((x) => x.id)).toEqual(['b', 'a']);
  });
});

describe('o contacto do vini', () => {
  it('limpa espaços e carateres, mantendo o + do início', () => {
    expect(limparTelefone('+351 912 345 678')).toBe('+351912345678');
    expect(limparTelefone(' 91-234 5678 ')).toBe('912345678');
    expect(limparTelefone(null)).toBe('');
  });

  it('só aceita números com um tamanho de telefone', () => {
    expect(telefoneValido('912345678')).toBe(true);
    expect(telefoneValido('+351 912 345 678')).toBe(true);
    expect(telefoneValido('12345')).toBe(false);
    expect(telefoneValido('abc')).toBe(false);
    expect(telefoneValido('')).toBe(false);
  });

  it('dá as ligações para ligar, mandar mensagem e abrir o whatsapp', () => {
    expect(ligacoesDoContacto('+351 912 345 678')).toEqual({ ligar: 'tel:+351912345678', mensagem: 'sms:+351912345678', whatsapp: 'https://wa.me/351912345678' });
    expect(ligacoesDoContacto('123')).toBeNull();
  });

  it('as linhas de apoio ligam com o número limpo', () => {
    expect(ligacaoDaLinha('808 24 24 24')).toBe('tel:808242424');
    expect(ligacaoDaLinha('112')).toBe('tel:112');
  });
});

describe('whatsapp com indicativo', () => {
  it('um número português de 9 dígitos leva 351 à frente', () => {
    expect(ligacoesDoContacto('931143554').whatsapp).toBe('https://wa.me/351931143554');
    expect(ligacoesDoContacto('+351 931 143 554').whatsapp).toBe('https://wa.me/351931143554');
  });
});

describe('as frases na voz do Vini', () => {
  const todasAsListas = {
    ABERTURAS, ELOGIOS, PIADAS, REACOES, FREQUENCIA, CHECKIN_BALOES, CHECKIN_ABERTURAS, AULAS, BARNEY, SAUDADES,
    ...Object.fromEntries(Object.entries(RESPOSTAS).flatMap(([e, r]) => [[`${e}.carinhosa`, r.carinhosa], [`${e}.brincalhona`, r.brincalhona]])),
    ...Object.fromEntries(Object.entries(PROATIVAS).flatMap(([p, r]) => [[`${p}.carinhosa`, r.carinhosa], [`${p}.brincalhona`, r.brincalhona]])),
  };
  const frases = Object.values(todasAsListas).flat();

  it('há muitas frases e nenhuma está repetida', () => {
    expect(frases.length).toBeGreaterThanOrEqual(500);
    expect(new Set(frases).size).toBe(frases.length);
  });
  it('nenhuma fala dele na terceira pessoa nem tem travessões, emojis ou excesso de tamanho', () => {
    frases.forEach((f) => {
      expect(f, f).not.toMatch(/\b(o Vini|do Vini|ao Vini|ao boneco|o boneco)\b/);
      expect(f, f).not.toMatch(/[\u2013\u2014]/);
      expect(f, f).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(f.length, f).toBeLessThanOrEqual(240);
    });
  });
  it('as respostas brincalhonas de "estou mesmo mal" continuam vazias', () => {
    expect(RESPOSTAS.mal.brincalhona).toEqual([]);
  });
});

describe('reações e frases de aulas', () => {
  it('reage no máximo de 15 em 15 minutos e só às vezes', () => {
    const agora = 10 * INTERVALO_REACOES_MS;
    expect(deveReagir({ agora, ultimaReacao: agora - 1000, aleatorio: () => 0 })).toBe(false);
    expect(deveReagir({ agora, ultimaReacao: agora - INTERVALO_REACOES_MS, aleatorio: () => 0.2 })).toBe(true);
    expect(deveReagir({ agora, ultimaReacao: 0, aleatorio: () => 0.9 })).toBe(false);
  });
  it('a reação vem da lista e não repete a última', () => {
    expect(REACOES).toContain(escolherReacao(null));
    expect(escolherReacao(REACOES[0], () => 0)).not.toBe(REACOES[0]);
  });
  it('de segunda a sexta, de manhã e à tarde, às vezes fala da aula; ao fim de semana e à noite nunca', () => {
    expect(AULAS).toContain(escolherProativa(10, sequencia(0.9, 0.1, 0.1), {}, 2).texto);
    expect(escolherProativa(10, () => 0.1, {}, 6).motivo).not.toBe('aulas');
    expect(escolherProativa(23, () => 0.1, {}, 2).motivo).toBe('noite');
  });
  it('"uma coisa boa para ouvir" mistura elogios, saudades e barney', () => {
    const juntas = new Set([...ELOGIOS, ...SAUDADES, ...BARNEY]);
    for (let i = 0; i < 30; i += 1) expect(juntas.has(escolherElogio(null))).toBe(true);
  });
});

describe('frequências e ver como ela está', () => {
  const dia = (d, h = 10) => new Date(2026, 9, d, h).getTime();
  it('a fase depende dos dias que faltam', () => {
    const agora = dia(10, 20);
    expect(faseDaFrequencia([dia(14)], agora)).toBe('antes');
    expect(faseDaFrequencia([dia(10, 8)], agora)).toBe('hoje');
    expect(faseDaFrequencia([dia(9)], agora)).toBe('depois');
    expect(faseDaFrequencia([dia(25)], agora)).toBeNull();
    expect(faseDaFrequencia([dia(1)], agora)).toBeNull();
    expect(faseDaFrequencia([], agora)).toBeNull();
  });
  it('escolhe uma frase da fase certa', () => {
    expect(escolherFrequencia('hoje', null, () => 0)).toContain('Vou estar a pensar em ti');
    expect(escolherFrequencia('nada')).toBeNull();
  });
  it('o check-in só acontece uma vez, passado o tempo ou depois de estudar', () => {
    const registo = { versao: 'v1', desde: 1000, feito: false };
    const M = 60 * 1000;
    expect(checkInPendente({ registo, versao: 'v1', agora: 1000 + 5 * M })).toBe(false);
    expect(checkInPendente({ registo, versao: 'v1', agora: 1000 + 21 * M })).toBe(true);
    expect(checkInPendente({ registo, versao: 'v1', agora: 1000 + 4 * M, estudou: true })).toBe(true);
    expect(checkInPendente({ registo, versao: 'v1', agora: 1000 + 1 * M, estudou: true })).toBe(false);
    expect(checkInPendente({ registo: { ...registo, feito: true }, versao: 'v1', agora: 1000 + 30 * M })).toBe(false);
    expect(checkInPendente({ registo, versao: 'v2', agora: 1000 + 30 * M })).toBe(false);
    expect(checkInPendente({ registo: null, versao: 'v1', agora: 1000 + 30 * M })).toBe(false);
  });
});
