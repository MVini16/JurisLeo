// estado vazio que ensina — nunca "sem resultados", sempre o que fazer a seguir
import './EstadoVazio.css';

export default function EstadoVazio({ icone = '📭', titulo, texto, acao }) {
  return (
    <div className="estado-vazio">
      <span className="estado-vazio__icone" aria-hidden="true">{icone}</span>
      <p className="estado-vazio__titulo">{titulo}</p>
      {texto && <p className="estado-vazio__texto">{texto}</p>}
      {acao && (
        <button className="estado-vazio__acao" onClick={acao.fn}>{acao.texto}</button>
      )}
    </div>
  );
}
