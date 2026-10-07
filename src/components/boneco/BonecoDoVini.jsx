// o boneco do vini: um botão flutuante que anda com a leonor pelas páginas, abre uma conversa curta
// (como estás? -> uma ajuda útil) e, de tempos a tempos, é ele a puxar conversa — só se ela deixar.
// as frases vêm de data/boneco.js e as regras de services/boneco.js; nada disto vai para o firebase
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AvatarBoneco from './AvatarBoneco.jsx';
import Barney from '../Barney.jsx';
import { useTarefas } from '../../hooks/useTarefas.js';
import { usePreferencias } from '../../hooks/usePreferencias.js';
import { guardarPreferencias, lerPreferencias } from '../../services/preferenciasBrincadeiras.js';
import { lerExtras } from '../../services/armazemFrases.js';
import {
  ABERTURAS, ACOES, ESTADOS, RESPOSTAS, LINHAS_DE_APOIO,
} from '../../data/boneco.js';
import {
  acrescentarAoHistorico, deveReagir, escolherDe, escolherElogio, escolherReacao, escolherPiada, escolherProativa, escolherResposta, fimDoDia,
  ligacaoDaLinha, ligacoesDoContacto, podeFalarSozinho, rotaOcupada, rotaSemBoneco, tarefasUrgentes,
} from '../../services/boneco.js';
import { EVENTO_ESTUDO_CONCLUIDO } from '../../services/eventosApp.js';
import './Boneco.css';

const CHAVE_HISTORICO = 'jurisleo-boneco-historico';
const CHAVE_ADIADO = 'jurisleo-boneco-adiado';
const CHAVE_REACAO = 'jurisleo-boneco-reacao';
const PASSO_MS = 60 * 1000;
const ESPERA_INICIAL_MS = 2 * 60 * 1000;
const PAUSA_MS = 5 * 60 * 1000;

function lerJson(chave, valorPadrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? valorPadrao; } catch { return valorPadrao; }
}
function guardarJson(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem localstorage, esquece */ }
}

// ela está a escrever? então ele não aparece
function aEscrever() {
  const el = document.activeElement;
  return !!el && (el.matches?.('input, textarea, select') || el.isContentEditable);
}

// as tarefas só são pedidas quando ela escolhe "as 3 mais urgentes" (o boneco não gasta leituras sozinho)
function ListaUrgentes() {
  const { tarefas, loading } = useTarefas();
  if (loading) return <p className="boneco-lista__vazia">A ver o que há por fazer...</p>;
  const urgentes = tarefasUrgentes(tarefas);
  if (urgentes.length === 0) return <p className="boneco-lista__vazia">Não tens nada por fazer. Podes descansar.</p>;
  return (
    <ol className="boneco-lista">
      {urgentes.map((t) => (
        <li key={t.id}><b>{t.titulo || t.nome || 'Tarefa'}</b>{t.prazo && <small> · {t.prazo.split('-').reverse().join('-')}</small>}</li>
      ))}
    </ol>
  );
}

function LinhasDeApoio() {
  return (
    <ul className="boneco-linhas">
      {LINHAS_DE_APOIO.map((l) => (
        <li key={l.id}>
          <a href={ligacaoDaLinha(l.numero)}><b>{l.numero}</b> {l.nome}</a>
          <small>{l.nota}</small>
        </li>
      ))}
    </ul>
  );
}

function ContactoDoVini({ contacto, aoDefinir }) {
  const ligacoes = ligacoesDoContacto(contacto);
  if (!ligacoes) {
    return (
      <div className="boneco-contacto">
        <p>Ainda não tenho o número do Vini guardado neste telemóvel.</p>
        <button type="button" className="boneco-chip" onClick={aoDefinir}>Guardar o número nas Definições</button>
      </div>
    );
  }
  return (
    <div className="boneco-contacto">
      <a className="boneco-chip boneco-chip--forte" href={ligacoes.ligar}>Ligar ao Vini</a>
      <a className="boneco-chip" href={ligacoes.mensagem}>Mensagem</a>
      <a className="boneco-chip" href={ligacoes.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  );
}

export default function BonecoDoVini() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const prefs = usePreferencias();

  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [passo, setPasso] = useState('estado'); // 'estado' | 'acoes'
  const [acoes, setAcoes] = useState([]);
  const [balao, setBalao] = useState(null);
  const [barney, setBarney] = useState(false);
  const [falando, setFalando] = useState(false);

  const idMensagem = useRef(0);
  const ultimas = useRef({ resposta: null, piada: null, elogio: null, reacao: null });
  const aberturas = useRef(0);
  const inicio = useRef(0);
  const caminho = useRef(pathname);
  const janelaAberta = useRef(false);
  const fimDaConversa = useRef(null);
  const botao = useRef(null);

  useEffect(() => { inicio.current = Date.now(); }, []);
  useEffect(() => { caminho.current = pathname; }, [pathname]);
  useEffect(() => { janelaAberta.current = aberto || !!balao; }, [aberto, balao]);

  const dizer = useCallback((de, texto, extra = null) => {
    idMensagem.current += 1;
    setMensagens((m) => [...m, { id: idMensagem.current, de, texto, extra }]);
    if (de === 'boneco') {
      setFalando(true);
      setTimeout(() => setFalando(false), 1600);
    }
  }, []);

  const abrir = useCallback(() => {
    setBalao(null);
    setAberto(true);
    if (mensagens.length === 0) {
      dizer('boneco', aberturas.current === 0 ? escolherDe(ABERTURAS, null) : 'Estou aqui outra vez, Necas. Como estás agora?');
      aberturas.current += 1;
      setPasso('estado');
    }
  }, [dizer, mensagens.length]);

  const fechar = useCallback(() => {
    setAberto(false);
    botao.current?.focus();
  }, []);

  // escape fecha a conversa
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => { if (e.key === 'Escape') fechar(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, fechar]);

  // a conversa desce sozinha para a última mensagem
  useEffect(() => { fimDaConversa.current?.scrollIntoView?.({ block: 'end' }); }, [mensagens, passo, aberto]);

  // puxa conversa de tempos a tempos, só quando as regras deixam
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible' || aEscrever()) return;
      const agora = Date.now();
      if (agora - inicio.current < ESPERA_INICIAL_MS) return;
      const pode = podeFalarSozinho({
        agora,
        prefs: lerPreferencias(),
        caminho: caminho.current,
        historico: lerJson(CHAVE_HISTORICO, []),
        adiadoAte: lerJson(CHAVE_ADIADO, 0),
        janelaAberta: janelaAberta.current,
      });
      if (!pode) return;
      guardarJson(CHAVE_HISTORICO, acrescentarAoHistorico(lerJson(CHAVE_HISTORICO, []), agora));
      setBalao({ tipo: 'proativa', texto: escolherProativa(new Date(agora).getHours(), Math.random, lerExtras(), new Date(agora).getDay()).texto });
    }, PASSO_MS);
    return () => clearInterval(id);
  }, []);

  // depois de um jogo ou de uma sessão de flashcards, às vezes comenta (e só se ela não estiver a falar com ele)
  useEffect(() => {
    const aoAcabar = () => {
      const agora = Date.now();
      if (janelaAberta.current || !lerPreferencias().boneco) return;
      if (!deveReagir({ agora, ultimaReacao: lerJson(CHAVE_REACAO, 0) })) return;
      guardarJson(CHAVE_REACAO, agora);
      setTimeout(() => setBalao({ tipo: 'aviso', texto: escolherReacao(ultimas.current.reacao) }), 1500);
    };
    window.addEventListener(EVENTO_ESTUDO_CONCLUIDO, aoAcabar);
    return () => window.removeEventListener(EVENTO_ESTUDO_CONCLUIDO, aoAcabar);
  }, []);

  // a pausa de 5 minutos avisa quando acaba
  const temporizadorPausa = useRef(null);
  useEffect(() => () => clearTimeout(temporizadorPausa.current), []);

  const escolherEstado = (estado) => {
    const { rotulo } = ESTADOS.find((e) => e.id === estado);
    dizer('ela', rotulo);
    const resposta = escolherResposta(estado, { ultima: ultimas.current.resposta, extra: lerExtras() });
    ultimas.current.resposta = resposta?.texto ?? null;
    dizer('boneco', resposta?.texto);
    const banco = RESPOSTAS[estado];
    if (banco.cuidado) dizer('boneco', banco.cuidado);
    if (estado === 'mal') dizer('boneco', null, 'apoio');
    setAcoes(banco.acoes);
    setPasso('acoes');
  };

  const executarAcao = (id) => {
    dizer('ela', ACOES[id]);
    switch (id) {
      case 'pausa5':
        dizer('boneco', 'Pausa de cinco minutos começada. Larga o ecrã, bebe água. Eu aviso-te quando acabar.');
        clearTimeout(temporizadorPausa.current);
        temporizadorPausa.current = setTimeout(() => setBalao({ tipo: 'aviso', texto: 'Passaram os cinco minutos. Volta quando estiveres pronta.' }), PAUSA_MS);
        break;
      case 'tarefasHoje': fechar(); navigate('/tarefas'); break;
      case 'tresFlashcards': fechar(); navigate('/flashcards'); break;
      case 'estudar25': fechar(); navigate('/estudo'); break;
      case 'urgentes': dizer('boneco', 'Estas são as mais urgentes. Uma de cada vez.', 'urgentes'); break;
      case 'piada': {
        const piada = escolherPiada(ultimas.current.piada, Math.random, lerExtras());
        ultimas.current.piada = piada;
        dizer('boneco', piada);
        break;
      }
      case 'elogio': {
        const elogio = escolherElogio(ultimas.current.elogio, Math.random, lerExtras());
        ultimas.current.elogio = elogio;
        dizer('boneco', elogio);
        break;
      }
      case 'barney': setBarney(true); break;
      case 'viniSerio': dizer('boneco', 'Claro. O Vini a sério está mesmo aqui.', 'contacto'); break;
      case 'linhasApoio': dizer('boneco', 'Estas linhas são gratuitas e há pessoas a atender.', 'apoio'); break;
      default: break;
    }
  };

  const outraCoisa = () => { setPasso('estado'); dizer('boneco', 'Se quiseres, diz-me outra vez como estás.'); };

  const perguntarEsconder = () => {
    setPasso('esconder');
    dizer('boneco', 'Queres mesmo que me esconda? Para me voltares a chamar, vai a Definições, Brincadeiras, e liga o boneco.');
  };

  const esconder = () => {
    guardarPreferencias({ boneco: false });
    setAberto(false);
    setBalao(null);
  };

  const aoDefinirContacto = () => { fechar(); navigate('/perfil/brincadeiras'); };

  if (!prefs.boneco || rotaSemBoneco(pathname)) return null;

  const ocupada = rotaOcupada(pathname);
  const lado = prefs.bonecoPosicao === 'direita' ? 'direita' : 'esquerda';

  const responderBalao = (aceita, hoje) => {
    if (aceita) { abrir(); return; }
    if (hoje) guardarJson(CHAVE_ADIADO, fimDoDia(Date.now()));
    setBalao(null);
  };

  return (
    <div className={`boneco boneco--${lado}${ocupada ? ' boneco--discreto' : ''}`}>
      {balao && !aberto && (
        <div className="boneco-balao-fala" role="status">
          <p>{balao.texto}</p>
          {balao.tipo === 'proativa' ? (
            <div className="boneco-balao-fala__botoes">
              <button type="button" className="boneco-chip boneco-chip--forte" onClick={() => responderBalao(true)}>Falar</button>
              <button type="button" className="boneco-chip" onClick={() => responderBalao(false)}>Agora não</button>
              <button type="button" className="boneco-chip" onClick={() => responderBalao(false, true)}>Hoje não</button>
            </div>
          ) : (
            <div className="boneco-balao-fala__botoes">
              <button type="button" className="boneco-chip" onClick={() => setBalao(null)}>Ok</button>
            </div>
          )}
        </div>
      )}

      {aberto && (
        <section className="boneco-painel" role="dialog" aria-label="Conversa com o boneco do Vini">
          <header className="boneco-painel__topo">
            <div className="boneco-painel__avatar"><AvatarBoneco aspeto={prefs.bonecoAspeto} falando={falando} /></div>
            <div className="boneco-painel__titulo">
              <b>Boneco do Vini</b>
              <small>não é o Vini a sério</small>
            </div>
            <button type="button" className="boneco-painel__menu" onClick={perguntarEsconder} aria-label="Esconder o boneco" title="Esconder o boneco">Esconder</button>
            <button type="button" className="boneco-painel__fechar" onClick={fechar} aria-label="Fechar a conversa">✕</button>
          </header>

          <div className="boneco-conversa">
            {mensagens.map((m) => (
              <div key={m.id} className={`boneco-msg boneco-msg--${m.de}`}>
                {m.texto && <p>{m.texto}</p>}
                {m.extra === 'urgentes' && <ListaUrgentes />}
                {m.extra === 'apoio' && <LinhasDeApoio />}
                {m.extra === 'contacto' && <ContactoDoVini contacto={prefs.bonecoContacto} aoDefinir={aoDefinirContacto} />}
              </div>
            ))}
            <div ref={fimDaConversa} />
          </div>

          <div className="boneco-escolhas">
            {passo === 'estado' && ESTADOS.map((e) => (
              <button key={e.id} type="button" className={`boneco-chip${e.id === 'mal' ? ' boneco-chip--cuidado' : ''}`} onClick={() => escolherEstado(e.id)}>{e.rotulo}</button>
            ))}
            {passo === 'esconder' && (
              <>
                <button type="button" className="boneco-chip boneco-chip--forte" onClick={esconder}>Esconder</button>
                <button type="button" className="boneco-chip" onClick={outraCoisa}>Ficar</button>
              </>
            )}
            {passo === 'acoes' && (
              <>
                {acoes.map((a) => (
                  <button key={a} type="button" className="boneco-chip boneco-chip--forte" onClick={() => executarAcao(a)}>{ACOES[a]}</button>
                ))}
                <button type="button" className="boneco-chip" onClick={outraCoisa}>Outra coisa</button>
              </>
            )}
          </div>
        </section>
      )}

      {!aberto && (
        <button ref={botao} type="button" className="boneco-botao" onClick={abrir} aria-label="Falar com o boneco do Vini">
          <AvatarBoneco aspeto={prefs.bonecoAspeto} />
        </button>
      )}

      {barney && <Barney variante="segredo" onTerminar={() => setBarney(false)} />}
    </div>
  );
}
