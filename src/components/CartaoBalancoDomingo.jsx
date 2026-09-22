// cartão no início, só ao domingo: horas, cartões, sumários, o que ficou por fazer, e uma pergunta —
// uma vez por semana, dispensa-se com um clique até à próxima
import { useState } from 'react';
import { useSessoesEstudo } from '../hooks/useSessoesEstudo.js';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { useSumarios } from '../hooks/useSumarios.js';
import { useTarefas } from '../hooks/useTarefas.js';
import { balancoDaSemana, segundaDaSemana } from '../services/balancoSemana.js';
import { textoDuracao } from '../services/estatisticasEstudo.js';
import { chaveData } from '../data/feriados.js';

const CHAVE_DISPENSADO = 'jurisleo-balanco-dispensado';

function lerSemanaDispensada() {
  try { return localStorage.getItem(CHAVE_DISPENSADO); } catch { return null; }
}

export default function CartaoBalancoDomingo() {
  const { sessoes, loading: aCarregarSessoes } = useSessoesEstudo();
  const { flashcards, loading: aCarregarCartoes } = useFlashcards();
  const { sumarios, loading: aCarregarSumarios } = useSumarios();
  const { tarefas, loading: aCarregarTarefas } = useTarefas();
  const [dispensada, setDispensada] = useState(lerSemanaDispensada);

  const agora = new Date();
  const ehDomingo = agora.getDay() === 0;
  const chaveSemana = chaveData(segundaDaSemana(agora));

  if (!ehDomingo || dispensada === chaveSemana) return null;
  if (aCarregarSessoes || aCarregarCartoes || aCarregarSumarios || aCarregarTarefas) return null;

  const balanco = balancoDaSemana({ sessoes, flashcards, sumarios, tarefas }, agora);

  function dispensar() {
    try { localStorage.setItem(CHAVE_DISPENSADO, chaveSemana); } catch { /* sem localStorage, só não guarda */ }
    setDispensada(chaveSemana);
  }

  return (
    <div className="card anim-entrada">
      <div className="card-header">
        <span className="card-icon">🌇</span>
        <span className="card-titulo">Balanço da semana</span>
      </div>
      <p className="card-vazio">
        Estudaste <b>{textoDuracao(balanco.minutos)}</b>, reviste <b>{balanco.flashcardsRevistos}</b> cartões e registaste <b>{balanco.sumariosFeitos}</b> sumários.
        {balanco.tarefasPorFazer > 0 ? ` Ficaram ${balanco.tarefasPorFazer} tarefas por fazer.` : ' Não ficou nenhuma tarefa por fazer.'}
      </p>
      <p className="card-vazio"><i>{balanco.pergunta}</i></p>
      <div className="dash-ferr">
        <button className="dash-ferr__chip dash-ferr__chip--todas" onClick={dispensar}>Já vi</button>
      </div>
    </div>
  );
}
