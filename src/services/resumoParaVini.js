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
// quantos dos últimos 7 dias (contando com hoje) ela estudou, e a maior série de sempre
export function estudoDaSemana(dias, hoje) {
  const [a, m, d] = hoje.split('-').map(Number);
  const janela = new Set(Array.from({ length: 7 }, (_, i) => {
    const x = new Date(a, m - 1, d - i);
    return `${x.getFullYear()}-${dois(x.getMonth() + 1)}-${dois(x.getDate())}`;
  }));
  return dias.filter((dia) => janela.has(dia)).length;
}

export function melhorSerie(dias) {
  const emDias = (dia) => { const [a, m, d] = dia.split('-').map(Number); return Math.round(Date.UTC(a, m - 1, d) / 86400000); };
  const ordem = [...new Set(dias)].sort().map(emDias);
  let melhor = 0;
  let atual = 0;
  ordem.forEach((n, i) => {
    atual = i > 0 && n - ordem[i - 1] === 1 ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
  });
  return melhor;
}

// uma cadeira na linha das faltas: 'DA I 5 aulas dadas, 1 injustificada, 0 justificadas (Tranquila)'
const SELO_FALTAS = { verde: 'Tranquila', amarelo: 'Atenção', vermelho: 'Em risco' };
function textoFaltas(f) {
  const estado = f.excluida ? 'Excluída' : (SELO_FALTAS[f.semaforo] ?? '');
  return `${f.abrev} ${f.dadas} dadas, ${f.injustificadas} injust., ${f.justificadas} just.${estado ? ` (${estado})` : ''}`;
}

const NOMES_JOGOS = { vf: 'Verdadeiro ou Falso', jurista: 'Quem Quer Ser Jurista', caso: 'Caso Prático', pares: 'Liga os Pares', diario: 'Audiência do dia' };

export function montarResumo({ quando, escolhas, dados }) {
  const linhas = [CABECALHO, `Quando: ${formatarQuando(quando)}`];
  if (escolhas.estudo) {
    const serie = dados.serie ?? 0;
    const dias = serie === 1 ? '1 dia seguido' : `${serie} dias seguidos`;
    const partes = [serie > 0 ? dias : 'sem série de estudo neste momento', `${dados.cartoesHoje ?? 0} flashcards hoje`];
    if (dados.diasNaSemana != null) partes.push(`estudou ${dados.diasNaSemana} dos últimos 7 dias`);
    if (dados.melhorSerie) partes.push(`melhor série ${dados.melhorSerie} dias`);
    linhas.push(`Estudo: ${partes.join(', ')}`);
  }
  if (escolhas.jogos) {
    const p = dados.perfilJogos ?? {};
    const nivel = nivelDeCarreira(p.xp);
    const partes = [nivel.titulo, `${p.xp ?? 0} XP`, `${p.selos?.length ?? 0} selos`, `${p.jogadas ?? 0} jogadas`, `${p.perfeitas ?? 0} perfeitas`, `${p.audiencias ?? 0} audiências do dia`];
    linhas.push(`Jogos: ${partes.join(', ')}`);
    const recordes = Object.entries(dados.recordes ?? {}).filter(([, v]) => Number.isFinite(v) && v > 0);
    if (recordes.length > 0) linhas.push(`Recordes: ${recordes.map(([k, v]) => `${NOMES_JOGOS[k] ?? k} ${v}`).join(', ')}`);
  }
  if (escolhas.tarefas && dados.tarefas) {
    const t = dados.tarefas;
    linhas.push(`Tarefas: ${t.porFazer} por fazer, ${t.atrasadas} atrasadas, ${t.feitas} feitas`);
  }
  if (escolhas.faltas && dados.faltas?.length) {
    linhas.push(`Faltas: ${dados.faltas.map(textoFaltas).join('; ')}`);
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
    recordes: campos.Recordes ?? null,
    tarefas: campos.Tarefas ?? null,
    faltas: campos.Faltas ?? null,
  };
}

// junta um resumo à lista (o mais recente primeiro), sem repetir o mesmo e sem a lista crescer sem fim
export function juntarResumo(lista, resumo) {
  if (!resumo) return lista;
  if (lista.some((r) => r.quando === resumo.quando && r.estudo === resumo.estudo && r.jogos === resumo.jogos && r.estado === resumo.estado && r.tarefas === resumo.tarefas && r.faltas === resumo.faltas && r.recordes === resumo.recordes)) return lista;
  return [{ id: `${Date.now()}-${lista.length}`, ...resumo }, ...lista].slice(0, MAX_RESUMOS);
}

export function removerResumo(lista, id) {
  return lista.filter((r) => r.id !== id);
}

// as tarefas por fazer, atrasadas (prazo antes de hoje) e feitas. `hoje` em AAAA-MM-DD
export function contarTarefas(tarefas, hoje) {
  const feitas = tarefas.filter((t) => t.concluida).length;
  const abertas = tarefas.filter((t) => !t.concluida);
  const atrasadas = abertas.filter((t) => t.prazo && String(t.prazo).slice(0, 10) < hoje).length;
  return { porFazer: abertas.length, atrasadas, feitas };
}
