// página de uma cadeira: ficha e sete tabs (resumo, anotações, casos, notas, faltas, leituras, flashcards)
// as notas e as faltas lançam-se nas suas páginas; aqui vês o estado e vais direto lá
import { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useCadeira } from '../hooks/useCadeira.js';
import { useAnotacoes } from '../hooks/useAnotacoes.js';
import { useCasos } from '../hooks/useCasos.js';
import { useLeituras } from '../hooks/useLeituras.js';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { useAulasSemanais } from '../hooks/useAulasSemanais.js';
import { estadoDaCadeira, pesosDaCadeira } from '../services/notas.js';
import { estadoFaltas } from '../services/faltas.js';
import { gerarOcorrencias, proximaAula } from '../services/ocorrencias.js';
import { dataNatural } from '../services/datas.js';
import { getCadeira } from '../data/dadosLeonor.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import ArvoreAvaliacao from '../components/ArvoreAvaliacao.jsx';
import SemaforoFaltas from '../components/SemaforoFaltas.jsx';
import MensagemCarinhosa from '../components/MensagemCarinhosa.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import './Cadeira.css';
import Carregando from '../components/animacoes/Carregando.jsx';

const TABS = [
  { id: 'resumo', rotulo: 'Resumo' },
  { id: 'anotacoes', rotulo: 'Anotações' },
  { id: 'casos', rotulo: 'Casos' },
  { id: 'notas', rotulo: 'Notas' },
  { id: 'faltas', rotulo: 'Faltas' },
  { id: 'leituras', rotulo: 'Leituras' },
  { id: 'flashcards', rotulo: 'Flashcards' },
];

const ROTULO_ESTADO = {
  aprovada: 'Aprovada',
  admitidaEscrito: 'Vai a exame escrito',
  admitidaOral: 'Vai a oral',
  excluida: 'Excluída',
  passaMetodoB: 'Passa a Método B',
  semDados: 'Sem notas ainda',
};

export default function Cadeira() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [params, setParams] = useSearchParams();
  const { cadeira, faltasDados, avaliacaoDados, loading } = useCadeira(id);
  const { aulas } = useAulasSemanais();
  const infoBase = getCadeira(id);

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'resumo';

  const aulasDaCadeira = useMemo(() => aulas.filter((a) => a.cadeira === id), [aulas, id]);
  const proxima = useMemo(
    () => proximaAula(aulasDaCadeira.flatMap((a) => gerarOcorrencias(a))),
    [aulasDaCadeira]
  );

  if (loading) return <div className="cadeira-pagina"><Carregando texto="A carregar..." tipo="templo" /></div>;
  if (!cadeira) return <div className="cadeira-pagina"><p className="cadeira-loading">Não encontrei esta cadeira. Volta à lista e tenta outra vez.</p></div>;

  const cor = cadeira.cor || '#b8963e';
  const pesos = pesosDaCadeira(cadeira, infoBase);
  const { notaAC, resultado } = estadoDaCadeira({ metodo: cadeira.metodo, avaliacaoDados, pesos });
  const faltas = estadoFaltas({
    aulasPraticasPrevistas: cadeira.aulasPraticasPrevistas || 30,
    aulasPraticasLecionadas: faltasDados?.aulasPraticasLecionadas || 0,
    faltasInjustificadas: faltasDados?.faltasInjustificadas || 0,
    faltasJustificadas: faltasDados?.faltasJustificadas || 0,
  });

  return (
    <div className={`cadeira-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" texto="‹ Cadeiras" />

      <header className="cadeira-header" style={{ '--cor': cor }}>
        <span className="cadeira-header__abrev">{cadeira.abrev}</span>
        <h1 className="cadeira-header__nome">{cadeira.nome}</h1>
        <p className="cadeira-header__regente">{cadeira.regente} · Método {cadeira.metodo}</p>
      </header>

      <div className="cadeira-tabs" role="tablist" aria-label="Secções da cadeira">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`cadeira-tab ${tab === t.id ? 'ativo' : ''}`}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      <div className="cadeira-tab-corpo">
        {tab === 'resumo' && (
          <TabResumo
            cadeira={cadeira}
            resultado={resultado}
            faltas={faltas}
            pesos={pesos}
            proxima={proxima}
            aulasDaCadeira={aulasDaCadeira}
            irPara={(t) => setParams({ tab: t }, { replace: true })}
          />
        )}
        {tab === 'anotacoes' && <TabAnotacoes cadeiraId={id} navigate={navigate} />}
        {tab === 'casos' && <TabCasos cadeiraId={id} navigate={navigate} />}
        {tab === 'notas' && (
          <TabNotas cadeira={cadeira} resultado={resultado} notaAC={notaAC} dados={avaliacaoDados} navigate={navigate} />
        )}
        {tab === 'faltas' && <TabFaltas cadeira={cadeira} faltas={faltas} lecionadas={faltasDados?.aulasPraticasLecionadas || 0} navigate={navigate} />}
        {tab === 'leituras' && <TabLeituras cadeiraId={id} navigate={navigate} />}
        {tab === 'flashcards' && <TabFlashcards cadeiraId={id} navigate={navigate} />}
      </div>

      <p className="cadeira-aviso-geral">
        Cálculo com base no regulamento geral, confirma sempre a ficha da tua cadeira — o regente pode fixar regras próprias.
      </p>
    </div>
  );
}

function TabResumo({ cadeira, resultado, faltas, pesos, proxima, aulasDaCadeira, irPara }) {
  const { leituras } = useLeituras();
  const manual = leituras.find((l) => l.cadeiraId === cadeira.id);
  const docentePratica = aulasDaCadeira.find((a) => a.contaFalta && a.docente)?.docente;

  return (
    <>
      <button className={`cadeira-resumo-cartao cadeira-resumo-cartao--${resultado.estado}`} onClick={() => irPara('notas')}>
        <span className="cadeira-resumo-cartao__rotulo">Avaliação</span>
        <strong>{ROTULO_ESTADO[resultado.estado] || resultado.estado}{resultado.notaFinal != null ? ` · ${resultado.notaFinal}` : ''}</strong>
        <span className="cadeira-resumo-cartao__texto">{resultado.explicacao}</span>
      </button>

      <button className={`cadeira-resumo-cartao cadeira-resumo-cartao--faltas-${faltas.semaforo}`} onClick={() => irPara('faltas')}>
        <span className="cadeira-resumo-cartao__rotulo">Faltas</span>
        <strong>{faltas.excluidaConfirmada ? 'Excluída' : `Ainda podes faltar ${faltas.faltasRestantesSemestre} ${faltas.faltasRestantesSemestre === 1 ? 'vez' : 'vezes'}`}</strong>
        <span className="cadeira-resumo-cartao__texto">{faltas.explicacaoAgora}</span>
      </button>

      <div className="cadeira-resumo-cartao cadeira-resumo-cartao--info">
        <span className="cadeira-resumo-cartao__rotulo">Próxima aula</span>
        {proxima ? (
          <strong>{dataNatural(proxima.data)} · {proxima.horaInicio}{proxima.sala ? ` · ${proxima.sala}` : ''} ({proxima.tipoAula === 'pratica' ? 'prática' : 'teórica'})</strong>
        ) : (
          <strong>Sem aulas marcadas</strong>
        )}
      </div>

      <section className="cadeira-ficha">
        <h2 className="cadeira-ficha__titulo">Ficha da cadeira</h2>
        <dl className="cadeira-ficha__lista">
          <div><dt>Regente</dt><dd>{cadeira.regente}</dd></div>
          <div><dt>Docente das práticas</dt><dd>{docentePratica || 'Por preencher — indica-o no Horário, em Editar horário'}</dd></div>
          <div><dt>Método</dt><dd>{cadeira.metodo === 'A' ? 'A — avaliação contínua' : 'B — só exame'}</dd></div>
          {cadeira.metodo === 'A' && (
            <div><dt>Pesos da contínua</dt><dd>Prova escrita {Math.round(pesos.provaEscrita * 100)}% · outros elementos {Math.round(pesos.outrosElementos * 100)}%</dd></div>
          )}
          <div><dt>Manual</dt><dd>{manual ? `${manual.manual}${manual.autor ? `, ${manual.autor}` : ''}` : 'Ainda sem manual registado — junta-o em Leituras'}</dd></div>
          <div><dt>Aulas práticas previstas</dt><dd>{cadeira.aulasPraticasPrevistas || 30}</dd></div>
          {cadeira.optativa && <div><dt>Tipo</dt><dd>Optativa</dd></div>}
        </dl>
      </section>

      {faltas.semaforo !== 'verde' && <MensagemCarinhosa contexto="faltasApertadas" />}
    </>
  );
}

function TabAnotacoes({ cadeiraId, navigate }) {
  const { anotacoes, loading } = useAnotacoes();
  const lista = anotacoes.filter((a) => a.cadeiraId === cadeiraId);
  if (loading) return <Carregando texto="A carregar..." />;
  return (
    <>
      <button className="cadeira-tab-acao" onClick={() => navigate('/anotacoes/nova', { state: { cadeiraId } })}>+ Nova anotação</button>
      {lista.length === 0 ? (
        <EstadoVazio
          icone="📝"
          titulo="Ainda não tens anotações nesta cadeira"
          texto="Toca em Nova anotação para escreveres a primeira. Podes separar teóricas de práticas."
        />
      ) : (
        <ul className="cadeira-lista">
          {lista.slice(0, 8).map((a) => (
            <li key={a.id}>
              <button className="cadeira-item" onClick={() => navigate(`/anotacoes/${a.id}`)}>
                <strong>{a.titulo || 'Sem título'}</strong>
                <span>{(a.conteudo || '').slice(0, 90)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TabCasos({ cadeiraId, navigate }) {
  const { casos, loading } = useCasos();
  const lista = casos.filter((c) => c.cadeiraId === cadeiraId);
  if (loading) return <Carregando texto="A carregar..." />;
  return (
    <>
      <button className="cadeira-tab-acao" onClick={() => navigate('/casos/novo')}>+ Novo caso</button>
      {lista.length === 0 ? (
        <EstadoVazio
          icone="⚖️"
          titulo="Ainda não tens casos práticos desta cadeira"
          texto="Cada caso tem factos, questão, enquadramento, subsunção e conclusão. As dúvidas que anotares juntam-se todas numa lista para levares à aula."
        />
      ) : (
        <ul className="cadeira-lista">
          {lista.map((c) => (
            <li key={c.id}>
              <button className="cadeira-item" onClick={() => navigate(`/casos/${c.id}`)}>
                <strong>{c.titulo || 'Sem título'}</strong>
                <span>{c.duvidas?.length ? `${c.duvidas.length} dúvida${c.duvidas.length === 1 ? '' : 's'} por esclarecer` : 'Sem dúvidas'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TabNotas({ cadeira, resultado, notaAC, dados, navigate }) {
  return (
    <>
      <div className={`cadeira-resultado cadeira-resultado--${resultado.estado}`}>
        <span className="cadeira-resultado__estado">{ROTULO_ESTADO[resultado.estado] || resultado.estado}</span>
        {resultado.notaFinal != null && <span className="cadeira-resultado__nota">{resultado.notaFinal}</span>}
        <p className="cadeira-resultado__explicacao">{resultado.explicacao}</p>
        {resultado.proximoPasso && resultado.estado !== 'semDados' && <p className="cadeira-resultado__aviso">A seguir: {resultado.proximoPasso}</p>}
        {resultado.avisos?.map((aviso, i) => <p key={i} className="cadeira-resultado__aviso">⚠️ {aviso}</p>)}
      </div>

      <button className="cadeira-tab-acao" onClick={() => navigate('/notas', { state: { abrirModal: true, cadeiraId: cadeira.id } })}>
        Lançar nota
      </button>

      <h2 className="cadeira-ficha__titulo">Onde estás no regulamento</h2>
      <ArvoreAvaliacao metodo={cadeira.metodo} resultado={resultado} notaAC={notaAC} dados={dados} />

      <button className="cadeira-link" onClick={() => navigate('/notas')}>Ver simulador e pesos na página de Notas ›</button>
    </>
  );
}

function TabFaltas({ cadeira, faltas, lecionadas, navigate }) {
  return (
    <>
      <SemaforoFaltas estado={faltas} lecionadas={lecionadas} previstas={cadeira.aulasPraticasPrevistas || 30} />
      <button className="cadeira-tab-acao" onClick={() => navigate('/faltas')}>Registar falta ou ver histórico</button>
    </>
  );
}

function TabLeituras({ cadeiraId, navigate }) {
  const { leituras, loading } = useLeituras();
  const lista = leituras.filter((l) => l.cadeiraId === cadeiraId);
  if (loading) return <Carregando texto="A carregar..." />;
  return (
    <>
      <button className="cadeira-tab-acao" onClick={() => navigate('/leituras')}>Abrir Leituras</button>
      {lista.length === 0 ? (
        <EstadoVazio
          icone="📖"
          titulo="Ainda não registaste o manual desta cadeira"
          texto="Junta o manual em Leituras e vais marcando a página em que ficas. A percentagem calcula-se sozinha."
        />
      ) : (
        <ul className="cadeira-lista">
          {lista.map((l) => {
            const pct = l.totalPaginas ? Math.min(100, Math.round(((l.paginaAtual || 0) / l.totalPaginas) * 100)) : 0;
            return (
              <li key={l.id} className="cadeira-item cadeira-item--estatico">
                <strong>{l.manual}</strong>
                <span>{l.autor ? `${l.autor} · ` : ''}{pct}% lido</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function TabFlashcards({ cadeiraId, navigate }) {
  const { flashcards, loading } = useFlashcards();
  const lista = flashcards.filter((f) => f.cadeiraId === cadeiraId);
  if (loading) return <Carregando texto="A carregar..." />;
  return (
    <>
      <button className="cadeira-tab-acao" onClick={() => navigate('/flashcards')}>Abrir Flashcards</button>
      {lista.length === 0 ? (
        <EstadoVazio
          icone="🗂️"
          titulo="Ainda não tens flashcards desta cadeira"
          texto="Escreve a pergunta de um lado e a resposta do outro. A app diz-te quando é hora de rever cada um."
        />
      ) : (
        <p className="cadeira-flash-resumo">{lista.length} cartão{lista.length === 1 ? '' : 's'} nesta cadeira.</p>
      )}
    </>
  );
}
