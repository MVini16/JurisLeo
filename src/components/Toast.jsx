// aviso curto no fundo do ecrã, com "desfazer" opcional
import { useEffect, useRef } from 'react';
import './Toast.css';

export default function Toast({ mensagem, acao, duracao = 5000, onFechar }) {
  // guarda o onFechar mais recente: se o pai passar uma função nova a cada render,
  // o temporizador não recomeça e o aviso fecha mesmo ao fim do tempo
  const fecharRef = useRef(onFechar);
  useEffect(() => { fecharRef.current = onFechar; });
  useEffect(() => {
    const t = setTimeout(() => fecharRef.current(), duracao);
    return () => clearTimeout(t);
  }, [duracao]);

  return (
    <div className="toast no-print" role="status" aria-live="polite">
      <span className="toast__texto">{mensagem}</span>
      {acao && (
        <button className="toast__acao" onClick={() => { acao.fn(); onFechar(); }}>{acao.texto}</button>
      )}
    </div>
  );
}
