// banner que aparece só na primeira visita a um ecrã, depois nunca mais
import { useDicaPrimeiraVez } from '../hooks/useDicaPrimeiraVez.js';
import './DicaPrimeiraVez.css';

export default function DicaPrimeiraVez({ chave, titulo, texto }) {
  const { vista, marcarVista } = useDicaPrimeiraVez(chave);

  // só mostra quando sabemos ao certo que ainda não foi vista — nunca antes disso
  if (!chave || vista !== false) return null;

  return (
    <div className="dica-primeira-vez">
      <div className="dica-primeira-vez__corpo">
        <strong className="dica-primeira-vez__titulo">{titulo}</strong>
        <p className="dica-primeira-vez__texto">{texto}</p>
      </div>
      <button className="dica-primeira-vez__fechar" onClick={marcarVista}>Entendi</button>
    </div>
  );
}
