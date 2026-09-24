import { describe, it, expect, vi } from 'vitest';
import { arrumarPrevisao, arrumarAvisos, avisosAtivos, pedirPrevisao, pedirAvisos } from './ipma.js';

// exemplo no formato do ipma: números como texto, id do tempo como número
const PREVISAO = {
  owner: 'IPMA',
  country: 'PT',
  globalIdLocal: 1110600,
  dataUpdate: '2026-09-24T10:31:02',
  data: [
    { precipitaProb: '5.0', tMin: '17.2', tMax: '27.3', predWindDir: 'NW', idWeatherType: 2, classWindSpeed: 2, forecastDate: '2026-09-25' },
    { precipitaProb: '0.0', tMin: '16.0', tMax: '26.1', predWindDir: 'N', idWeatherType: 1, classWindSpeed: 1, forecastDate: '2026-09-24' },
    { precipitaProb: '-99.0', tMin: '15.0', tMax: '22.0', idWeatherType: 99, forecastDate: '2026-09-26' },
  ],
};

const AVISOS = [
  { text: '', awarenessTypeName: 'Vento', idAreaAviso: 'LSB', startTime: '2026-09-24T00:00:00', awarenessLevelID: 'green', endTime: '2026-09-25T00:00:00' },
  { text: 'Rajadas até 70 km/h.', awarenessTypeName: 'Vento', idAreaAviso: 'LSB', startTime: '2026-09-24T12:00:00', awarenessLevelID: 'yellow', endTime: '2026-09-24T21:00:00' },
  { text: 'Chuva forte.', awarenessTypeName: 'Precipitação', idAreaAviso: 'LSB', startTime: '2026-09-24T15:00:00', awarenessLevelID: 'orange', endTime: '2026-09-25T06:00:00' },
  { text: 'Noutro distrito.', awarenessTypeName: 'Vento', idAreaAviso: 'PTO', startTime: '2026-09-24T12:00:00', awarenessLevelID: 'red', endTime: '2026-09-24T21:00:00' },
  { text: 'Já passou.', awarenessTypeName: 'Nevoeiro', idAreaAviso: 'LSB', startTime: '2026-09-24T00:00:00', awarenessLevelID: 'yellow', endTime: '2026-09-24T06:00:00' },
];

describe('arrumarPrevisao', () => {
  it('converte o texto em números, ordena por data e traduz o tipo de tempo', () => {
    const dias = arrumarPrevisao(PREVISAO);
    expect(dias.map((d) => d.data)).toEqual(['2026-09-24', '2026-09-25', '2026-09-26']);
    expect(dias[1]).toEqual({ data: '2026-09-25', min: 17.2, max: 27.3, chuva: 5, tipo: 2, descricao: 'Céu pouco nublado' });
  });

  it('-99 é "sem dados" e um tipo desconhecido não tem descrição', () => {
    const dia = arrumarPrevisao(PREVISAO)[2];
    expect(dia.chuva).toBeNull();
    expect(dia.descricao).toBeNull();
  });

  it('formato estranho dá null', () => {
    expect(arrumarPrevisao(null)).toBeNull();
    expect(arrumarPrevisao({ data: 'x' })).toBeNull();
  });
});

describe('arrumarAvisos e avisosAtivos', () => {
  it('fica só com lisboa e sem os verdes', () => {
    const avisos = arrumarAvisos(AVISOS);
    expect(avisos).toHaveLength(3);
    expect(avisos.every((a) => a.nivel !== 'green')).toBe(true);
    expect(avisos[0]).toMatchObject({ nivel: 'yellow', tipo: 'Vento', texto: 'Rajadas até 70 km/h.' });
    expect(typeof avisos[0].inicio).toBe('number');
  });

  it('ativos: tira os que já acabaram e põe o mais grave primeiro', () => {
    const agora = new Date(2026, 8, 24, 13, 0).getTime();
    const ativos = avisosAtivos(arrumarAvisos(AVISOS), agora);
    expect(ativos.map((a) => a.nivel)).toEqual(['orange', 'yellow']);
  });

  it('formato estranho dá null; lista vazia fica vazia', () => {
    expect(arrumarAvisos({ erro: 1 })).toBeNull();
    expect(avisosAtivos(null)).toEqual([]);
  });
});

// storage falso e fetch falso, para testar a ligação ao cliente e à cache
function criarStorage() {
  const mapa = new Map();
  return { getItem: (k) => (mapa.has(k) ? mapa.get(k) : null), setItem: (k, v) => mapa.set(k, String(v)) };
}

function depsCom(corpo, status = 200) {
  const fetch = vi.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => null },
    json: async () => corpo,
  }));
  return { fetch, esperar: async () => {}, online: () => true, agora: () => 0 };
}

describe('pedirPrevisao e pedirAvisos', () => {
  it('pede o url de lisboa, arruma e guarda na cache', async () => {
    const deps = depsCom(PREVISAO);
    const cache = { storage: criarStorage(), agora: () => 1000 };
    const r = await pedirPrevisao(undefined, { deps, cache });
    expect(deps.fetch.mock.calls[0][0]).toBe('https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1110600.json');
    expect(r.erro).toBeNull();
    expect(r.dados[0].data).toBe('2026-09-24');

    // segunda vez, dentro da validade, vem da cache sem novo pedido
    const outra = await pedirPrevisao(undefined, { deps, cache });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    expect(outra.daCache).toBe(true);
  });

  it('json com formato estranho é resposta inválida', async () => {
    const r = await pedirPrevisao(undefined, { deps: depsCom({ nada: 1 }), cache: { storage: criarStorage() } });
    expect(r).toMatchObject({ dados: null, erro: 'respostaInvalida' });
  });

  it('avisos vêm arrumados só para lisboa', async () => {
    const r = await pedirAvisos(undefined, { deps: depsCom(AVISOS), cache: { storage: criarStorage() } });
    expect(r.dados.map((a) => a.nivel)).toEqual(['yellow', 'orange', 'yellow']);
  });
});
