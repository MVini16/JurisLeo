// feriados nacionais de portugal — as datas móveis são calculadas a partir da páscoa, não escritas à mão
// fonte das datas fixas: código do trabalho, art. 234.º (com o regresso do corpo de deus,
// 5 de outubro, 1 de novembro e 1 de dezembro em vigor desde 2016)

// domingo de páscoa (algoritmo gregoriano anónimo, válido para qualquer ano do calendário gregoriano)
export function pascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function somarDias(data, dias) {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

// 'aaaa-mm-dd' em hora local (nunca por toISOString, que converte para utc e pode mudar o dia)
export function chaveData(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function feriadosDoAno(ano) {
  const easter = pascoa(ano);
  const lista = [
    { data: new Date(ano, 0, 1), nome: 'Ano Novo' },
    { data: somarDias(easter, -2), nome: 'Sexta-feira Santa', movel: true },
    { data: easter, nome: 'Páscoa', movel: true },
    { data: new Date(ano, 3, 25), nome: 'Dia da Liberdade' },
    { data: new Date(ano, 4, 1), nome: 'Dia do Trabalhador' },
    { data: somarDias(easter, 60), nome: 'Corpo de Deus', movel: true },
    { data: new Date(ano, 5, 10), nome: 'Dia de Portugal' },
    { data: new Date(ano, 7, 15), nome: 'Assunção de Nossa Senhora' },
    { data: new Date(ano, 9, 5), nome: 'Implantação da República' },
    { data: new Date(ano, 10, 1), nome: 'Todos os Santos' },
    { data: new Date(ano, 11, 1), nome: 'Restauração da Independência' },
    { data: new Date(ano, 11, 8), nome: 'Imaculada Conceição' },
    { data: new Date(ano, 11, 25), nome: 'Natal' },
  ];
  return lista.map((f) => ({ ...f, movel: !!f.movel, chave: chaveData(f.data) }));
}

const cache = new Map();

function mapaDoAno(ano) {
  if (!cache.has(ano)) {
    cache.set(ano, new Map(feriadosDoAno(ano).map((f) => [f.chave, f.nome])));
  }
  return cache.get(ano);
}

// nome do feriado nesse dia, ou null se for um dia normal
export function nomeFeriado(data) {
  return mapaDoAno(data.getFullYear()).get(chaveData(data)) || null;
}

export function ehFeriado(data) {
  return nomeFeriado(data) !== null;
}
