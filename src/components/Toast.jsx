// aviso curto no fundo do ecrã, com "desfazer" opcional
import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ mensagem, acao, duracao = 5000, onFechar }) {
  useEffect(() => {
    const t = setTimeout(onFechar, duracao);
    return () => clearTimeout(t);
  }, [duracao, onFechar]);

  return (
    <div className="toast no-print" role="status" aria-live="polite">
      <span className="toast__texto">{mensagem}</span>
      {acao && (
        <button className="toast__acao" onClick={() => { acao.fn(); onFechar(); }}>{acao.texto}</button>
      )}
    </div>
  );
}
