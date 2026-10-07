// mensagem do vini a aparecer por cima da página enquanto a leonor escreve —
// três formatos: balão de conversa, despacho com selo e post-it
import { useEffect } from 'react';
import './ProvocacaoVini.css';

const DURACAO_MS = 9000;

export default function ProvocacaoVini({ formato, mensagem, onTerminar }) {
  useEffect(() => {
    const t = setTimeout(onTerminar, DURACAO_MS);
    return () => clearTimeout(t);
  }, [onTerminar]);

  return (
    <div className="provocacao-area" onClick={onTerminar} role="status" aria-live="polite">
      {formato === 'balao' && (
        <div className="provocacao-balao">
          <div className="provocacao-avatar">V</div>
          <div className="provocacao-balao__corpo">
            <b>Vini</b>
            <p>{mensagem.texto}</p>
          </div>
        </div>
      )}

      {formato === 'despacho' && (
        <div className="provocacao-despacho">
          <span className="provocacao-despacho__tipo">{mensagem.tipo}</span>
          <p>{mensagem.texto}</p>
          <span className="provocacao-despacho__ass">O Meritíssimo Vini</span>
          <span className="provocacao-despacho__selo">{mensagem.selo}</span>
        </div>
      )}

      {formato === 'postit' && (
        <div className="provocacao-postit">
          <p>{mensagem.texto}</p>
          <small>do Vini, com carinho</small>
        </div>
      )}
    </div>
  );
}
