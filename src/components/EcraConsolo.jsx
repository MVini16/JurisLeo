// consolo: sem números grandes, sem vermelho agressivo — só apoio e o próximo passo
import './EcraConsolo.css';

export default function EcraConsolo({ proximoPasso, mensagem, onFechar }) {
  return (
    <div className="ecra-consolo-overlay" onClick={onFechar}>
      <div className="ecra-consolo-card" onClick={(e) => e.stopPropagation()}>
        <p className="ecra-consolo-mensagem">{mensagem}</p>
        {proximoPasso && <p className="ecra-consolo-proximo">{proximoPasso}</p>}
        <button className="ecra-consolo-btn" onClick={onFechar}>Continuar</button>
      </div>
    </div>
  );
}
