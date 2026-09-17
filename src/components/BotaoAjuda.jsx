// botão de ajuda sempre disponível — explica a página actual e o que cada botão faz
import { useState } from 'react';
import './BotaoAjuda.css';

export default function BotaoAjuda({ titulo, texto, pontos }) {
  const [aberto, setAberto] = useState(false);
  if (!titulo) return null;

  return (
    <>
      <button className="botao-ajuda" onClick={() => setAberto(true)} aria-label="Ajuda desta página">
        ?
      </button>

      {aberto && (
        <div className="botao-ajuda__overlay" onClick={() => setAberto(false)}>
          <div className="botao-ajuda__modal" onClick={(e) => e.stopPropagation()}>
            <button className="botao-ajuda__fechar" onClick={() => setAberto(false)} aria-label="Fechar">✕</button>
            <h3 className="botao-ajuda__titulo">{titulo}</h3>
            <p className="botao-ajuda__texto">{texto}</p>
            {pontos?.length > 0 && (
              <ul className="botao-ajuda__lista">
                {pontos.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
