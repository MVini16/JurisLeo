// página de notas: estado de cada cadeira, árvore do regulamento, simulador e média anual
// nenhum cálculo é feito aqui — tudo vem do motor (avaliacao.js) através de notas.js
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useNotas } from '../hooks/useNotas.js';
import { simularNotaNecessaria } from '../services/avaliacao.js';
import { estadoDaCadeira, pesosDaCadeira, resumoDoAno, normalizarPesos } from '../services/notas.js';
import { cadeirasS1, getCadeira } from '../data/dadosLeonor.js';
import { escolherFrase } from '../hooks/useFrase.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import ArvoreAvaliacao from '../components/ArvoreAvaliacao.jsx';
import ModalLancarNota from '../components/ModalLancarNota.jsx';
import Celebracao from '../components/Celebracao.jsx';
import EcraConsolo from '../components/EcraConsolo.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import './Notas.css';
import Carregando from '../components/animacoes/Carregando.jsx';

const ROTULO_ESTADO = {
  aprovada: 'Aprovada',
  admitidaEscrito: 'Vai a exame escrito',
  admitidaOral: 'Vai a oral',
  excluida: 'Excluída',
  passaMetodoB: 'Passa a Método B',
  semDados: 'Sem notas ainda',
};

const AVISO_REGULAMENTO = 'Cálculo com base no regulamento geral, confirma sempre a ficha da tua cadeira.';

// 13.5 → "13,50"
function formatar(n) {
  return n.toFixed(2).replace('.', ',');
}

export default function Notas() {
  const { darkMode } = useTheme();
  const location = useLocation();
  const { cadeiras, avaliacoes, loading, guardarNota, guardarPesos } = useNotas();

  const [modal, setModal] = useState(location.state?.abrirModal ? { cadeiraId: location.state?.cadeiraId ?? null } : null);
  const [celebracao, setCelebracao] = useState(null);
  const [consolo, setConsolo] = useState(null);

  // ordem do horário, não a do firestore
  const ordenadas = [...cadeiras].sort(
    (a, b) => cadeirasS1.findIndex((c) => c.id === a.id) - cadeirasS1.findIndex((c) => c.id === b.id)
  );

  const estados = ordenadas.map((cadeira) => {
    const pesos = pesosDaCadeira(cadeira, getCadeira(cadeira.id));
    const { notaAC, resultado } = estadoDaCadeira({ metodo: cadeira.metodo, avaliacaoDados: avaliacoes[cadeira.id], pesos });
    return { cadeira, pesos, notaAC, resultado };
  });
  const ano = resumoDoAno(estados.map((e) => e.resultado));

  // grava a nota, corre o motor antes e depois, e mostra a celebração ou o consolo
  async function aoGuardarNota({ cadeira, campo, valor }) {
    const antes = estados.find((e) => e.cadeira.id === cadeira.id)?.resultado;
    const pesos = pesosDaCadeira(cadeira, getCadeira(cadeira.id));
    const dadosNovos = { ...(avaliacoes[cadeira.id] || {}), [campo]: valor };
    const { resultado: depois } = estadoDaCadeira({ metodo: cadeira.metodo, avaliacaoDados: dadosNovos, pesos });

    await guardarNota(cadeira.id, { [campo]: valor });
    setModal(null);

    if (depois.estado === 'aprovada' && (antes?.estado !== 'aprovada' || antes?.notaFinal !== depois.notaFinal)) {
      setCelebracao(depois.notaFinal);
    } else if (depois.estado === 'excluida' && antes?.estado !== 'excluida') {
      const prazo = 'Tens 5 dias para te inscreveres no exame de recurso.';
      setConsolo({
        mensagem: escolherFrase('posNotaBaixa'),
        proximoPasso: campo === 'exameRecurso' ? depois.proximoPasso : `${depois.proximoPasso} ${prazo}`,
      });
    }
  }

  return (
    <div className={`notas-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar destino="/cadeiras" texto="‹ Cadeiras" />

      <header className="notas-header">
        <div>
          <h1 className="notas-titulo">Notas</h1>
          <span className="notas-subtitulo">1.º semestre · Método A</span>
        </div>
        <button className="notas-btn-lancar" onClick={() => setModal({ cadeiraId: null })}>+ Lançar nota</button>
      </header>

      {loading && <Carregando texto="A carregar as tuas notas..." />}

      {!loading && ordenadas.length === 0 && (
        <EstadoVazio
          icone="📊"
          titulo="Ainda não há cadeiras por aqui"
          texto="Assim que as tuas cadeiras estiverem registadas, é aqui que lanças as notas e vês o que cada uma significa."
        />
      )}

      {ordenadas.length > 0 && <CartaoMedia ano={ano} />}

      <div className="notas-lista">
        {estados.map(({ cadeira, pesos, notaAC, resultado }) => (
          <CartaoNota
            key={cadeira.id}
            cadeira={cadeira}
            pesos={pesos}
            notaAC={notaAC}
            resultado={resultado}
            dados={avaliacoes[cadeira.id]}
            onLancar={() => setModal({ cadeiraId: cadeira.id })}
            onGuardarPesos={(p) => guardarPesos(cadeira.id, p)}
          />
        ))}
      </div>

      <p className="notas-aviso">{AVISO_REGULAMENTO}</p>

      {modal && (
        <ModalLancarNota
          cadeiras={ordenadas}
          avaliacoes={avaliacoes}
          cadeiraInicial={modal.cadeiraId}
          onFechar={() => setModal(null)}
          onGuardar={aoGuardarNota}
        />
      )}
      {celebracao != null && <Celebracao nota={celebracao} onTerminar={() => setCelebracao(null)} />}
      {consolo && <EcraConsolo mensagem={consolo.mensagem} proximoPasso={consolo.proximoPasso} onFechar={() => setConsolo(null)} />}
    </div>
  );
}

function CartaoMedia({ ano }) {
  return (
    <section className="notas-media">
      <h2 className="notas-media__titulo">Média do ano</h2>
      {ano.media == null ? (
        <p className="notas-media__vazio">
          Ainda não tens nenhuma cadeira aprovada. Quando tiveres, a média aparece aqui.
        </p>
      ) : (
        <div className="notas-media__linha">
          <span className="notas-media__numero">{formatar(ano.media)}</span>
          {ano.escala && <span className="notas-media__escala">{ano.escala}</span>}
        </div>
      )}
      <p className="notas-media__detalhe">
        Média das {ano.aprovadas} cadeira{ano.aprovadas === 1 ? '' : 's'} já aprovada{ano.aprovadas === 1 ? '' : 's'}, de {ano.total}.
      </p>
      <p className="notas-media__bonus">
        <strong>Bónus de 0,6 valores:</strong> acresce no fim do ano se fechares todas as cadeiras do ano letivo (as dos dois semestres) sem atrasos.
        {ano.todasAprovadas && ' Já fechaste todas as do 1.º semestre — faltam as do 2.º.'}
      </p>
    </section>
  );
}

function CartaoNota({ cadeira, pesos, notaAC, resultado, dados, onLancar, onGuardarPesos }) {
  const [painel, setPainel] = useState(null);
  const cor = cadeira.cor || '#b8963e';

  function alternar(nome) {
    setPainel((atual) => (atual === nome ? null : nome));
  }

  return (
    <article className={`nota-cartao nota-cartao--${resultado.estado}`} style={{ '--cor': cor }}>
      <div className="nota-cartao__barra" />
      <div className="nota-cartao__corpo">
        <div className="nota-cartao__topo">
          <span className="nota-cartao__abrev" style={{ color: cor }}>{cadeira.abrev}</span>
          <span className={`nota-chip nota-chip--${resultado.estado}`}>{ROTULO_ESTADO[resultado.estado] || resultado.estado}</span>
        </div>

        {/* o texto primeiro, o número depois — nunca só um número */}
        <p className="nota-cartao__explicacao">{resultado.explicacao}</p>
        {resultado.proximoPasso && resultado.estado !== 'semDados' && (
          <p className="nota-cartao__proximo">A seguir: {resultado.proximoPasso}</p>
        )}
        {resultado.avisos?.map((aviso, i) => <p key={i} className="nota-cartao__aviso">⚠️ {aviso}</p>)}

        <div className="nota-cartao__numeros">
          {notaAC != null && cadeira.metodo === 'A' && (
            <span className="nota-numero"><small>Contínua</small><strong>{notaAC}</strong></span>
          )}
          {resultado.notaEntradaOral != null && resultado.notaFinal == null && (
            <span className="nota-numero"><small>Entrada na oral</small><strong>{resultado.notaEntradaOral}</strong></span>
          )}
          {resultado.notaFinal != null && (
            <span className="nota-numero nota-numero--final"><small>Nota final</small><strong>{resultado.notaFinal}</strong></span>
          )}
        </div>

        <div className="nota-cartao__acoes">
          <button className="nota-acao nota-acao--pri" onClick={onLancar}>Lançar nota</button>
          <button className={`nota-acao ${painel === 'arvore' ? 'ativo' : ''}`} onClick={() => alternar('arvore')}>Onde estou</button>
          <button className={`nota-acao ${painel === 'simular' ? 'ativo' : ''}`} onClick={() => alternar('simular')}>Simular</button>
          <button className={`nota-acao ${painel === 'pesos' ? 'ativo' : ''}`} onClick={() => alternar('pesos')}>Pesos</button>
        </div>

        {painel === 'arvore' && (
          <div className="nota-painel">
            <ArvoreAvaliacao metodo={cadeira.metodo} resultado={resultado} notaAC={notaAC} dados={dados} />
          </div>
        )}
        {painel === 'simular' && (
          <div className="nota-painel">
            <Simulador metodo={cadeira.metodo} notaAC={notaAC} dados={dados} resultado={resultado} />
          </div>
        )}
        {painel === 'pesos' && (
          <div className="nota-painel">
            <Pesos pesos={pesos} metodo={cadeira.metodo} onGuardar={onGuardarPesos} />
          </div>
        )}
      </div>
    </article>
  );
}

// simulador ao contrário: escolhes a nota que queres e vês o que precisas de tirar
function Simulador({ metodo, notaAC, dados, resultado }) {
  const [desejada, setDesejada] = useState(14);
  const simulacao = simularNotaNecessaria({ metodo, notaAC, exameEscrito: dados?.exameEscrito ?? null, notaDesejada: desejada });

  let mensagem = null;
  if (!simulacao) {
    if (resultado.estado === 'aprovada') mensagem = `Já estás aprovada com ${resultado.notaFinal}. Se quiseres subir a nota, o caminho é a melhoria (uma por cadeira, sempre oral).`;
    else if (metodo === 'A' && notaAC == null) mensagem = 'Assim que tiveres a nota de avaliação contínua, o simulador diz-te o que precisas no exame.';
    else mensagem = `Não há nada para simular neste momento. ${resultado.proximoPasso || ''}`;
  }

  return (
    <div className="simulador">
      <label className="simulador__label" htmlFor={`sim-${metodo}-${notaAC}`}>
        Nota que queres: <strong>{desejada}</strong>
      </label>
      <input
        id={`sim-${metodo}-${notaAC}`}
        className="simulador__slider"
        type="range"
        min="10"
        max="20"
        step="1"
        value={desejada}
        onChange={(e) => setDesejada(Number(e.target.value))}
      />
      <div className="simulador__escala"><span>10</span><span>20</span></div>

      {simulacao && (
        <p className={`simulador__resultado ${simulacao.impossivel ? 'simulador__resultado--impossivel' : ''}`}>
          {simulacao.texto}
        </p>
      )}
      {mensagem && <p className="simulador__resultado">{mensagem}</p>}
    </div>
  );
}

// pesos editáveis: a prova escrita nunca passa de 50%
function Pesos({ pesos, metodo, onGuardar }) {
  const [escrita, setEscrita] = useState(Math.round(pesos.provaEscrita * 100));
  const [estado, setEstado] = useState('');

  if (metodo !== 'A') {
    return <p className="pesos__nota">Em Método B a nota vem só do exame, por isso não há pesos para ajustar.</p>;
  }

  async function guardar() {
    setEstado('a guardar');
    try {
      await onGuardar(normalizarPesos({ provaEscrita: escrita / 100 }));
      setEstado('guardado');
    } catch {
      setEstado('erro');
    }
  }

  return (
    <div className="pesos">
      <p className="pesos__linha">Prova escrita <strong>{escrita}%</strong> · Outros elementos <strong>{100 - escrita}%</strong></p>
      <input
        className="simulador__slider"
        type="range"
        min="0"
        max="50"
        step="5"
        value={escrita}
        aria-label="Peso da prova escrita"
        onChange={(e) => { setEscrita(Number(e.target.value)); setEstado(''); }}
      />
      <p className="pesos__nota">Por regra, a prova escrita nunca vale mais de metade. Se o regente definiu outros pesos na ficha da cadeira, ajusta aqui.</p>
      <button className="nota-acao nota-acao--pri" onClick={guardar} disabled={estado === 'a guardar'}>
        {estado === 'guardado' ? '✓ Guardado' : estado === 'a guardar' ? 'A guardar...' : 'Guardar pesos'}
      </button>
      {estado === 'erro' && <p className="pesos__erro" role="alert">Não consegui guardar agora. Tenta outra vez daqui a pouco.</p>}
    </div>
  );
}

