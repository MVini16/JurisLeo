// dados fixos da api aberta do ipma (tempo em lisboa) — https://api.ipma.pt
// regras do ipma: citar sempre "Fonte: IPMA" na app e avisar webmaster@ipma.pt do uso
// os dados atualizam duas vezes por dia, por isso a cache pode ser generosa

export const FONTE_IPMA = 'Fonte: IPMA';

// lisboa: globalIdLocal da previsão diária e área dos avisos (confirmada em ipma.pt/pt/otempo/prev-sam/?p=LSB)
export const ID_LOCAL_LISBOA = 1110600;
export const AREA_AVISO_LISBOA = 'LSB';

export const URL_PREVISAO = (idLocal) =>
  `https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/${idLocal}.json`;
export const URL_AVISOS = 'https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json';

export const VALIDADE_PREVISAO_MS = 45 * 60 * 1000;
export const VALIDADE_AVISOS_MS = 15 * 60 * 1000;

// níveis de aviso, do menos para o mais grave; o verde é "sem aviso" e nunca se mostra
export const NIVEIS_AVISO = ['green', 'yellow', 'orange', 'red'];
export const NOMES_NIVEL = { yellow: 'Amarelo', orange: 'Laranja', red: 'Vermelho' };

// idWeatherType → texto. por confirmar contra o oficial:
// https://api.ipma.pt/open-data/weather-type-classe.json (tirado de github.com/JohnTrabusca/IPMA-API)
export const TIPOS_TEMPO = {
  1: 'Céu limpo',
  2: 'Céu pouco nublado',
  3: 'Céu parcialmente nublado',
  4: 'Céu muito nublado ou encoberto',
  5: 'Céu nublado por nuvens altas',
  6: 'Aguaceiros',
  7: 'Aguaceiros fracos',
  8: 'Aguaceiros fortes',
  9: 'Chuva',
  10: 'Chuva fraca ou chuvisco',
  11: 'Chuva forte',
  12: 'Períodos de chuva',
  13: 'Períodos de chuva fraca',
  14: 'Períodos de chuva forte',
  15: 'Chuvisco',
  16: 'Neblina',
  17: 'Nevoeiro ou nuvens baixas',
  18: 'Neve',
  19: 'Trovoada',
  20: 'Aguaceiros e trovoada',
  21: 'Granizo',
  22: 'Geada',
  23: 'Chuva e trovoada',
  24: 'Nebulosidade convectiva',
  25: 'Céu com períodos de muito nublado',
  26: 'Nevoeiro',
  27: 'Céu nublado',
};
