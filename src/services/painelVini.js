// o que a consola do vini mostra da conta da leonor, em contas puras (sem firebase nem react):
// recebe o mesmo objeto que recolherDadosParaExportar devolve e resume por cadeira, aulas recentes, jogos e escolhas.
// as contas das faltas são as do motor (faltasEfetivas + estadoFaltas), nunca reimplementadas aqui
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { ROTULO_CURTO } from '../data/estadosAula.js';
import { faltasEfetivas } from './presencas.js';
import { estadoFaltas } from './faltas.js';
import { nivelDeCarreira } from './jogosMeta.js';

function lerJson(texto, padrao) {
  try { return JSON.parse(texto) ?? padrao; } catch { return padrao; }
}

export function painelDaLeonor(dados) {
  const cadeiras = Array.isArray(dados?.cadeiras) ? dados.cadeiras : [];
  const porId = Object.fromEntries(cadeirasS1.map((c) => [c.id, c]));
  const recentes = [];

  const linhas = cadeiras.map((c) => {
    const info = porId[c.id] || {};
    const marcas = c.presencas?.marcas || {};
    const efetivas = faltasEfetivas(c.faltas || {}, marcas);
    const estado = estadoFaltas({
      aulasPraticasPrevistas: c.faltas?.aulasPraticasPrevistas ?? info.aulasPraticasPrevistas ?? 0,
      aulasPraticasLecionadas: efetivas.aulasPraticasLecionadas,
      faltasInjustificadas: efetivas.faltasInjustificadas,
      faltasJustificadas: efetivas.faltasJustificadas,
    });
    Object.entries(marcas).forEach(([chave, m]) => {
      recentes.push({ chave, data: m?.data || chave.split('_').pop(), cadeira: info.abrev || c.id, estado: ROTULO_CURTO[m?.estado] || m?.estado || '?' });
    });
    return {
      id: c.id,
      nome: info.nome || c.nome || c.id,
      abrev: info.abrev || c.id,
      marcadas: Object.keys(marcas).length,
      presentes: efetivas.marcas.presentes,
      lecionadas: efetivas.aulasPraticasLecionadas,
      injustificadas: efetivas.faltasInjustificadas,
      justificadas: efetivas.faltasJustificadas,
      semaforo: estado.semaforo,
      explicacao: estado.explicacao,
      sumarios: Object.keys(c.presencas?.notasAulas || {}).length,
      avaliacao: c.avaliacao || null,
    };
  });

  recentes.sort((a, b) => String(b.data).localeCompare(String(a.data)));

  const copia = dados?.configuracoes?.copiaLocal || {};
  const perfilJogos = lerJson(copia['jurisleo-jogos-perfil']?.v, null);
  const recordes = lerJson(copia['jurisleo-jogos']?.v, {});
  const jogos = perfilJogos ? {
    xp: perfilJogos.xp || 0,
    nivel: nivelDeCarreira(perfilJogos.xp || 0).titulo,
    jogadas: perfilJogos.jogadas || 0,
    selos: Array.isArray(perfilJogos.selos) ? perfilJogos.selos.length : 0,
    recordes: Object.entries(recordes).map(([jogo, r]) => ({ jogo, melhor: r?.melhor ?? 0 })),
  } : null;

  const escolhas = Object.entries(copia)
    .map(([chave, { em } = {}]) => ({ chave: chave.replace(/^jurisleo-/, ''), em: Number(em) || 0 }))
    .sort((a, b) => b.em - a.em);

  const contar = (v) => (Array.isArray(v) ? v.length : 0);
  return {
    nome: dados?.perfil?.nome || 'Leonor',
    cadeiras: linhas,
    recentes: recentes.slice(0, 15),
    jogos,
    escolhas,
    ultimaCopiaLocal: Number(dados?.configuracoes?.copiaLocalEm) || Math.max(0, ...escolhas.map((e) => e.em)),
    migracao: dados?.configuracoes?.migracaoAntiga || null,
    contagens: {
      notas: contar(dados?.anotacoes), tarefas: contar(dados?.tarefas), flashcards: contar(dados?.flashcards),
      eventos: contar(dados?.eventos), casos: contar(dados?.casos), estudo: contar(dados?.sessoesEstudo),
    },
    tarefasPorFazer: (dados?.tarefas || []).filter((t) => !t.concluida).slice(0, 10).map((t) => t.titulo || t.texto || 'tarefa'),
  };
}
