// criar uma pergunta para os jogos: escolha múltipla ou verdadeiro/falso. guarda-se como flashcard (mesma coleção)
import { useState } from 'react';
import { cadeirasS1 } from '../../data/dadosLeonor.js';
import { construirPerguntaDela } from '../../services/jogos.js';
import { criarFlashcard } from '../../services/flashcards.js';

export default function ModalPergunta({ cadeiraInicial, aoFechar, aoGuardada }) {
  const [tipo, setTipo] = useState('escolha');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1.some((c) => c.id === cadeiraInicial) ? cadeiraInicial : cadeirasS1[0].id);
  const [texto, setTexto] = useState('');
  const [certa, setCertas] = useState('');
  const [erradas, setErradas] = useState(['', '', '']);
  const [verdade, setVerdade] = useState(true);
  const [explicacao, setExplicacao] = useState('');
  const [erro, setErro] = useState('');
  const [aGuardar, setAGuardar] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    const r = construirPerguntaDela({ tipo, cadeiraId, texto, certa, erradas, verdade, explicacao });
    if (!r.ok) { setErro(r.erro); return; }
    setAGuardar(true);
    try {
      await criarFlashcard(r.dados);
      aoGuardada();
    } catch {
      setErro('Não consegui guardar. Tenta outra vez.');
      setAGuardar(false);
    }
  }

  return (
    <div className="jogos-fundo" onClick={aoFechar}>
      <form className="jogos-modal" role="dialog" aria-modal="true" aria-label="Criar pergunta" onClick={(e) => e.stopPropagation()} onSubmit={guardar}>
        <h2>Criar uma pergunta</h2>
        <p className="jogos-modal__nota">Fica também nos teus flashcards e aparece nos jogos quando escolheres "As minhas perguntas".</p>

        <div className="jogos-modal__tipos" role="radiogroup" aria-label="Tipo de pergunta">
          {[['escolha', 'Escolha múltipla'], ['vf', 'Verdadeiro ou falso']].map(([id, rotulo]) => (
            <button key={id} type="button" role="radio" aria-checked={tipo === id} className={`jogos-chip ${tipo === id ? 'ativo' : ''}`} onClick={() => setTipo(id)}>{rotulo}</button>
          ))}
        </div>
        <div className="jogos-modal__tipos">
          {cadeirasS1.map((c) => (
            <button key={c.id} type="button" className={`jogos-chip ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
          ))}
        </div>

        <label>
          <span>{tipo === 'vf' ? 'Afirmação' : 'Pergunta'}</span>
          <textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
        </label>

        {tipo === 'escolha' ? (
          <>
            <label><span>Resposta certa</span><input value={certa} onChange={(e) => setCertas(e.target.value)} /></label>
            {erradas.map((v, i) => (
              <label key={i}><span>Resposta errada {i + 1}</span><input value={v} onChange={(e) => setErradas((l) => l.map((x, j) => (j === i ? e.target.value : x)))} /></label>
            ))}
          </>
        ) : (
          <div className="jogos-modal__tipos" role="radiogroup" aria-label="A afirmação é">
            {[[true, 'Verdadeira'], [false, 'Falsa']].map(([v, rotulo]) => (
              <button key={String(v)} type="button" role="radio" aria-checked={verdade === v} className={`jogos-chip ${verdade === v ? 'ativo' : ''}`} onClick={() => setVerdade(v)}>{rotulo}</button>
            ))}
          </div>
        )}

        <label>
          <span>Explicação ou artigo (opcional)</span>
          <textarea rows={2} value={explicacao} onChange={(e) => setExplicacao(e.target.value)} placeholder="Ex.: art. 483.º do Código Civil" />
        </label>

        {erro && <p className="jogos-modal__erro" role="alert">{erro}</p>}
        <div className="jogos-modal__botoes">
          <button type="button" className="jogos-botao" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="jogos-botao jogos-botao--forte" disabled={aGuardar}>{aGuardar ? 'A guardar...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
