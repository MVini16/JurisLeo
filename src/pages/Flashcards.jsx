// flashcards com repetição espaçada
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { useFlashcards } from '../hooks/useFlashcards.js';
import { estaPronto, ordenarPorPrioridade, CONFIANCAS } from '../services/repeticaoEspacada.js';
import { lerEmVozAlta, vozDisponivel, pararVoz } from '../services/voz.js';
import { converterLacunas } from '../services/lacunas.js';
import { compararResposta, confiancaSugerida } from '../services/respostaEscrita.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import { cadeirasS1, coresCadeiras, abrevCadeiras } from '../data/dadosLeonor.js';
import './Flashcards.css';
import Carregando from '../components/animacoes/Carregando.jsx';
import TextareaRevista from '../components/TextareaRevista.jsx';
import { useEcraAceso } from '../hooks/useEcraAceso.js';

export default function Flashcards() {
  const { darkMode } = useTheme();
  const { flashcards, loading, adicionar, apagar, registarResposta } = useFlashcards();
  const [searchParams] = useSearchParams();
  // vindo do modo frequência: /flashcards?cadeira=X&baralho=1 — rever tudo da cadeira, não só o que está pronto
  const cadeiraDoBaralho = searchParams.get('cadeira');
  const ehBaralhoFrequencia = searchParams.get('baralho') === '1' && !!cadeiraDoBaralho;
  const [filtroCadeira, setFiltroCadeira] = useState(cadeiraDoBaralho || 'todas');
  const [formAberto, setFormAberto] = useState(false);
  const [emRevisao, setEmRevisao] = useState(ehBaralhoFrequencia);

  const prontos = flashcards.filter((f) => estaPronto(f));
  const filtrados = flashcards.filter((f) => filtroCadeira === 'todas' || f.cadeiraId === filtroCadeira);
  const filaRevisao = ehBaralhoFrequencia
    ? filtrados
    : ordenarPorPrioridade(prontos.filter((f) => filtroCadeira === 'todas' || f.cadeiraId === filtroCadeira));

  return (
    <div className={`flashcards-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="flashcards-header">
        <div>
          <h1 className="flashcards-titulo">Flashcards</h1>
          <span className="flashcards-contador">{flashcards.length} no total</span>
        </div>
        <button className="flashcards-btn-novo" onClick={() => setFormAberto((f) => !f)}>{formAberto ? 'Fechar' : '+ Novo'}</button>
      </header>

      {ehBaralhoFrequencia ? (
        <p className="flashcards-baralho-nota">🎯 Baralho até à frequência: todos os cartões desta cadeira, prontos ou não.</p>
      ) : (
        <div className="flashcards-revisao-card">
          <div>
            <strong>{prontos.length}</strong> pronto{prontos.length === 1 ? '' : 's'} para rever hoje
          </div>
          <button className="flashcards-btn-revisao" onClick={() => setEmRevisao(true)} disabled={filaRevisao.length === 0}>
            ▶ Começar revisão
          </button>
        </div>
      )}

      {formAberto && <FormNovoFlashcard onGuardar={async (d) => { await adicionar(d); setFormAberto(false); }} />}

      <div className="flashcards-filtros">
        <button className={`flashcards-filtro-btn ${filtroCadeira === 'todas' ? 'ativo' : ''}`} onClick={() => setFiltroCadeira('todas')}>Todas</button>
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`flashcards-filtro-btn ${filtroCadeira === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setFiltroCadeira(c.id)}>
            {c.abrev}
          </button>
        ))}
      </div>

      {loading && <Carregando texto="A carregar..." />}
      {!loading && filtrados.length === 0 && <p className="flashcards-vazio">Ainda não tens flashcards aqui. Toca em "+ Novo" para começares.</p>}

      <div className="flashcards-lista">
        {filtrados.map((f) => (
          <FlashcardMini key={f.id} flashcard={f} onApagar={() => apagar(f.id)} />
        ))}
      </div>

      {/* só depois de os cartões chegarem: a sessão fixa a lista no momento em que abre */}
      {emRevisao && !loading && (
        <SessaoRevisao
          fila={filaRevisao}
          onResponder={registarResposta}
          onFechar={() => setEmRevisao(false)}
        />
      )}
    </div>
  );
}

function FormNovoFlashcard({ onGuardar }) {
  const [frente, setFrente] = useState('');
  const [tras, setTras] = useState('');
  const [cadeiraId, setCadeiraId] = useState(cadeirasS1[0].id);
  const [aGuardar, setAGuardar] = useState(false);
  const [comLacunas, setComLacunas] = useState(false);

  // com lacunas: uma frase só, com {{ }} à volta do que se quer esconder
  const lacunas = comLacunas ? converterLacunas(frente) : null;
  const podeGuardar = comLacunas ? !!lacunas : !!frente.trim() && !!tras.trim();

  async function guardar() {
    if (!podeGuardar) return;
    setAGuardar(true);
    if (lacunas) await onGuardar({ frente: lacunas.frente, tras: lacunas.tras, cadeiraId, lacunas: true });
    else await onGuardar({ frente: frente.trim(), tras: tras.trim(), cadeiraId });
    setAGuardar(false);
  }

  return (
    <div className="flashcards-form-novo">
      <div className="flashcards-form-novo__cadeiras">
        {cadeirasS1.map((c) => (
          <button key={c.id} className={`flashcards-chip-cadeira ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--cor': c.cor }} onClick={() => setCadeiraId(c.id)}>{c.abrev}</button>
        ))}
      </div>
      <div className="flashcards-modo" role="group" aria-label="Tipo de cartão">
        <button type="button" className={`flashcards-modo__btn ${!comLacunas ? 'ativo' : ''}`} onClick={() => setComLacunas(false)}>Pergunta e resposta</button>
        <button type="button" className={`flashcards-modo__btn ${comLacunas ? 'ativo' : ''}`} onClick={() => setComLacunas(true)}>Com lacunas</button>
      </div>
      {comLacunas ? (
        <>
          <TextareaRevista className="flashcards-form-novo__textarea" placeholder="Escreve a frase e põe entre {{ }} o que queres esconder" rows={3} value={frente} onValor={setFrente} autoFocus />
          <p className="flashcards-lacunas-previa">{lacunas ? `Vais ver: ${lacunas.frente}` : 'Exemplo: O contrato é um {{negócio jurídico}} bilateral.'}</p>
        </>
      ) : (
        <>
          <TextareaRevista className="flashcards-form-novo__textarea" placeholder="Frente — a pergunta" rows={2} value={frente} onValor={setFrente} autoFocus />
          <TextareaRevista className="flashcards-form-novo__textarea" placeholder="Trás — a resposta" rows={2} value={tras} onValor={setTras} />
        </>
      )}
      <button className="flashcards-form-novo__guardar" onClick={guardar} disabled={aGuardar || !podeGuardar}>
        {aGuardar ? 'A guardar...' : 'Guardar'}
      </button>
    </div>
  );
}

function FlashcardMini({ flashcard, onApagar }) {
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const cor = coresCadeiras[flashcard.cadeiraId] || '#b8963e';
  const pronto = estaPronto(flashcard);

  return (
    <div className="flashcard-mini" style={{ '--cor': cor }}>
      <div className="flashcard-mini__topo">
        <span className="flashcard-mini__cadeira">{abrevCadeiras[flashcard.cadeiraId]}</span>
        <span className={`flashcard-mini__estado ${pronto ? 'pronto' : ''}`}>{pronto ? 'Pronto a rever' : 'Ainda não'}</span>
      </div>
      <p className="flashcard-mini__frente">{flashcard.frente}</p>
      <div className="flashcard-mini__niveis">
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={`flashcard-mini__nivel-dot ${(flashcard.nivel ?? 0) >= n ? 'ativo' : ''}`} />
        ))}
      </div>
      <div className="flashcard-mini__rodape">
        {!confirmarApagar ? (
          <button className="flashcard-mini__link" onClick={() => setConfirmarApagar(true)}>Apagar</button>
        ) : (
          <span className="flashcard-mini__confirmar">Apagar? <button className="flashcard-mini__link" onClick={onApagar}>Sim</button> / <button className="flashcard-mini__link" onClick={() => setConfirmarApagar(false)}>Não</button></span>
        )}
      </div>
    </div>
  );
}

function SessaoRevisao({ fila: filaAoVivo, onResponder, onFechar }) {
  // a lista fica fixa ao abrir: cada resposta adia o cartão e tirava-o da lista
  // ao vivo, e o índice seguinte saltava um cartão (com 10 prontos via 5)
  const [fila] = useState(filaAoVivo);
  useEcraAceso(true);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  // o que ela escreveu antes de virar (opcional): ao virar, compara com a resposta
  const [escrita, setEscrita] = useState('');
  const atual = fila[indice];

  // lista vazia fecha logo; ao sair, a leitura em voz alta para
  useEffect(() => {
    if (fila.length === 0) onFechar();
  }, [fila, onFechar]);
  useEffect(() => () => pararVoz(), []);

  function responder(confianca) {
    // não espera pelo servidor: sem rede a revisão continua e a resposta sobe depois
    Promise.resolve(onResponder(atual, confianca)).catch(() => {});
    pararVoz();
    if (indice + 1 >= fila.length) {
      onFechar();
    } else {
      setIndice((i) => i + 1);
      setVirado(false);
      setEscrita('');
    }
  }

  if (!atual) return null;

  const comparacao = virado && escrita.trim() ? compararResposta(escrita, atual.tras) : null;
  const sugerida = comparacao ? confiancaSugerida(comparacao.percentagem) : null;

  return (
    <div className="revisao-overlay no-print">
      <button className="revisao-fechar" onClick={onFechar} aria-label="Fechar a revisão">✕</button>
      <span className="revisao-progresso">{indice + 1} / {fila.length}</span>

      <div className={`revisao-carta ${virado ? 'virada' : ''}`} onClick={() => setVirado((v) => !v)}>
        <div className="revisao-carta__face revisao-carta__frente">
          <p>{atual.frente}</p>
          <span className="revisao-carta__dica">Toca para veres a resposta</span>
        </div>
        <div className="revisao-carta__face revisao-carta__tras">
          <p>{atual.tras}</p>
        </div>
      </div>

      {!virado && (
        <div className="revisao-escrita">
          <textarea
            className="revisao-escrita__campo"
            value={escrita}
            onChange={(e) => setEscrita(e.target.value)}
            placeholder="Escreve a tua resposta antes de virar (opcional)"
            aria-label="A tua resposta"
            rows={3}
          />
          <button type="button" className="revisao-escrita__virar" onClick={() => setVirado(true)}>{escrita.trim() ? 'Comparar com a resposta' : 'Ver a resposta'}</button>
        </div>
      )}

      {comparacao && (
        <div className="revisao-comparacao" aria-label="A tua resposta comparada com a do cartão">
          <p className="revisao-comparacao__palavras">
            {comparacao.palavras.map((p, i) => <span key={i} className={`revisao-palavra revisao-palavra--${p.estado}`}>{p.texto}</span>)}
          </p>
          {comparacao.percentagem !== null && (
            <div className="revisao-comparacao__medidor">
              <span><i style={{ width: `${comparacao.percentagem}%` }} /></span>
              <b>{comparacao.percentagem}%</b>
            </div>
          )}
          <p className="revisao-comparacao__legenda">A verde o que escreveste; sublinhado o que faltou. {sugerida ? `Sugestão: ${sugerida} · ${CONFIANCAS[sugerida - 1].nome}.` : ''} Quem decide és tu.</p>
        </div>
      )}

      {virado && (
        <div className="revisao-confianca" role="group" aria-label="Como te correu?">
          <p className="revisao-confianca__titulo">Como te correu?</p>
          <div className="revisao-confianca__botoes">
            {CONFIANCAS.map((c) => (
              <button key={c.valor} type="button" className={`revisao-confianca__btn confianca-${c.valor} ${sugerida === c.valor ? 'sugerida' : ''}`} onClick={() => responder(c.valor)}>
                <b>{c.valor}</b>
                <span>{c.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {vozDisponivel() && (
        <button type="button" className="revisao-ouvir" onClick={() => lerEmVozAlta(virado ? `${atual.frente}. ${atual.tras}` : atual.frente)}>
          Ouvir {virado ? 'tudo' : 'a pergunta'}
        </button>
      )}
    </div>
  );
}
