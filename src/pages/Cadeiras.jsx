// lista das cadeiras do semestre
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCadeiras } from '../hooks/useCadeiras.js';
import { useCadeira } from '../hooks/useCadeira.js';
import { estadoDaCadeira, pesosDaCadeira } from '../services/notas.js';
import { estadoFaltas } from '../services/faltas.js';
import { useAulasSemanais } from '../hooks/useAulasSemanais.js';
import { gerarOcorrencias, proximaAula } from '../services/ocorrencias.js';
import { dataNatural } from '../services/datas.js';
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
  const { aulas } = useAulasSemanais();
  const navigate = useNavigate();

  return (
    <div className={`cadeiras-pagina ${darkMode ? 'dark' : ''}`}>
      <header className="cadeiras-header">
        <div>
          <h1 className="cadeiras-titulo">Cadeiras</h1>
          <span className="cadeiras-subtitulo">1.º semestre · Turma A</span>
        </div>
        <button className="cadeiras-btn-imprimir no-print" onClick={() => window.print()}>🖨️ Imprimir</button>
      </header>

      {loading && <p className="cadeiras-loading">A carregar cadeiras...</p>}

      {!loading && cadeiras.length === 0 && (
        <div className="cadeiras-vazio">
          <p>Ainda não há cadeiras registadas.</p>
        </div>
      )}

      <div className="cadeiras-grid">
        {cadeiras.map((cadeira) => (
          <CartaoCadeira key={cadeira.id} cadeira={cadeira} aulas={aulas} onClick={() => navigate(`/cadeiras/${cadeira.id}`)} />
        ))}
      </div>

      <section className="cadeiras-recursos">
        <div className="cadeiras-atalhos no-print">
          <button className="cadeiras-atalho" onClick={() => navigate('/notas')}>📊 Notas</button>
          <button className="cadeiras-atalho" onClick={() => navigate('/faltas')}>📋 Faltas</button>
        </div>
        <h2 className="cadeiras-recursos__titulo">Recursos</h2>
        <div className="cadeiras-recursos__grid">
          <button className="cadeiras-recurso" onClick={() => navigate('/glossario')}>
            <span className="cadeiras-recurso__icon">📚</span>
            <span>Glossário</span>
          </button>
          <button className="cadeiras-recurso" onClick={() => navigate('/artigos')}>
            <span className="cadeiras-recurso__icon">⚖️</span>
            <span>Artigos</span>
          </button>
          <button className="cadeiras-recurso" onClick={() => navigate('/leituras')}>
            <span className="cadeiras-recurso__icon">📖</span>
            <span>Leituras</span>
          </button>
          <button className="cadeiras-recurso" onClick={() => navigate('/pesquisa')}>
            <span className="cadeiras-recurso__icon">🔍</span>
            <span>Pesquisa</span>
          </button>
          <button className="cadeiras-recurso" onClick={() => navigate('/flashcards')}>
            <span className="cadeiras-recurso__icon">🗂️</span>
            <span>Flashcards</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function CartaoCadeira({ cadeira, aulas, onClick }) {
  const { faltasDados, avaliacaoDados } = useCadeira(cadeira.id);
  const proxima = proximaAula(aulas.filter((a) => a.cadeira === cadeira.id).flatMap((a) => gerarOcorrencias(a)));
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

  const avaliacao = avaliacaoDados
    ? estadoDaCadeira({ metodo: cadeira.metodo, avaliacaoDados, pesos: pesosDaCadeira(cadeira, infoBase) }).resultado
    : null;

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
        {proxima && (
          <p className="cartao-cadeira__proxima">
            Próxima aula: {dataNatural(proxima.data)} · {proxima.horaInicio}{proxima.sala ? ` · ${proxima.sala}` : ''}
          </p>
        )}

        <div className="cartao-cadeira__rodape">
          {avaliacao && (
            <span className={`chip chip--${avaliacao.estado}`}>{ROTULO_ESTADO[avaliacao.estado] || avaliacao.estado}</span>
          )}
          {faltas && (
            <span className={`chip-semaforo chip-semaforo--${faltas.semaforo}`}>
              {faltas.excluidaConfirmada ? 'Excluída' : `${faltas.faltasRestantesSemestre} falta${faltas.faltasRestantesSemestre === 1 ? '' : 's'} até ao limite`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
