// a coleção de selos (máximas latinas) e as conquistas, num painel que sobe do fundo
import { useState } from 'react';
import { RARIDADES, SELOS } from '../../data/selos.js';
import { CONQUISTAS } from '../../services/jogosMeta.js';

export default function ColecaoSelos({ perfil, aoFechar }) {
  const [aba, setAba] = useState('selos');
  const [aberto, setAberto] = useState(null);
  const tem = new Set(perfil.selos);
  const conquistas = new Set(perfil.conquistas ?? []);
  const selo = SELOS.find((s) => s.id === aberto);

  return (
    <div className="jogos-fundo" onClick={aoFechar}>
      <div className="jogos-modal jogos-colecao" role="dialog" aria-modal="true" aria-label="Coleção" onClick={(e) => e.stopPropagation()}>
        <h2>A tua coleção</h2>
        <div className="jogos-modal__tipos" role="tablist">
          <button type="button" role="tab" aria-selected={aba === 'selos'} className={`jogos-chip ${aba === 'selos' ? 'ativo' : ''}`} onClick={() => setAba('selos')}>Selos {tem.size}/{SELOS.length}</button>
          <button type="button" role="tab" aria-selected={aba === 'conquistas'} className={`jogos-chip ${aba === 'conquistas' ? 'ativo' : ''}`} onClick={() => setAba('conquistas')}>Conquistas {conquistas.size}/{CONQUISTAS.length}</button>
        </div>

        {aba === 'selos' && (
          <>
            <p className="jogos-modal__nota">Cada jogo pode dar um selo novo. Os jogos perfeitos e os recordes aumentam a sorte.</p>
            <ul className="jogos-selos">
              {SELOS.map((s) => (
                <li key={s.id}>
                  <button type="button" className={`jogos-selo jogos-selo--${s.raridade}${tem.has(s.id) ? ' tem' : ''}`} onClick={() => tem.has(s.id) && setAberto(s.id === aberto ? null : s.id)} aria-label={tem.has(s.id) ? s.latim : `Selo ${RARIDADES[s.raridade].rotulo} por descobrir`}>
                    {tem.has(s.id) ? s.latim : '?'}
                  </button>
                </li>
              ))}
            </ul>
            {selo && (
              <p className="jogos-selo-detalhe" role="status"><b>{selo.latim}</b>{selo.significado}</p>
            )}
          </>
        )}

        {aba === 'conquistas' && (
          <ul className="jogos-conquistas">
            {CONQUISTAS.map((c) => (
              <li key={c.id} className={conquistas.has(c.id) ? 'tem' : ''}>
                <b>{c.nome}</b>
                <small>{c.descricao}</small>
              </li>
            ))}
          </ul>
        )}

        <div className="jogos-modal__botoes"><button type="button" className="jogos-botao" onClick={aoFechar}>Fechar</button></div>
      </div>
    </div>
  );
}
