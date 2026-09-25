// datas em português, em linguagem natural — funções puras
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const DIAS_CURTOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// 'aaaa-mm-dd' → Date ao meio-dia local (evita saltos de dia por fuso horário)
export function dataDeChave(chave) {
  const [a, m, d] = chave.split('-').map(Number);
  return new Date(a, m - 1, d, 12, 0, 0);
}

// aceita Date ou Timestamp do firestore (ou nada) e devolve Date ou null
export function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  return valor.toDate?.() ?? null;
}

function inicioDoDia(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function diasEntre(a, b) {
  return Math.round((inicioDoDia(b) - inicioDoDia(a)) / 86400000);
}

// "segunda, 14 de setembro"
export function dataCurta(d) {
  return `${DIAS_CURTOS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

// hoje, amanhã, ontem, o dia da semana até 7 dias, e a data por extenso depois disso
export function dataNatural(d, hoje = new Date()) {
  const dif = diasEntre(hoje, d);
  if (dif === 0) return 'hoje';
  if (dif === 1) return 'amanhã';
  if (dif === -1) return 'ontem';
  if (dif > 1 && dif <= 7) return DIAS[d.getDay()];
  return dataCurta(d);
}

// tempo que falta até um prazo, para lembretes: "até amanhã às 24h", "já passou"
export function textoPrazo(prazo, agora = new Date()) {
  if (prazo < agora) return 'o prazo já passou';
  const dif = diasEntre(agora, prazo);
  if (dif === 0) return 'até hoje às 24h';
  return `até ${dataNatural(prazo, agora)} às 24h`;
}
