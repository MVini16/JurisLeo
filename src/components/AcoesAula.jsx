// folha de ações de uma aula: estado (fui, faltei...), sumário, anotação e ver a cadeira
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSumario } from '../hooks/useSumario.js';
import { getCadeira } from '../data/dadosLeonor.js';
import { dataCurta } from '../services/datas.js';
import BotoesEstadoAula from './BotoesEstadoAula.jsx';
import './AcoesAula.css';

export default function AcoesAula({ ocorrencia, onMarcar, onFechar }) {
  const navigate = useNavigate();
  const cadeira = getCadeira(ocorrencia.cadeira);
  const [erro, setErro] = useState('');
  const [aMarcar, setAMarcar] = useState(false);

  async function marcar(estado) {
    setErro('');
    setAMarcar(true);
    try {
      await onMarcar(ocorrencia, estado);
    } catch {
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
    setAMarcar(false);
  }

  return (
    <div className="acoes-aula-overlay" onClick={onFechar}>
      <div className="acoes-aula" role="dialog" aria-modal="true" aria-label="Ações da aula" onClick={(e) => e.stopPropagation()}>
        <div className="acoes-aula__handle" />

        <div className="acoes-aula__cabecalho" style={{ '--cor': cadeira?.cor }}>
          <span className="acoes-aula__abrev">{cadeira?.abrev || ocorrencia.titulo}</span>
          <span className="acoes-aula__tipo">{ocorrencia.tipoAula === 'pratica' ? 'Prática' : 'Teórica'}</span>
        </div>
        <p className="acoes-aula__quando">
          {dataCurta(ocorrencia.data)} · {ocorrencia.horaInicio}–{ocorrencia.horaFim}
          {ocorrencia.sala ? ` · ${ocorrencia.sala}` : ''}
          {ocorrencia.docente ? ` · ${ocorrencia.docente}` : ''}
        </p>

        <p className="acoes-aula__label">Como correu?</p>
        <BotoesEstadoAula estado={ocorrencia.estadoAula} onEscolher={marcar} desativados={aMarcar} />
        {ocorrencia.tipoAula === 'pratica' && (
          <p className="acoes-aula__nota">Só as faltas às aulas práticas contam para o limite.</p>
        )}
        {erro && <p className="acoes-aula__erro" role="alert">{erro}</p>}

        <SumarioRapido ocorrencia={ocorrencia} />

        <div className="acoes-aula__links">
          <button className="acoes-aula__link" onClick={() => navigate('/anotacoes/nova', { state: { cadeiraId: ocorrencia.cadeira } })}>
            📝 Criar anotação desta aula
          </button>
          <button className="acoes-aula__link" onClick={() => navigate(`/cadeiras/${ocorrencia.cadeira}`)}>
            📚 Ver a cadeira
          </button>
        </div>

        <button className="acoes-aula__fechar" onClick={onFechar}>Fechar</button>
      </div>
    </div>
  );
}

// três pontos no fim da aula, que ficam guardados por data
function SumarioRapido({ ocorrencia }) {
  const { sumario, guardar, carregado } = useSumario(ocorrencia);
  const [aberto, setAberto] = useState(false);

  return (
    <div className="sumario">
      <button className="sumario__toggle" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>
        ✍️ {sumario?.bullets?.length ? `Sumário (${sumario.bullets.length})` : 'Escrever o sumário'}
      </button>
      {/* o formulário só abre depois de o sumário guardado chegar: antes, remontava
          quando os dados chegavam e deitava fora o que ela já tinha escrito */}
      {aberto && !carregado && <p className="sumario__lista">A carregar…</p>}
      {aberto && carregado && (
        <FormSumario
          inicial={sumario?.bullets || []}
          onGuardar={async (b) => { await guardar(b); setAberto(false); }}
        />
      )}
      {!aberto && sumario?.bullets?.length > 0 && (
        <ul className="sumario__lista">
          {sumario.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

function FormSumario({ inicial, onGuardar }) {
  const [pontos, setPontos] = useState(() => [inicial[0] || '', inicial[1] || '', inicial[2] || '']);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState('');

  async function guardar() {
    setGuardando(true);
    setErro('');
    try {
      await onGuardar(pontos);
    } catch {
      setGuardando(false);
      setErro('Não consegui guardar agora. Tenta outra vez daqui a pouco.');
    }
  }

  return (
    <div className="sumario__form">
      {pontos.map((p, i) => (
        <input
          key={i}
          className="sumario__input"
          value={p}
          placeholder={`O que deram — ponto ${i + 1}`}
          aria-label={`Ponto ${i + 1} do sumário`}
          onChange={(e) => setPontos((atual) => atual.map((x, j) => (j === i ? e.target.value : x)))}
        />
      ))}
      {erro && <p className="acoes-aula__erro" role="alert">{erro}</p>}
      <button className="sumario__guardar" onClick={guardar} disabled={guardando}>
        {guardando ? 'A guardar...' : 'Guardar sumário'}
      </button>
    </div>
  );
}
