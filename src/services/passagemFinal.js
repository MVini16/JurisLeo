// passagem final: nos 3 dias antes de uma prova, cada cartão dessa cadeira aparece pelo menos
// uma vez, repartido pelos dias que faltam — função pura, sem firebase nem react.
// "visto" = revisto desde o início da janela (3 dias antes da prova).
import { diasEntre, paraData } from './datas.js';
import { estaPronto } from './repeticaoEspacada.js';

export const DIAS_PASSAGEM = 3;
const TIPOS_PROVA = new Set(['frequencia', 'exame', 'oral']);

function inicioDoDia(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// as provas (com cadeira) que estão dentro da janela: de 3 dias antes até ao próprio dia
export function provasNaJanela(eventos, hoje = new Date()) {
  const vistas = new Set();
  return eventos
    .filter((e) => TIPOS_PROVA.has(e.tipo) && e.estado !== 'cancelado' && e.cadeira)
    .map((e) => ({ evento: e, data: paraData(e.dataOriginal ?? e.data) }))
    .filter(({ data }) => data && diasEntre(hoje, data) >= 0 && diasEntre(hoje, data) <= DIAS_PASSAGEM)
    .filter(({ evento }) => !vistas.has(evento.id ?? evento.titulo) && vistas.add(evento.id ?? evento.titulo))
    .sort((a, b) => a.data - b.data);
}

// para cada prova na janela: quantos cartões da cadeira há, quantos já viu, e os de hoje
export function passagensFinais(flashcards, eventos, hoje = new Date()) {
  return provasNaJanela(eventos, hoje).map(({ evento, data }) => {
    const inicioJanela = inicioDoDia(new Date(data.getFullYear(), data.getMonth(), data.getDate() - DIAS_PASSAGEM));
    const daCadeira = flashcards.filter((f) => f.cadeiraId === evento.cadeira);
    const visto = (f) => {
      const d = paraData(f.ultimaRevisaoEm);
      return !!d && d >= inicioJanela;
    };
    // os mais difíceis primeiro (nível mais baixo)
    const porVer = daCadeira.filter((f) => !visto(f)).sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));
    const diasAte = diasEntre(hoje, data);
    // no dia da prova vai tudo o que falta; antes, reparte pelos dias até à véspera
    const diasParaRepartir = Math.max(1, diasAte);
    const quotaHoje = Math.ceil(porVer.length / diasParaRepartir);
    return {
      prova: evento,
      data,
      diasAte,
      cadeiraId: evento.cadeira,
      total: daCadeira.length,
      vistos: daCadeira.length - porVer.length,
      porVer: porVer.length,
      hoje: porVer.slice(0, quotaHoje),
    };
  });
}

// os cartões prontos hoje: os do agendamento normal mais os da passagem final, sem repetir
export function prontosComPassagem(flashcards, eventos, hoje = new Date()) {
  const extra = passagensFinais(flashcards, eventos, hoje).flatMap((p) => p.hoje);
  const vistos = new Set();
  return [...flashcards.filter((f) => estaPronto(f, hoje)), ...extra].filter((f) => !vistos.has(f.id) && vistos.add(f.id));
}
