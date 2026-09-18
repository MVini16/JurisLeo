// semáforo de faltas de uma cadeira, com os dois números lado a lado:
// o que ainda pode dar até ao fim do semestre, e a proporção que já tem sobre as aulas dadas
import './SemaforoFaltas.css';

const ROTULO_SEMAFORO = { verde: 'Tranquila', amarelo: 'Atenção', vermelho: 'No limite' };

export default function SemaforoFaltas({ estado, lecionadas, previstas }) {
  const { semaforo, excluidaConfirmada, faltasRestantesSemestre, percentagemAtual } = estado;

  return (
    <div className={`semaforo semaforo--${semaforo}`}>
      <div className="semaforo__topo">
        <span className="semaforo__luz" aria-hidden="true" />
        <span className="semaforo__rotulo">{excluidaConfirmada ? 'Excluída' : ROTULO_SEMAFORO[semaforo]}</span>
      </div>

      <div className="semaforo__numeros">
        <div className="semaforo__numero">
          <strong>{excluidaConfirmada ? '—' : faltasRestantesSemestre}</strong>
          <small>faltas que ainda podes dar até ao fim do semestre</small>
        </div>
        <div className="semaforo__numero semaforo__numero--sec">
          <strong>{percentagemAtual}%</strong>
          <small>das {lecionadas} aulas já dadas (limite 25%)</small>
        </div>
      </div>

      <p className="semaforo__explicacao">{estado.explicacao}</p>
      {estado.aviso && <p className="semaforo__aviso">💡 {estado.aviso}</p>}
      {previstas > 0 && (
        <p className="semaforo__previstas">Contam as {previstas} aulas práticas previstas no semestre.</p>
      )}
    </div>
  );
}
