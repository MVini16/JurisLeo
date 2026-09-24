// tempo e avisos em lisboa, a partir da api aberta do ipma
// as funções "arrumar" são puras (json cru → formato da app); as "pedir" ligam ao cliente e à cache
import {
  ID_LOCAL_LISBOA, AREA_AVISO_LISBOA, URL_PREVISAO, URL_AVISOS,
  VALIDADE_PREVISAO_MS, VALIDADE_AVISOS_MS, NIVEIS_AVISO, TIPOS_TEMPO,
} from '../../data/ipma.js';
import { pedir } from './cliente.js';
import { comCache } from './cache.js';

// o ipma pode mandar números como texto ("27.3") e usa -99 para "sem dados"
function numero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= -99) return null;
  return n;
}

// json da previsão diária → [{ data, min, max, chuva, tipo, descricao }] por ordem de data; null se não for o formato esperado
export function arrumarPrevisao(json) {
  if (!json || !Array.isArray(json.data)) return null;
  return json.data
    .filter((dia) => typeof dia?.forecastDate === 'string')
    .map((dia) => {
      const tipo = numero(dia.idWeatherType);
      return {
        data: dia.forecastDate,
        min: numero(dia.tMin),
        max: numero(dia.tMax),
        chuva: numero(dia.precipitaProb),
        tipo,
        descricao: TIPOS_TEMPO[tipo] ?? null,
      };
    })
    .sort((a, b) => a.data.localeCompare(b.data));
}

// json dos avisos → só os da área pedida e não verdes, com as horas em milissegundos (para caber na cache); null se não for uma lista
export function arrumarAvisos(json, area = AREA_AVISO_LISBOA) {
  if (!Array.isArray(json)) return null;
  return json
    .filter((a) => a?.idAreaAviso === area && NIVEIS_AVISO.indexOf(a.awarenessLevelID) > 0)
    .map((a) => ({
      nivel: a.awarenessLevelID,
      tipo: a.awarenessTypeName ?? '',
      texto: a.text ?? '',
      inicio: Date.parse(a.startTime),
      fim: Date.parse(a.endTime),
    }))
    .filter((a) => Number.isFinite(a.inicio) && Number.isFinite(a.fim));
}

// dos avisos arrumados, os que ainda não acabaram, do mais grave para o menos grave e depois pelo que começa primeiro
export function avisosAtivos(avisos, agora = Date.now()) {
  return (avisos ?? [])
    .filter((a) => a.fim > agora)
    .sort((a, b) => NIVEIS_AVISO.indexOf(b.nivel) - NIVEIS_AVISO.indexOf(a.nivel) || a.inicio - b.inicio);
}

// pede e arruma; um json com formato estranho passa a erro "respostaInvalida"
async function pedirArrumado(url, arrumar, deps) {
  const resposta = await pedir(url, {}, deps);
  if (!resposta.ok) return resposta;
  const dados = arrumar(resposta.dados);
  if (dados === null) return { ok: false, dados: null, erro: 'respostaInvalida', tentarDepois: null };
  return { ...resposta, dados };
}

// devolvem o formato do comCache: { dados, guardadoEm, daCache, erro, tentarDepois }
export function pedirPrevisao(idLocal = ID_LOCAL_LISBOA, { deps, cache } = {}) {
  return comCache(`ipma-previsao-${idLocal}`, VALIDADE_PREVISAO_MS,
    () => pedirArrumado(URL_PREVISAO(idLocal), arrumarPrevisao, deps), cache);
}

export function pedirAvisos(area = AREA_AVISO_LISBOA, { deps, cache } = {}) {
  return comCache(`ipma-avisos-${area}`, VALIDADE_AVISOS_MS,
    () => pedirArrumado(URL_AVISOS, (json) => arrumarAvisos(json, area), deps), cache);
}
