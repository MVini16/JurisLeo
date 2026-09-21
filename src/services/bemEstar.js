// registo diário de bem-estar — lógica pura, sem firebase nem react (spec 25)
// registo por dia: { manha: { humor, energia, motivacao, sono }, noite: { humor, energia, motivacao, texto, opcionais }, apagado }
import { chaveData } from '../data/feriados.js';
import { IDS_PRINCIPAIS, OPCOES_SONO, MAX_TEXTO, campoOpcional, ESCALA5 } from '../data/bemEstar.js';

// nos dois níveis mais baixos considera-se "em baixo"
export const LIMITE_BAIXO = 2;
const DIAS_PARA_ALERTA = 3;

// primeira abertura antes do meio-dia é a da manhã (curta); depois das 19h é a da noite (completa)
export function janelaAtual(hora) {
  if (hora < 12) return 'manha';
  if (hora >= 19) return 'noite';
  return null;
}

export function registoDaJanela(registo, janela) {
  if (!registo || registo.apagado) return null;
  return registo[janela] || null;
}

// que janela mostrar agora, ou null. aviso = { data, janela, dispensadas } guardado neste aparelho
// insiste uma vez: à segunda vez que ela diz "agora não", cala-se até à janela seguinte
export function janelaParaMostrar({ hora, registoHoje, aviso, hojeChave }) {
  const janela = janelaAtual(hora);
  if (!janela) return null;
  if (registoDaJanela(registoHoje, janela)) return null;
  const desta = aviso && aviso.data === hojeChave && aviso.janela === janela ? aviso : null;
  if (desta && desta.dispensadas >= 2) return null;
  return janela;
}

export function aposDispensar(aviso, janela, hojeChave) {
  const desta = aviso && aviso.data === hojeChave && aviso.janela === janela ? aviso.dispensadas : 0;
  return { data: hojeChave, janela, dispensadas: desta + 1 };
}

// os três valores do dia: a noite (mais recente) ou, se ainda não houve, a manhã
export function valoresDoDia(registo) {
  if (!registo || registo.apagado) return null;
  const base = registo.noite || registo.manha;
  if (!base) return null;
  return { humor: base.humor, energia: base.energia, motivacao: base.motivacao };
}

export function estaEmBaixo(valores) {
  if (!valores) return false;
  return IDS_PRINCIPAIS.some((id) => valores[id] != null && valores[id] <= LIMITE_BAIXO);
}

function somaDias(data, n) {
  const d = new Date(data);
  d.setDate(d.getDate() + n);
  return d;
}

// registos: { 'aaaa-mm-dd': registo }
// dias seguidos em que registou (hoje ainda por fazer não quebra). registar em baixo mantém a série
export function sequenciaRegisto(registos, hoje = new Date()) {
  let dias = 0;
  let dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);
  const hojeChave = chaveData(dia);
  for (let i = 0; i < 3660; i++) {
    const chave = chaveData(dia);
    if (valoresDoDia(registos[chave])) dias += 1;
    else if (chave !== hojeChave) break;
    dia = somaDias(dia, -1);
  }
  return dias;
}

// alerta de persistência: humor, energia ou motivação nos dois níveis mais baixos 3 dias seguidos.
// conta os três dias seguidos mais recentes, desde que o último seja hoje ou ontem
export function alertaPersistencia(registos, hoje = new Date()) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);
  const hojeChave = chaveData(base);
  const inicio = valoresDoDia(registos[hojeChave]) ? 0 : 1;

  const dias = [];
  for (let i = inicio; i < inicio + DIAS_PARA_ALERTA; i++) {
    const chave = chaveData(somaDias(base, -i));
    const valores = valoresDoDia(registos[chave]);
    if (!valores) return null;
    dias.push({ chave, valores });
  }

  for (const id of IDS_PRINCIPAIS) {
    if (dias.every((d) => d.valores[id] != null && d.valores[id] <= LIMITE_BAIXO)) {
      return { campo: id, dias: DIAS_PARA_ALERTA, desde: dias[dias.length - 1].chave };
    }
  }
  return null;
}

// série para o gráfico, do dia mais antigo ao mais recente
export function serieParaGrafico(registos, dias, hoje = new Date()) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);
  const serie = [];
  for (let i = dias - 1; i >= 0; i--) {
    const chave = chaveData(somaDias(base, -i));
    const registo = registos[chave];
    const valores = valoresDoDia(registo);
    serie.push({
      chave,
      humor: valores?.humor ?? null,
      energia: valores?.energia ?? null,
      motivacao: valores?.motivacao ?? null,
      apagado: !!registo?.apagado,
      temTexto: !!registo?.noite?.texto,
    });
  }
  return serie;
}

// o texto novo mais recente (para a consola), ou null
export function ultimoTexto(registos) {
  const chaves = Object.keys(registos).filter((c) => registos[c]?.noite?.texto && !registos[c].apagado).sort();
  const chave = chaves[chaves.length - 1];
  return chave ? { data: chave, texto: registos[chave].noite.texto } : null;
}

// valida e limpa o que ela preencheu. devolve { erro } ou { dados }
// camposAtivos: ids dos opcionais ligados em definições (só afetam a noite)
export function prepararRegisto(janela, entrada, camposAtivos = []) {
  const dados = {};
  for (const id of IDS_PRINCIPAIS) {
    const v = Number(entrada?.[id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) return { erro: 'Falta escolher como estás, a energia e a motivação.' };
    dados[id] = v;
  }

  if (janela === 'manha') {
    if (entrada.sono != null && entrada.sono !== '') {
      const s = Number(entrada.sono);
      if (!OPCOES_SONO.includes(s)) return { erro: 'As horas de sono não estão certas.' };
      dados.sono = s;
    }
    return { dados };
  }

  dados.texto = String(entrada?.texto ?? '').trim().slice(0, MAX_TEXTO);
  const opcionais = {};
  for (const id of camposAtivos) {
    const campo = campoOpcional(id);
    const valor = entrada?.opcionais?.[id];
    if (!campo || valor == null || valor === '') continue;
    if (campo.tipo === 'escala5' && !(Number.isInteger(valor) && valor >= 1 && valor <= ESCALA5.length)) continue;
    if (campo.tipo === 'tres' && !campo.opcoes.includes(valor)) continue;
    if (campo.tipo === 'simnao' && valor !== 'Sim' && valor !== 'Não') continue;
    opcionais[id] = valor;
  }
  dados.opcionais = opcionais;
  return { dados };
}
