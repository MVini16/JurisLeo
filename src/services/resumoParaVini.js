// o resumo que a leonor decide mandar ao vini — lógica pura, sem react nem firebase.
// ela escolhe o que entra (estudo, jogos, como está) e manda quando quer; o vini cola o texto na consola (/admin).
// nada daqui é lido da conta dela: só se junta o que ela deixou ligado, no momento em que carrega em enviar
import { nivelDeCarreira } from './jogosMeta.js';

export const CABECALHO = 'Resumo do JurisLeo';
const MAX_RESUMOS = 100;

function dois(n) { return String(n).padStart(2, '0'); }

// DD-MM-AAAA HH:MM
export function formatarQuando(data) {
  const d = new Date(data);
  return `${dois(d.getDate())}-${dois(d.getMonth() + 1)}-${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

// as escolhas dela: { estudo, jogos, estado } (cada uma ligada ou desligada).
// `dados`: { serie, cartoesHoje, perfilJogos, estado } vêm do telemóvel dela na hora de enviar
export function montarResumo({ quando, escolhas, dados }) {
  const linhas = [CABECALHO, `Quando: ${formatarQuando(quando)}`];
  if (escolhas.estudo) {
    const serie = dados.serie ?? 0;
    const dias = serie === 1 ? '1 dia seguido' : `${serie} dias seguidos`;
    linhas.push(`Estudo: ${serie > 0 ? dias : 'sem série de estudo neste momento'}, ${dados.cartoesHoje ?? 0} flashcards hoje`);
  }
  if (escolhas.jogos) {
    const p = dados.perfilJogos ?? {};
    const nivel = nivelDeCarreira(p.xp);
    linhas.push(`Jogos: ${nivel.titulo}, ${p.selos?.length ?? 0} selos, ${p.jogadas ?? 0} jogadas`);
  }
  if (escolhas.estado && dados.estado) linhas.push(`Como estou: ${dados.estado}`);
  return linhas.join('\n');
}

// o contrário: lê o texto colado na consola. devolve null se não for um resumo
export function lerResumo(texto) {
  const linhas = String(texto ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const inicio = linhas.findIndex((l) => l === CABECALHO);
  if (inicio === -1) return null;
  const campos = {};
  for (const l of linhas.slice(inicio + 1)) {
    const i = l.indexOf(':');
    if (i === -1) continue;
    campos[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  if (!campos.Quando) return null;
  return {
    quando: campos.Quando,
    estudo: campos.Estudo ?? null,
    jogos: campos.Jogos ?? null,
    estado: campos['Como estou'] ?? null,
  };
}

// junta um resumo à lista (o mais recente primeiro), sem repetir o mesmo e sem a lista crescer sem fim
export function juntarResumo(lista, resumo) {
  if (!resumo) return lista;
  if (lista.some((r) => r.quando === resumo.quando && r.estudo === resumo.estudo && r.jogos === resumo.jogos && r.estado === resumo.estado)) return lista;
  return [{ id: `${Date.now()}-${lista.length}`, ...resumo }, ...lista].slice(0, MAX_RESUMOS);
}

export function removerResumo(lista, id) {
  return lista.filter((r) => r.id !== id);
}
