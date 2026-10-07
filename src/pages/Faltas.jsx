// visão geral das faltas: estado de cada cadeira, simulador, comprovativos por entregar e histórico aula a aula
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCadeira } from '../hooks/useCadeira.js';
import { usePresencas } from '../hooks/usePresencas.js';
import { cadeirasS1, nomeCurtoCadeira } from '../data/dadosLeonor.js';
import { contarMarcas } from '../services/presencas.js';
import { historicoDeMarcas, comprovativosEmFalta, situacaoDaCadeira, simularFaltas, faltasAteExclusao, percentagemPresenca } from '../services/assiduidade.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import '../components/calendario/MarcarAula.css';
import './Faltas.css';

const RAIO = 30;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;
const TEXTO_SEMAFORO = { verde: 'Tranquila', amarelo: 'Atenção', vermelho: 'Em risco' };

function formatarData(aaaammdd) {
  if (!aaaammdd) return 'Sem data';
  const [a, m, d] = aaaammdd.split('-');
  return `${d}-${m}-${a}`;
}

export default function Faltas() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { porCadeira, carregado, atualizarMarca } = usePresencas();

  const pendentes = cadeirasS1.flatMap((c) => comprovativosEmFalta(porCadeira[c.id]).map((m) => ({ ...m, cadeiraId: c.id })));

  async function entregue(item) {
    const { chave, rotulo, cadeiraId, ...marca } = item;
    void rotulo;
    await atualizarMarca(cadeiraId, chave, { ...marca, comprovativo: true });
  }

  return (
    <div className={`faltas-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="faltas-header">
        <h1 className="faltas-titulo">Faltas</h1>
        <span className="faltas-subtitulo">1.º semestre · só contam as aulas práticas</span>
      </header>

      {!carregado && <p className="faltas-vazio">A carregar...</p>}

      {pendentes.length > 0 && (
        <section className="faltas-comprovativos" aria-label="Comprovativos por entregar">
          <h2>Comprovativos por entregar</h2>
          <p className="faltas-ajuda">Faltas justificadas em que ainda não disseste que entregaste o comprovativo. Confirma o prazo com o docente ou a secretaria.</p>
          <ul>
            {pendentes.map((p) => (
              <li key={`${p.cadeiraId}-${p.chave}`} className="faltas-comprovativo">
                <div>
                  <b>{nomeCurtoCadeira(p.cadeiraId)}</b> · {formatarData(p.data)}
                  <small>{p.motivo}</small>
                </div>
                <button type="button" onClick={() => entregue(p)}>Já entreguei</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="faltas-lista">
        {cadeirasS1.map((c, i) => (
          <CartaoCadeiraFaltas key={c.id} cadeiraBase={c} atraso={i * 70} onAbrirCalendario={(data) => navigate('/calendario', { state: { data } })} onAbrirCadeira={() => navigate(`/cadeiras/${c.id}`)} />
        ))}
      </div>
    </div>
  );
}

function CartaoCadeiraFaltas({ cadeiraBase, atraso, onAbrirCalendario, onAbrirCadeira }) {
  const { cadeira, faltasDados, marcasAulas, loading } = useCadeira(cadeiraBase.id);
  const [extra, setExtra] = useState(0);
  const [aberto, setAberto] = useState(false);

  if (loading || !cadeira) return <div className="faltas-cartao faltas-cartao--carregar" style={{ '--c': cadeiraBase.cor }}>{cadeiraBase.abrev}...</div>;

  const { efetivas, resultado } = situacaoDaCadeira(cadeira, faltasDados, marcasAulas);
  const contagem = contarMarcas(marcasAulas);
  const presenca = percentagemPresenca(contagem);
  const historico = historicoDeMarcas(marcasAulas);
  const simulado = extra > 0 ? simularFaltas(cadeira, efetivas, extra) : null;
  const margem = faltasAteExclusao(cadeira, efetivas);
  const ocupado = resultado ? Math.min(1, (efetivas.faltasInjustificadas + efetivas.faltasJustificadas) / Math.max(1, cadeira.aulasPraticasPrevistas / 2)) : 0;
  const semaforo = (simulado || resultado)?.semaforo || 'verde';

  return (
    <article className={`faltas-cartao faltas-cartao--${semaforo}`} style={{ '--c': cadeiraBase.cor, animationDelay: `${atraso}ms` }}>
      <header className="faltas-cartao__topo">
        <svg viewBox="0 0 72 72" className="faltas-anel" role="img" aria-label={`${Math.round(ocupado * 100)}% do limite total de faltas`}>
          <circle className="faltas-anel__fundo" cx="36" cy="36" r={RAIO} />
          <circle className="faltas-anel__valor" cx="36" cy="36" r={RAIO} strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - ocupado)} />
          <text x="36" y="41">{presenca === null ? '—' : `${presenca}%`}</text>
        </svg>
        <div>
          <h2>{cadeiraBase.nome}</h2>
          <span className={`faltas-selo faltas-selo--${semaforo}`}>{TEXTO_SEMAFORO[semaforo]}</span>
        </div>
      </header>

      <ul className="faltas-numeros">
        <li><b>{efetivas.aulasPraticasLecionadas}</b><small>aulas dadas</small></li>
        <li><b>{efetivas.faltasInjustificadas}</b><small>injustificadas</small></li>
        <li><b>{efetivas.faltasJustificadas}</b><small>justificadas</small></li>
        <li><b>{cadeira.aulasPraticasPrevistas ?? '—'}</b><small>previstas</small></li>
      </ul>

      {resultado && <p className="faltas-explicacao">{(simulado || resultado).explicacao}</p>}
      {resultado && margem !== null && !simulado && <p className="faltas-margem">{margem === 0 ? 'Já não podes faltar sem risco.' : `Aguentas mais ${margem} ${margem === 1 ? 'falta seguida' : 'faltas seguidas'} sem justificação.`}</p>}

      {resultado && (
        <div className="faltas-simulador">
          <label htmlFor={`sim-${cadeiraBase.id}`}>E se faltasse a mais <b>{extra}</b> {extra === 1 ? 'aula' : 'aulas'} sem justificação?</label>
          <input id={`sim-${cadeiraBase.id}`} type="range" min="0" max="10" step="1" value={extra} onChange={(e) => setExtra(Number(e.target.value))} />
          {simulado && <p className={`faltas-simulador__res faltas-simulador__res--${simulado.semaforo}`}>{simulado.excluida ? 'Ficavas excluída.' : `Ficavas com margem para mais ${simulado.faltasRestantes}.`} Isto é só uma simulação, não muda nada.</p>}
        </div>
      )}

      <div className="faltas-cartao__acoes">
        <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>{aberto ? 'Esconder histórico' : `Histórico (${historico.length})`}</button>
        <button type="button" onClick={onAbrirCadeira}>Abrir cadeira</button>
      </div>

      {aberto && (
        <ul className="faltas-historico">
          {historico.length === 0 && <li className="faltas-vazio">Ainda não marcaste nenhuma aula desta cadeira.</li>}
          {historico.map((h) => (
            <li key={h.chave}>
              <button type="button" onClick={() => h.data && onAbrirCalendario(h.data)}>
                <span>{formatarData(h.data)}</span>
                <span className={`aula-chip aula-chip--${h.estado}`}>{h.rotulo}</span>
                {h.motivo && <small>{h.motivo}</small>}
                {h.nota && <small>{h.nota}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
