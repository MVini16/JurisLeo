// as três ferramentas de uma nota aberta: barra de procura, painel do índice e a folha "criar flashcard".
// cada uma é um componente pequeno que o editor mostra consoante o que ela escolheu
import { useEffect, useRef, useState } from 'react';
import { cadeirasS1 } from '../../data/dadosLeonor.js';
import { prepararFlashcard } from '../../services/notaFerramentas.js';
import { criarFlashcard } from '../../services/flashcards.js';

// a pílula que fica a flutuar depois de escolher um resultado: anda para a frente e para trás nas ocorrências
export function BarraProcura({ termo, total, atual, aoAvancar, aoFechar, aoReabrir }) {
  return (
    <div className="er-procura er-procura--flutua" role="search">
      <button type="button" className="er-procura__termo" onClick={aoReabrir} aria-label="Alterar a procura">{termo}</button>
      <span className="er-procura__contagem" aria-live="polite">{total === 0 ? 'Nada encontrado' : `${atual + 1} de ${total}`}</span>
      <button type="button" className="er-btn" onClick={() => aoAvancar(-1)} disabled={total === 0} aria-label="Anterior">↑</button>
      <button type="button" className="er-btn" onClick={() => aoAvancar(1)} disabled={total === 0} aria-label="Seguinte">↓</button>
      <button type="button" className="er-btn" onClick={aoFechar} aria-label="Fechar a procura">✕</button>
    </div>
  );
}

// a procura ao centro, à maneira de um spotlight: escreve-se, vê-se a lista de frases e escolhe-se uma
export function PesquisaSpotlight({ termo, resultados, aoMudar, aoEscolher, aoFechar }) {
  const campo = useRef(null);
  const [foco, setFoco] = useState(0);
  useEffect(() => { campo.current?.focus(); }, []);
  const ativo = Math.min(foco, Math.max(0, resultados.length - 1));

  const aoTeclar = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); aoFechar(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setFoco(Math.min(ativo + 1, resultados.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFoco(Math.max(ativo - 1, 0)); }
    else if (e.key === 'Enter' && resultados.length > 0) { e.preventDefault(); aoEscolher(ativo); }
  };

  return (
    <div className="er-spot" onClick={aoFechar}>
      <div className="er-spot__caixa" role="dialog" aria-modal="true" aria-label="Procurar nesta nota" onClick={(e) => e.stopPropagation()}>
        <input
          ref={campo}
          type="search"
          className="er-spot__campo"
          placeholder="Procurar na nota..."
          value={termo}
          onChange={(e) => { setFoco(0); aoMudar(e.target.value); }}
          onKeyDown={aoTeclar}
          aria-label="Procurar nesta nota"
        />
        <p className="er-spot__contagem" aria-live="polite">
          {termo.trim() ? (resultados.length === 0 ? 'Nada encontrado' : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`) : 'Escreve uma palavra ou um artigo'}
        </p>
        <ul className="er-spot__lista">
          {resultados.map((r, i) => (
            <li key={i}>
              <button type="button" className={i === ativo ? 'ativo' : ''} onClick={() => aoEscolher(i)} onMouseEnter={() => setFoco(i)}>
                <span>{r.antes}<mark>{r.achado}</mark>{r.depois}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// o índice como uma fila de etiquetas no topo da folha: desliza-se e toca-se num título
export function ChipsIndice({ itens, aoIr, aoFechar }) {
  return (
    <nav className="er-chips" aria-label="Índice da nota">
      {itens.length === 0
        ? <span className="er-chips__vazio">Ainda não há títulos. Usa T1, T2 ou T3 no separador Parágrafo.</span>
        : itens.map((item, i) => (
          <button key={`${i}-${item.texto}`} type="button" className={`er-chip-indice nivel-${item.nivel}`} onClick={() => aoIr(i)}>{item.texto}</button>
        ))}
      <button type="button" className="er-chips__fechar" onClick={aoFechar} aria-label="Fechar o índice">✕</button>
    </nav>
  );
}

// a barrinha escura que aparece junto ao texto selecionado
export function MenuSelecao({ posicao, aoFlashcard, aoMarcar, aoCopiar }) {
  return (
    <div className="er-menusel" style={{ top: posicao.top, left: posicao.left }} role="toolbar" aria-label="Ações para o texto selecionado" onMouseDown={(e) => e.preventDefault()}>
      <button type="button" onClick={aoFlashcard}>Flashcard</button>
      <button type="button" onClick={aoMarcar}>Marcar</button>
      <button type="button" onClick={aoCopiar}>Copiar</button>
    </div>
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
