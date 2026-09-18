// página de faltas: semáforo por cadeira, registo em dois toques, comprovativos e histórico
import { useMemo, useState } from 'react';
import { useTheme } from '../context/useTheme.js';
import { useFaltas } from '../hooks/useFaltas.js';
import { useFaltasRegisto } from '../hooks/useFaltasRegisto.js';
import { useAulasSemanais } from '../hooks/useAulasSemanais.js';
import { useEstadosAula } from '../hooks/useEstadosAula.js';
import { estadoFaltas, prazoComprovativo } from '../services/faltas.js';
import { gerarOcorrencias } from '../services/ocorrencias.js';
import { dataCurta, dataDeChave, textoPrazo } from '../services/datas.js';
import { chaveData } from '../data/feriados.js';
import { cadeirasS1 } from '../data/dadosLeonor.js';
import { motivosFalta, PRAZO_COMPROVATIVO_HORAS } from '../data/motivosFalta.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import SemaforoFaltas from '../components/SemaforoFaltas.jsx';
import MensagemCarinhosa from '../components/MensagemCarinhosa.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Toast from '../components/Toast.jsx';
import './Faltas.css';

export default function Faltas() {
  const { darkMode } = useTheme();
  const { cadeiras, faltasDados, loading } = useFaltas();
  const { registos, registarSolta, atualizar, apagar, corrigirLecionadas } = useFaltasRegisto();
  const { aulas } = useAulasSemanais();
  const { estados, marcar } = useEstadosAula();

  const [escolhida, setEscolhida] = useState(null);
  const [recente, setRecente] = useState(null); // falta acabada de registar, para o passo opcional de justificar
  const [toast, setToast] = useState(null);
  const [erro, setErro] = useState('');

  const ordenadas = useMemo(
    () => [...cadeiras].sort((a, b) => cadeirasS1.findIndex((c) => c.id === a.id) - cadeirasS1.findIndex((c) => c.id === b.id)),
    [cadeiras]
  );

  // aulas práticas de hoje, para a falta ir direta para a aula certa
  const chaveHoje = chaveData(new Date());
  const praticasHoje = useMemo(
    () => aulas
      .flatMap((a) => gerarOcorrencias(a))
      .filter((o) => o.tipoAula === 'pratica' && chaveData(o.data) === chaveHoje),
    [aulas, chaveHoje]
  );
  const cadeirasComPraticaHoje = new Set(praticasHoje.map((o) => o.cadeira));

  const estadosPorCadeira = ordenadas.map((cadeira) => {
    const d = faltasDados[cadeira.id] || {};
    const estado = estadoFaltas({
      aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas || 30,
      aulasPraticasLecionadas: d.aulasPraticasLecionadas || 0,
      faltasInjustificadas: d.faltasInjustificadas || 0,
      faltasJustificadas: d.faltasJustificadas || 0,
    });
    return { cadeira, estado, lecionadas: d.aulasPraticasLecionadas || 0 };
  });

  async function faltei() {
    const cadeira = ordenadas.find((c) => c.id === escolhida);
    if (!cadeira) return;
    setErro('');
    try {
      // se hoje há prática desta cadeira, marca essa aula; senão regista a falta solta
      const aula = praticasHoje.find((o) => o.cadeira === cadeira.id && estados[o.ocorrenciaId]?.estado !== 'faltei');
      let registoId;
      let ocorrenciaId = null;
      if (aula) {
        await marcar(aula, 'faltei');
        registoId = `occ_${aula.ocorrenciaId}`;
        ocorrenciaId = aula.ocorrenciaId;
      } else {
        registoId = await registarSolta({ cadeiraId: cadeira.id, data: new Date() });
      }
      setRecente({ id: registoId, cadeiraId: cadeira.id, ocorrenciaId });
      setToast({
        mensagem: `Falta registada em ${cadeira.abrev}.`,
        acao: {
          texto: 'Desfazer',
          fn: async () => {
            await apagar({ id: registoId, cadeiraId: cadeira.id, ocorrenciaId });
            setRecente(null);
          },
        },
      });
      setEscolhida(null);
    } catch {
      setErro('Não consegui registar agora. Tenta outra vez daqui a pouco.');
    }
  }

  // lembretes: comprovativos por entregar, do mais urgente para o menos
  const lembretes = registos
    .filter((r) => r.justificada && !r.comprovativoEntregue && r.prazoComprovativo)
    .map((r) => ({ registo: r, prazo: r.prazoComprovativo.toDate() }))
    .sort((a, b) => a.prazo - b.prazo);

  const quaseNoLimite = estadosPorCadeira.filter(({ estado }) => estado.quaseNoLimite);
  const registoRecente = recente ? registos.find((r) => r.id === recente.id) : null;

  return (
    <div className={`faltas-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" texto="‹ Cadeiras" />

      <header className="faltas-header">
        <h1 className="faltas-titulo">Faltas</h1>
        <span className="faltas-subtitulo">Aulas práticas · 1.º semestre</span>
      </header>

      {loading && <p className="faltas-loading">A carregar as tuas faltas...</p>}

      {!loading && ordenadas.length === 0 && (
        <EstadoVazio icone="📋" titulo="Ainda não há cadeiras por aqui" texto="Assim que as tuas cadeiras estiverem registadas, é aqui que registas faltas e vês quantas ainda podes dar." />
      )}

      {/* avisos: comprovativos e cadeiras perto do limite */}
      {lembretes.map(({ registo, prazo }) => {
        const cadeira = ordenadas.find((c) => c.id === registo.cadeiraId);
        return (
          <div key={registo.id} className="faltas-lembrete" role="alert">
            <strong>Comprovativo por entregar</strong>
            <span>Falta a {cadeira?.abrev || 'uma cadeira'} ({dataCurta(dataDeChave(registo.data))}): {textoPrazo(prazo)}.</span>
          </div>
        );
      })}
      {quaseNoLimite.map(({ cadeira, estado }) => (
        <div key={cadeira.id} className="faltas-aviso-limite">
          Em {cadeira.abrev} já só podes faltar mais {estado.faltasRestantesSemestre} {estado.faltasRestantesSemestre === 1 ? 'vez' : 'vezes'} este semestre.
        </div>
      ))}

      {/* registar falta: toca na cadeira, toca em "faltei" */}
      {ordenadas.length > 0 && (
        <section className="faltas-registo">
          <h2 className="faltas-seccao">Faltei a uma aula prática</h2>
          <p className="faltas-registo__ajuda">Toca na cadeira e depois em "Faltei". O motivo fica para depois, se quiseres.</p>
          <div className="faltas-chips">
            {ordenadas.map((c) => (
              <button
                key={c.id}
                className={`faltas-chip ${escolhida === c.id ? 'ativo' : ''}`}
                style={{ '--cor': c.cor }}
                onClick={() => setEscolhida(escolhida === c.id ? null : c.id)}
              >
                {c.abrev}
                {cadeirasComPraticaHoje.has(c.id) && <span className="faltas-chip__hoje">hoje</span>}
              </button>
            ))}
          </div>
          {escolhida && (
            <button className="faltas-btn-faltei" onClick={faltei}>Faltei</button>
          )}
          {erro && <p className="faltas-erro" role="alert">{erro}</p>}
        </section>
      )}

      {/* segundo passo, opcional: justificar a falta que acabou de registar */}
      {registoRecente && (
        <PassoJustificar
          onGuardar={async (patch) => { await atualizar(registoRecente, patch); setRecente(null); }}
          onSaltar={() => setRecente(null)}
        />
      )}

      <div className="faltas-lista">
        {estadosPorCadeira.map(({ cadeira, estado, lecionadas }) => (
          <CartaoFaltas
            key={cadeira.id}
            cadeira={cadeira}
            estado={estado}
            lecionadas={lecionadas}
            registos={registos.filter((r) => r.cadeiraId === cadeira.id)}
            onAtualizar={atualizar}
            onApagar={apagar}
            onCorrigirLecionadas={(v) => corrigirLecionadas(cadeira.id, v)}
          />
        ))}
      </div>

      <p className="faltas-aviso">
        Regra geral: ficas excluída com faltas injustificadas a um quarto ou mais das aulas práticas dadas, ou com metade ou mais das previstas (justificadas incluídas). Confirma sempre a ficha da tua cadeira.
      </p>

      {toast && <Toast mensagem={toast.mensagem} acao={toast.acao} onFechar={() => setToast(null)} />}
    </div>
  );
}

function PassoJustificar({ onGuardar, onSaltar }) {
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      await onGuardar({ justificada: true, motivo });
    } catch {
      setGuardando(false);
    }
  }

  return (
    <section className="faltas-justificar">
      <h2 className="faltas-seccao">Tens motivo para justificar?</h2>
      <p className="faltas-registo__ajuda">
        Se sim, escolhe o motivo. Tens {PRAZO_COMPROVATIVO_HORAS} horas (até ao fim do dia útil seguinte) para entregar o comprovativo. Se não, não faz mal, deixa como está.
      </p>
      <div className="faltas-motivos">
        {motivosFalta.map((m) => (
          <button key={m} className={`faltas-motivo ${motivo === m ? 'ativo' : ''}`} onClick={() => setMotivo(m)}>{m}</button>
        ))}
      </div>
      <div className="faltas-botoes">
        <button className="faltas-btn faltas-btn--sec" onClick={onSaltar}>Agora não</button>
        <button className="faltas-btn faltas-btn--pri" onClick={guardar} disabled={!motivo || guardando}>
          {guardando ? 'A guardar...' : 'Justificar'}
        </button>
      </div>
    </section>
  );
}

function CartaoFaltas({ cadeira, estado, lecionadas, registos, onAtualizar, onApagar, onCorrigirLecionadas }) {
  const [aberto, setAberto] = useState(false);
  const [aEditar, setAEditar] = useState(false);
  const [valor, setValor] = useState(String(lecionadas));
  const cor = cadeira.cor || '#b8963e';

  async function guardarLecionadas() {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 0 || n > (cadeira.aulasPraticasPrevistas || 30)) return;
    await onCorrigirLecionadas(n);
    setAEditar(false);
  }

  return (
    <article className="faltas-cartao" style={{ '--cor': cor }}>
      <div className="faltas-cartao__barra" />
      <div className="faltas-cartao__corpo">
        <div className="faltas-cartao__topo">
          <span className="faltas-cartao__abrev" style={{ color: cor }}>{cadeira.abrev}</span>
          <span className="faltas-cartao__nome">{cadeira.nome}</span>
        </div>

        <SemaforoFaltas estado={estado} lecionadas={lecionadas} previstas={cadeira.aulasPraticasPrevistas || 30} />

        {estado.semaforo !== 'verde' && (
          <div className="faltas-cartao__mimo"><MensagemCarinhosa contexto="faltasApertadas" /></div>
        )}

        {/* o denominador muda ao longo do semestre e só ela sabe quantas aulas houve */}
        <div className="faltas-lecionadas">
          {!aEditar ? (
            <>
              <span>Aulas práticas dadas: <strong>{lecionadas}</strong></span>
              <button className="faltas-link" onClick={() => { setValor(String(lecionadas)); setAEditar(true); }}>Corrigir</button>
            </>
          ) : (
            <>
              <input
                className="faltas-input"
                type="number"
                inputMode="numeric"
                min="0"
                max={cadeira.aulasPraticasPrevistas || 30}
                value={valor}
                aria-label="Aulas práticas já dadas"
                onChange={(e) => setValor(e.target.value)}
              />
              <button className="faltas-btn faltas-btn--pri faltas-btn--peq" onClick={guardarLecionadas}>Guardar</button>
              <button className="faltas-btn faltas-btn--sec faltas-btn--peq" onClick={() => setAEditar(false)}>Cancelar</button>
            </>
          )}
        </div>

        <button className="faltas-historico-toggle" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>
          {aberto ? 'Esconder histórico' : `Histórico (${registos.length})`}
        </button>

        {aberto && (
          registos.length === 0 ? (
            <EstadoVazio icone="✨" titulo="Sem faltas registadas" texto="Quando faltares a uma aula prática desta cadeira, fica aqui o registo." />
          ) : (
            <ul className="faltas-historico">
              {registos.map((r) => (
                <ItemHistorico key={r.id} registo={r} onAtualizar={onAtualizar} onApagar={onApagar} />
              ))}
            </ul>
          )
        )}
      </div>
    </article>
  );
}

function ItemHistorico({ registo, onAtualizar, onApagar }) {
  const [aApagar, setAApagar] = useState(false);
  const [aJustificar, setAJustificar] = useState(false);
  const data = dataDeChave(registo.data);
  const prazo = registo.prazoComprovativo?.toDate?.() || prazoComprovativo(data);
  const aindaPodeJustificar = !registo.justificada && prazo && prazo > new Date();

  return (
    <li className="faltas-item">
      <div className="faltas-item__topo">
        <span className="faltas-item__data">{dataCurta(data)}</span>
        <span className={`faltas-item__tag ${registo.justificada ? 'faltas-item__tag--just' : ''}`}>
          {registo.justificada ? 'Justificada' : 'Injustificada'}
        </span>
      </div>

      {registo.justificada && registo.motivo && <p className="faltas-item__motivo">{registo.motivo}</p>}

      {registo.justificada && (
        <label className="faltas-item__comprovativo">
          <input
            type="checkbox"
            checked={!!registo.comprovativoEntregue}
            onChange={(e) => onAtualizar(registo, { comprovativoEntregue: e.target.checked })}
          />
          <span>Comprovativo entregue</span>
        </label>
      )}
      {registo.justificada && !registo.comprovativoEntregue && prazo && (
        <p className="faltas-item__prazo">Entrega {textoPrazo(prazo)}.</p>
      )}
      {aindaPodeJustificar && !aJustificar && (
        <p className="faltas-item__prazo">Podes justificar {textoPrazo(prazo)}.</p>
      )}

      {aJustificar && (
        <PassoJustificar
          onGuardar={async (patch) => { await onAtualizar(registo, patch); setAJustificar(false); }}
          onSaltar={() => setAJustificar(false)}
        />
      )}

      <div className="faltas-item__acoes">
        {!registo.justificada && !aJustificar && (
          <button className="faltas-link" onClick={() => setAJustificar(true)}>Justificar</button>
        )}
        {registo.justificada && (
          <button className="faltas-link" onClick={() => onAtualizar(registo, { justificada: false })}>Tirar justificação</button>
        )}
        {!aApagar ? (
          <button className="faltas-link faltas-link--suave" onClick={() => setAApagar(true)}>Apagar</button>
        ) : (
          <>
            <button className="faltas-link" onClick={() => onApagar(registo)}>Sim, apagar</button>
            <button className="faltas-link faltas-link--suave" onClick={() => setAApagar(false)}>Não</button>
          </>
        )}
      </div>
    </li>
  );
}
