// modal para lançar uma nota: escolhe a cadeira, o elemento e o valor
// mostra logo o que essa nota significa segundo o motor, antes de guardar
import { useState } from 'react';
import { camposLancaveis, estadoDaCadeira, lerNota, pesosDaCadeira } from '../services/notas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import './ModalLancarNota.css';

export default function ModalLancarNota({ cadeiras, avaliacoes, cadeiraInicial, onFechar, onGuardar }) {
  const [cadeiraId, setCadeiraId] = useState(cadeiraInicial || cadeiras[0]?.id || '');
  const [campo, setCampo] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cadeira = cadeiras.find((c) => c.id === cadeiraId);
  const campos = cadeira ? camposLancaveis(cadeira.metodo) : [];
  const dadosAtuais = avaliacoes[cadeiraId] || {};

  // pré-visualização: o resultado se esta nota fosse guardada
  const leitura = lerNota(valor);
  let previsao = null;
  if (cadeira && campo && valor !== '' && leitura.ok) {
    const pesos = pesosDaCadeira(cadeira, getCadeira(cadeira.id));
    previsao = estadoDaCadeira({ metodo: cadeira.metodo, avaliacaoDados: { ...dadosAtuais, [campo]: leitura.valor }, pesos }).resultado;
  }

  function escolherCadeira(id) {
    setCadeiraId(id);
    setCampo('');
    setValor('');
    setErro('');
  }

  function escolherCampo(id) {
    setCampo(id);
    setValor(dadosAtuais[id] != null ? String(dadosAtuais[id]) : '');
    setErro('');
  }

  async function guardar() {
    if (!cadeira || !campo) {
      setErro('Escolhe a cadeira e o que queres lançar.');
      return;
    }
    const nota = lerNota(valor);
    if (!nota.ok) {
      setErro('A nota tem de ser um número inteiro entre 0 e 20.');
      return;
    }
    setErro('');
    setGuardando(true);
    try {
      await onGuardar({ cadeira, campo, valor: nota.valor });
    } catch {
      setGuardando(false);
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
  }

  return (
    <div className="lancar-overlay" onClick={onFechar}>
      <div className="lancar-modal" role="dialog" aria-modal="true" aria-label="Lançar nota" onClick={(e) => e.stopPropagation()}>
        <div className="lancar-handle" />
        <h2 className="lancar-titulo">Lançar nota</h2>

        <p className="lancar-label">Cadeira</p>
        <div className="lancar-opcoes">
          {cadeiras.map((c) => (
            <button
              key={c.id}
              className={`lancar-chip ${c.id === cadeiraId ? 'ativo' : ''}`}
              style={{ '--cor': c.cor }}
              onClick={() => escolherCadeira(c.id)}
            >
              {c.abrev}
            </button>
          ))}
        </div>

        <p className="lancar-label">O que vais lançar?</p>
        <div className="lancar-opcoes">
          {campos.map((c) => (
            <button key={c.id} className={`lancar-chip ${c.id === campo ? 'ativo' : ''}`} onClick={() => escolherCampo(c.id)}>
              {c.rotulo}
            </button>
          ))}
        </div>

        {campo && (
          <>
            <label className="lancar-label" htmlFor="lancar-valor">Nota (0 a 20)</label>
            <input
              id="lancar-valor"
              className="lancar-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={valor}
              onChange={(e) => { setValor(e.target.value); setErro(''); }}
              placeholder="—"
              autoFocus
            />
          </>
        )}

        {previsao && (
          <p className="lancar-previsao">{previsao.explicacao}</p>
        )}

        {erro && <p className="lancar-erro" role="alert">{erro}</p>}

        <div className="lancar-botoes">
          <button className="lancar-btn lancar-btn--sec" onClick={onFechar}>Cancelar</button>
          <button className="lancar-btn lancar-btn--pri" onClick={guardar} disabled={guardando || !campo}>
            {guardando ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
