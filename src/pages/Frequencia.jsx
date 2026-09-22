// modo frequência — ecrã cheio, sem navbar: a cadeira mais próxima, dias
// restantes e a checklist da matéria dada (sumários de aula), e nada mais
import { useTheme } from '../context/useTheme.js';
import { useCalendario } from '../hooks/useCalendario.js';
import { useSumariosCadeira } from '../hooks/useSumariosCadeira.js';
import { useRevisaoFrequencia } from '../hooks/useRevisaoFrequencia.js';
import { proximaFrequencia, diasRestantes, dataLimiteMateria, materiaAteData } from '../services/frequencia.js';
import { getCadeira } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import './Frequencia.css';

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

export default function Frequencia() {
  const { darkMode } = useTheme();
  const { eventos, loading } = useCalendario();

  if (loading) return <div className="frequencia-pagina"><p className="frequencia-vazio">A carregar...</p></div>;

  const frequencia = proximaFrequencia(eventos);

  return (
    <div className={`frequencia-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/dashboard" />
      {frequencia ? <ConteudoFrequencia frequencia={frequencia} /> : <SemFrequencia />}
    </div>
  );
}

function SemFrequencia() {
  return (
    <div className="frequencia-vazio-estado">
      <h1 className="frequencia-titulo">Sem frequência marcada</h1>
      <p className="frequencia-vazio">Marca a data no Calendário (tipo "Frequência") para o modo frequência mostrar a cadeira mais próxima e a matéria dada.</p>
    </div>
  );
}

function ConteudoFrequencia({ frequencia }) {
  const cadeira = getCadeira(frequencia.cadeira);
  const dias = diasRestantes(frequencia.data);
  const limite = dataLimiteMateria(frequencia.data);
  const { sumarios } = useSumariosCadeira(frequencia.cadeira);
  const { marcados, alternar } = useRevisaoFrequencia(frequencia.cadeira);
  const pontos = materiaAteData(sumarios, frequencia.cadeira, limite);
  const revistos = pontos.filter((p) => marcados.includes(p.chave)).length;

  const cor = cadeira?.cor || 'var(--burgundy)';

  return (
    <div className="frequencia-conteudo" style={{ '--cor': cor }}>
      <p className="frequencia-cadeira">{cadeira?.nome || frequencia.cadeira}</p>

      <p className="frequencia-dias">{dias}</p>
      <p className="frequencia-dias-label">{dias === 1 ? 'dia até à frequência' : 'dias até à frequência'}</p>
      <p className="frequencia-data">{frequencia.data.getDate()} de {MESES[frequencia.data.getMonth()]}</p>

      <div className="frequencia-checklist">
        <div className="frequencia-checklist__header">
          <h2 className="frequencia-checklist__titulo">Matéria até {limite.getDate()} de {MESES[limite.getMonth()]}</h2>
          {pontos.length > 0 && <span className="frequencia-checklist__progresso">{revistos} de {pontos.length}</span>}
        </div>

        {pontos.length === 0 && (
          <p className="frequencia-vazio">Ainda não há sumários registados para esta cadeira. Vai ao Horário e regista o que deu em cada aula, para a matéria aparecer aqui.</p>
        )}

        {pontos.map((ponto) => (
          <button
            key={ponto.chave}
            className={`frequencia-ponto ${marcados.includes(ponto.chave) ? 'revisto' : ''}`}
            onClick={() => alternar(ponto.chave)}
          >
            <span className="frequencia-ponto__check">{marcados.includes(ponto.chave) ? '✓' : ''}</span>
            <span className="frequencia-ponto__texto">{ponto.texto}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
