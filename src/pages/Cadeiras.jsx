// lista das cadeiras do semestre
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCadeiras } from '../hooks/useCadeiras.js';
import { useCadeira } from '../hooks/useCadeira.js';
import { avaliarCadeira, calcularNotaAC } from '../services/avaliacao.js';
import { estadoFaltas } from '../services/faltas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import './Cadeiras.css';

const ROTULO_ESTADO = {
  aprovada: 'Aprovada',
  admitidaEscrito: 'Vai a escrito',
  admitidaOral: 'Vai a oral',
  excluida: 'Excluída',
  passaMetodoB: 'Método B',
  semDados: 'Sem notas ainda',
};

export default function Cadeiras() {
  const { darkMode } = useTheme();
  const { cadeiras, loading } = useCadeiras();
  const navigate = useNavigate();

  return (
    <div className={`cadeiras-pagina ${darkMode ? 'dark' : ''}`}>
      <header className="cadeiras-header">
        <h1 className="cadeiras-titulo">Cadeiras</h1>
        <span className="cadeiras-subtitulo">1.º semestre · Turma A</span>
      </header>

      {loading && <p className="cadeiras-loading">A carregar cadeiras...</p>}

      {!loading && cadeiras.length === 0 && (
        <div className="cadeiras-vazio">
          <p>Ainda não há cadeiras registadas.</p>
        </div>
      )}

      <div className="cadeiras-grid">
        {cadeiras.map((cadeira) => (
          <CartaoCadeira key={cadeira.id} cadeira={cadeira} onClick={() => navigate(`/cadeiras/${cadeira.id}`)} />
        ))}
      </div>
    </div>
  );
}

function CartaoCadeira({ cadeira, onClick }) {
  const { faltasDados, avaliacaoDados } = useCadeira(cadeira.id);
  const infoBase = getCadeira(cadeira.id);
  const cor = cadeira.cor || '#b8963e';

  let faltas = null;
  if (faltasDados && cadeira.aulasPraticasPrevistas) {
    faltas = estadoFaltas({
      aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas,
      aulasPraticasLecionadas: faltasDados.aulasPraticasLecionadas || 0,
      faltasInjustificadas: faltasDados.faltasInjustificadas || 0,
      faltasJustificadas: faltasDados.faltasJustificadas || 0,
    });
  }

  let avaliacao = null;
  if (avaliacaoDados) {
    const pesos = infoBase?.pesos || { provaEscrita: 0.5, outrosElementos: 0.5 };
    const notaAC = avaliacaoDados.provaEscrita != null && avaliacaoDados.outrosElementos != null
      ? calcularNotaAC({ provaEscrita: avaliacaoDados.provaEscrita, outrosElementos: avaliacaoDados.outrosElementos, pesos })
      : null;
    avaliacao = avaliarCadeira({
      metodo: cadeira.metodo,
      notaAC,
      exameEscrito: avaliacaoDados.exameEscrito,
      exameOral: avaliacaoDados.exameOral,
      exameRecurso: avaliacaoDados.exameRecurso,
      melhoriaOral: avaliacaoDados.melhoriaOral,
    });
  }

  return (
    <button className="cartao-cadeira" style={{ '--cor': cor }} onClick={onClick}>
      <div className="cartao-cadeira__barra" style={{ background: cor }} />
      <div className="cartao-cadeira__corpo">
        <div className="cartao-cadeira__topo">
          <span className="cartao-cadeira__abrev" style={{ color: cor }}>{cadeira.abrev}</span>
          {cadeira.optativa && <span className="cartao-cadeira__tag">Optativa</span>}
        </div>
        <h2 className="cartao-cadeira__nome">{cadeira.nome}</h2>
        <p className="cartao-cadeira__regente">{cadeira.regente}</p>

        <div className="cartao-cadeira__rodape">
          {avaliacao && (
            <span className={`chip chip--${avaliacao.estado}`}>{ROTULO_ESTADO[avaliacao.estado] || avaliacao.estado}</span>
          )}
          {faltas && (
            <span className={`chip-semaforo chip-semaforo--${faltas.semaforo}`}>
              {faltas.excluida ? 'Excluída' : `${faltas.faltasRestantes} falta${faltas.faltasRestantes === 1 ? '' : 's'} até ao limite`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
