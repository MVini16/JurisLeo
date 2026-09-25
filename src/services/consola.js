// resumo dos dados dela para a consola — funções puras, sem firebase nem react
// reutiliza os motores de avaliação e de faltas: a consola diz exatamente o que ela vê
import { estadoDaCadeira, pesosDaCadeira, resumoDoAno } from './notas.js';
import { estadoFaltas } from './faltas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import { minutosPorDia, sequenciaAtual, minutosDaSemana } from './estatisticasEstudo.js';
import { estaPronto } from './repeticaoEspacada.js';
import { chaveData } from '../data/feriados.js';
import { diasEntre } from './datas.js';
import { proximaProva } from './provas.js';
import { serieParaGrafico, sequenciaRegisto, alertaPersistencia, ultimoTexto } from './bemEstar.js';

const DIAS_PARA_AVISAR_FREQUENCIA = 7;

export function contarPalavras(texto) {
  return String(texto ?? '').split(/\s+/).filter(Boolean).length;
}

// estado de uma cadeira: avaliação e faltas, como aparecem à Leonor
export function resumirCadeira({ cadeira, faltasDados, avaliacaoDados }) {
  const info = getCadeira(cadeira.id) || {};
  const metodo = cadeira.metodo || info.metodo;
  const previstas = cadeira.aulasPraticasPrevistas ?? info.aulasPraticasPrevistas;

  const avaliacao = avaliacaoDados
    ? estadoDaCadeira({ metodo, avaliacaoDados, pesos: pesosDaCadeira(cadeira, info) }).resultado
    : null;

  const faltas = faltasDados && previstas
    ? estadoFaltas({
        aulasPraticasPrevistas: previstas,
        aulasPraticasLecionadas: faltasDados.aulasPraticasLecionadas || 0,
        faltasInjustificadas: faltasDados.faltasInjustificadas || 0,
        faltasJustificadas: faltasDados.faltasJustificadas || 0,
      })
    : null;

  return { id: cadeira.id, abrev: cadeira.abrev || info.abrev || cadeira.id, nome: cadeira.nome || info.nome || cadeira.id, avaliacao, faltas };
}

// junta tudo o que a consola mostra
export function resumirDados({ cadeiras = [], faltas = {}, avaliacoes = {}, tarefas = [], sessoes = [], anotacoes = [], casos = [], flashcards = [], eventos = [], registosDiarios = {} }, hoje = new Date()) {
  const porCadeira = cadeiras.map((cadeira) => resumirCadeira({ cadeira, faltasDados: faltas[cadeira.id], avaliacaoDados: avaliacoes[cadeira.id] }));
  const resultados = porCadeira.map((c) => c.avaliacao).filter(Boolean);

  const hojeChave = chaveData(hoje);
  const pendentes = tarefas.filter((t) => !t.concluida);
  const atrasadas = pendentes.filter((t) => t.prazo && t.prazo < hojeChave);

  const porDia = minutosPorDia(sessoes);

  // só há média quando já há pelo menos uma cadeira aprovada com nota
  const ano = resultados.length ? resumoDoAno(resultados) : null;

  return {
    cadeiras: porCadeira,
    media: ano?.media != null ? ano : null,
    tarefas: { pendentes: pendentes.length, atrasadas: atrasadas.length, titulosAtrasadas: atrasadas.slice(0, 3).map((t) => t.titulo) },
    estudo: { minutosSemana: minutosDaSemana(porDia, hoje), sequencia: sequenciaAtual(porDia, hoje).dias, sessoes: sessoes.length, hoje: (porDia[hojeChave] || 0) > 0 },
    producao: {
      anotacoes: anotacoes.length,
      palavras: anotacoes.reduce((soma, a) => soma + contarPalavras(a.conteudo), 0),
      casosTotal: casos.length,
      casosPorResolver: casos.filter((c) => c.estado === 'porResolver' || c.estado === 'duvida').length,
      flashcardsTotal: flashcards.length,
      flashcardsProntos: flashcards.filter((f) => estaPronto(f, hoje)).length,
    },
    proximaProva: proximaProva(eventos, hoje),
    bemEstar: {
      temRegistos: Object.keys(registosDiarios).length > 0,
      serie: serieParaGrafico(registosDiarios, 7, hoje),
      sequencia: sequenciaRegisto(registosDiarios, hoje),
      alerta: alertaPersistencia(registosDiarios, hoje),
      texto: ultimoTexto(registosDiarios),
    },
  };
}

// "o que precisa de ti": lista curta e acionável, das mais urgentes para as menos
export function triagem(resumo, hoje = new Date()) {
  const itens = [];

  for (const c of resumo.cadeiras) {
    if (c.faltas?.excluidaConfirmada || c.faltas?.faltasRestantesSemestre === 0) {
      itens.push({ id: `faltas-${c.id}`, severidade: 'urgente', titulo: `Faltas no limite em ${c.abrev}`, detalhe: c.faltas.explicacao });
    } else if (c.faltas?.quaseNoLimite) {
      itens.push({ id: `faltas-${c.id}`, severidade: 'aviso', titulo: `Faltas a chegar ao limite em ${c.abrev}`, detalhe: c.faltas.explicacao });
    }
    if (c.avaliacao?.estado === 'excluida') {
      itens.push({ id: `excluida-${c.id}`, severidade: 'urgente', titulo: `${c.abrev}: excluída da avaliação`, detalhe: c.avaliacao.explicacao });
    }
  }

  if (resumo.tarefas.atrasadas > 0) {
    itens.push({
      id: 'tarefas-atrasadas',
      severidade: 'aviso',
      titulo: resumo.tarefas.atrasadas === 1 ? '1 tarefa atrasada' : `${resumo.tarefas.atrasadas} tarefas atrasadas`,
      detalhe: resumo.tarefas.titulosAtrasadas.join(', '),
    });
  }

  const prova = resumo.proximaProva;
  if (prova && prova.diasRestantes <= DIAS_PARA_AVISAR_FREQUENCIA) {
    const quando = prova.diasRestantes === 0 ? 'hoje' : prova.diasRestantes === 1 ? 'amanhã' : `daqui a ${prova.diasRestantes} dias`;
    itens.push({ id: 'prova-proxima', severidade: 'info', titulo: `${prova.titulo || 'Prova'} ${quando}`, detalhe: '' });
  }

  const bem = resumo.bemEstar;
  if (bem?.alerta) {
    const nome = { humor: 'O humor', energia: 'A energia', motivacao: 'A motivação' }[bem.alerta.campo];
    itens.push({ id: 'bem-estar-persistente', severidade: 'urgente', titulo: `${nome} está em baixo há ${bem.alerta.dias} dias`, detalhe: 'Ela sabe que foste avisado.' });
  }
  if (bem?.texto && diasEntre(new Date(`${bem.texto.data}T12:00:00`), hoje) <= 1) {
    itens.push({ id: 'bem-estar-texto', severidade: 'info', titulo: 'Deixou-te uma mensagem', detalhe: bem.texto.texto });
  }

  const ordem = { urgente: 0, aviso: 1, info: 2 };
  return itens.sort((a, b) => ordem[a.severidade] - ordem[b.severidade]);
}
