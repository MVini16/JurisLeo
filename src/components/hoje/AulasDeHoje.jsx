// as aulas de hoje no dashboard, com marcação rápida (fui / faltei); o resto das opções fica no calendário
import { useNavigate } from 'react-router-dom';
import { useCalendario } from '../../hooks/useCalendario.js';
import { usePresencas } from '../../hooks/usePresencas.js';
import { chaveAula, jaPodeMarcar } from '../../services/presencas.js';
import { nomeCurtoCadeira } from '../../data/dadosLeonor.js';
import { EtiquetaAula } from '../calendario/MarcarAula.jsx';
import './AulasDeHoje.css';

function mesmoDia(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export default function AulasDeHoje() {
  const navigate = useNavigate();
  const { eventos } = useCalendario();
  const { marcas, carregado, marcar } = usePresencas();
  const hoje = new Date();

  const aulas = eventos
    .filter((ev) => ev.tipo === 'aula' && ev.cadeira && ev.data instanceof Date && mesmoDia(ev.data, hoje))
    .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));

  if (aulas.length === 0) return null;

  return (
    <section className="aulas-hoje" aria-label="Aulas de hoje">
      <h2 className="aulas-hoje__titulo">Aulas de hoje</h2>
      <ul className="aulas-hoje__lista">
        {aulas.map((ev) => {
          const marca = marcas[chaveAula(ev)];
          const podeMarcar = carregado && jaPodeMarcar(ev, hoje);
          return (
            <li key={ev.id} className="aulas-hoje__item">
              <div className="aulas-hoje__info">
                <b>{ev.horaInicio}</b>
                <span>{nomeCurtoCadeira(ev.cadeira)} · {ev.titulo.split('·')[1]?.trim() || 'Aula'}</span>
                <EtiquetaAula marca={marca} />
              </div>
              {!marca && podeMarcar && (
                <div className="aulas-hoje__botoes">
                  <button type="button" onClick={() => marcar(ev, { estado: 'presente' })}>Fui</button>
                  <button type="button" onClick={() => marcar(ev, { estado: 'faltei' })}>Faltei</button>
                  <button type="button" className="aulas-hoje__mais" onClick={() => navigate('/calendario')}>Mais</button>
                </div>
              )}
              {marca && <button type="button" className="aulas-hoje__mais" onClick={() => navigate('/calendario')}>Alterar</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
