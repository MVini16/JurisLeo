// as três ferramentas de uma nota aberta: barra de procura, painel do índice e a folha "criar flashcard".
// cada uma é um componente pequeno que o editor mostra consoante o que ela escolheu
import { useEffect, useRef, useState } from 'react';
import { cadeirasS1 } from '../../data/dadosLeonor.js';
import { prepararFlashcard } from '../../services/notaFerramentas.js';
import { criarFlashcard } from '../../services/flashcards.js';

export function BarraProcura({ termo, total, atual, aoMudar, aoAvancar, aoFechar }) {
  const campo = useRef(null);
  useEffect(() => { campo.current?.focus(); }, []);
  return (
    <div className="er-procura" role="search">
      <input
        ref={campo}
        type="search"
        className="er-procura__campo"
        placeholder="Procurar nesta nota"
        value={termo}
        onChange={(e) => aoMudar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); aoAvancar(e.shiftKey ? -1 : 1); }
          if (e.key === 'Escape') aoFechar();
        }}
        aria-label="Procurar nesta nota"
      />
      <span className="er-procura__contagem" aria-live="polite">
        {termo.trim() ? (total === 0 ? 'Nada encontrado' : `${atual + 1} de ${total}`) : ''}
      </span>
      <button type="button" className="er-btn" onClick={() => aoAvancar(-1)} disabled={total === 0} aria-label="Anterior">↑</button>
      <button type="button" className="er-btn" onClick={() => aoAvancar(1)} disabled={total === 0} aria-label="Seguinte">↓</button>
      <button type="button" className="er-btn" onClick={aoFechar} aria-label="Fechar a procura">✕</button>
    </div>
  );
}

export function PainelIndice({ itens, aoIr, aoFechar }) {
  return (
    <nav className="er-indice" aria-label="Índice da nota">
      <div className="er-indice__topo">
        <b>Índice</b>
        <button type="button" className="er-btn" onClick={aoFechar} aria-label="Fechar o índice">✕</button>
      </div>
      {itens.length === 0
        ? <p className="er-indice__vazio">Ainda não há títulos. Usa T1, T2 ou T3 no separador Parágrafo e eles aparecem aqui.</p>
        : (
          <ol className="er-indice__lista">
            {itens.map((item, i) => (
              <li key={`${i}-${item.texto}`} style={{ '--nivel': item.nivel - 1 }}>
                <button type="button" onClick={() => aoIr(i)}>{item.texto}</button>
              </li>
            ))}
          </ol>
        )}
    </nav>
  );
}

export function FolhaFlashcard({ selecao, cadeiraInicial, aoFechar, aoGuardado }) {
  const sugestao = prepararFlashcard(selecao);
  const [frente, setFrente] = useState(sugestao.frente);
  const [tras, setTras] = useState(sugestao.tras);
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1.some((c) => c.id === cadeiraInicial) ? cadeiraInicial : cadeirasS1[0].id);
  const [estado, setEstado] = useState('parado'); // parado | a-guardar | erro

  async function guardar() {
    if (!frente.trim() || !tras.trim()) return;
    setEstado('a-guardar');
    try {
      await criarFlashcard({ frente: frente.trim(), tras: tras.trim(), cadeiraId });
      aoGuardado();
    } catch {
      setEstado('erro');
    }
  }

  return (
    <div className="er-fundo" onClick={aoFechar}>
      <div className="er-folha-fc" role="dialog" aria-modal="true" aria-label="Criar flashcard" onClick={(e) => e.stopPropagation()}>
        <h2>Criar flashcard</h2>
        <div className="er-folha-fc__cadeiras">
          {cadeirasS1.map((c) => (
            <button key={c.id} type="button" className={`er-chip ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
          ))}
        </div>
        <label>
          <span>Pergunta</span>
          <textarea rows={2} value={frente} onChange={(e) => setFrente(e.target.value)} placeholder="O que queres que ela te pergunte?" autoFocus={!frente} />
        </label>
        <label>
          <span>Resposta</span>
          <textarea rows={4} value={tras} onChange={(e) => setTras(e.target.value)} />
        </label>
        {estado === 'erro' && <p className="er-folha-fc__erro" role="alert">Não consegui guardar. Tenta outra vez.</p>}
        <div className="er-folha-fc__botoes">
          <button type="button" className="er-folha-fc__cancelar" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="er-folha-fc__guardar" onClick={guardar} disabled={estado === 'a-guardar' || !frente.trim() || !tras.trim()}>
            {estado === 'a-guardar' ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
