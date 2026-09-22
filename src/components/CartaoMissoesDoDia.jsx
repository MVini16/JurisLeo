// cartão no início: três missões pequenas e fixas do dia — 25 minutos, 10 cartões, 1 sumário
import { useHistoricoEstudo } from '../hooks/useHistoricoEstudo.js';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { useSumarios } from '../hooks/useSumarios.js';
import { progressoMissoes } from '../services/missoesDoDia.js';
import './CartaoMissoesDoDia.css';

const MISSOES = [
  { chave: 'minutos', icone: '⏱️', label: (p) => `${p.feito} de ${p.alvo} minutos` },
  { chave: 'flashcards', icone: '🗂️', label: (p) => `${p.feito} de ${p.alvo} cartões` },
  { chave: 'sumario', icone: '📝', label: (p) => `${p.feito} de ${p.alvo} sumário` },
];

export default function CartaoMissoesDoDia() {
  // só de hoje, mas sem o limite de 20 sessões de useSessoesEstudo (pensado para o
  // histórico recente, não para garantir que o dia de hoje inteiro está coberto)
  const { sessoes, loading: aCarregarSessoes } = useHistoricoEstudo(1);
  const { flashcards, loading: aCarregarCartoes } = useFlashcards();
  const { sumarios, loading: aCarregarSumarios } = useSumarios();

  if (aCarregarSessoes || aCarregarCartoes || aCarregarSumarios) return null;

  const progresso = progressoMissoes({ sessoes, flashcards, sumarios });
  const cumpridas = MISSOES.filter((m) => progresso[m.chave].cumprida).length;

  return (
    <div className="card anim-entrada">
      <div className="card-header">
        <span className="card-icon">🎯</span>
        <span className="card-titulo">Missões do dia ({cumpridas}/{MISSOES.length})</span>
      </div>
      <ul className="missoes-lista">
        {MISSOES.map((m) => {
          const p = progresso[m.chave];
          return (
            <li key={m.chave} className={`missoes-item ${p.cumprida ? 'cumprida' : ''}`}>
              <span className="missoes-item__check">{p.cumprida ? '✓' : m.icone}</span>
              <span className="missoes-item__label">{m.label(p)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
