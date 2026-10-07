// o ecrã "já chegaste": reconhece o que ela fez hoje e deixa-a decidir se continua ou pára
import Icone from '../icones/Icone.jsx';
import './FimDaMeta.css';

export default function FimDaMeta({ respondidas, serie, onMais, onDia, onSair }) {
  return (
    <div className="fim-meta" role="dialog" aria-modal="true" aria-label="Meta do dia cumprida">
      <div className="fim-meta__miolo">
        <div className="fim-meta__anel" aria-hidden="true"><Icone nome="sabia" tamanho={54} ativo /></div>
        <h2>Já chegaste, Leonor</h2>
        <p>Meta de hoje cumprida: {respondidas} cartas respondidas.</p>
        <div className="fim-meta__mini">
          <span><Icone nome="chama" tamanho={18} viva /> {serie} {serie === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="fim-meta__bt">
          <button type="button" className="p" onClick={onMais}>Mais cinco cartas</button>
          <button type="button" onClick={onDia}>Ver o meu dia</button>
          <button type="button" onClick={onSair}>Ficar por aqui</button>
        </div>
      </div>
    </div>
  );
}
