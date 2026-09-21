// todas as ferramentas que ela tem ligadas, por grupo
import { Link } from 'react-router-dom';
import { MODULOS, GRUPOS_FERRAMENTAS } from '../data/modulos.js';
import { useModulos } from '../hooks/useModulos.js';
import { useFichas } from '../hooks/useFichas.js';
import { contactosParaFalar } from '../services/fichas.js';
import './Ferramentas.css';

export default function Ferramentas() {
  const { ativos } = useModulos();
  const { fichas: contactos } = useFichas('contactos');
  const paraFalar = contactosParaFalar(contactos.map((c) => ({ ...c, tipo: 'contactos' })));
  const ferramentas = MODULOS.filter((m) => m.categoria === 'ferramentas' && ativos[m.id]);

  return (
    <div className="fx-pagina">
      <header className="fx-cabecalho">
        <div>
          <h1 className="fx-titulo">Ferramentas</h1>
          <p className="fx-sub">Tudo o que tens ligado para estudar e para a vida de advogada.</p>
        </div>
        <Link className="fx-botao" to="/definicoes">Escolher</Link>
      </header>

      {paraFalar.length > 0 && (
        <Link className="fx-lembrete" to="/fichas/contactos">
          {paraFalar.length === 1 ? 'Tens 1 pessoa' : `Tens ${paraFalar.length} pessoas`} com quem voltar a falar: {paraFalar.slice(0, 2).map((c) => c.titulo).join(', ')}{paraFalar.length > 2 ? '...' : ''}
        </Link>
      )}

      {ferramentas.length === 0 && <p className="fx-vazio">Não tens ferramentas ligadas. Liga as que quiseres em Definições.</p>}

      {GRUPOS_FERRAMENTAS.map((grupo) => {
        const doGrupo = ferramentas.filter((m) => m.grupo === grupo);
        if (!doGrupo.length) return null;
        return (
          <section key={grupo} className="fx-grupo">
            <h2 className="fx-grupo__titulo">{grupo}</h2>
            <ul className="fx-grelha">
              {doGrupo.map((m) => (
                <li key={m.id}>
                  <Link className="fx-ferramenta" to={m.rota}>
                    <b>{m.nome}</b>
                    <span>{m.descricao}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
