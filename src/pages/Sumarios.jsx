// os sumários de todas as aulas juntos, por cadeira: para estudar para a frequência, criar flashcards e levar para fora da app
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme.js';
import { usePresencas } from '../hooks/usePresencas.js';
import { criarFlashcard } from '../services/flashcards.js';
import { partilharTexto } from '../services/partilha.js';
import { cadeirasS1, coresCadeiras, nomeCurtoCadeira } from '../data/dadosLeonor.js';
import { cartaoDaAula, cartaoDoTopico, contarPorCadeira, dataBonita, filtrarSumarios, listarSumarios, sumariosParaTexto } from '../services/sumarios.js';
import BotaoVoltar from '../components/BotaoVoltar.jsx';
import Icone from '../components/icones/Icone.jsx';
import './Sumarios.css';

export default function Sumarios() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { notasAulasPorCadeira, carregado } = usePresencas();
  const [cadeiraId, setCadeiraId] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [aviso, setAviso] = useState('');
  const [topicoAberto, setTopicoAberto] = useState(null); // { chave, i }
  const [resposta, setResposta] = useState('');

  const todos = useMemo(() => listarSumarios(notasAulasPorCadeira), [notasAulasPorCadeira]);
  const contagem = useMemo(() => contarPorCadeira(todos), [todos]);
  const visiveis = useMemo(() => filtrarSumarios(todos, { cadeiraId, pesquisa }), [todos, cadeiraId, pesquisa]);

  function falar(texto) {
    setAviso(texto);
    setTimeout(() => setAviso(''), 2600);
  }

  async function cartaoDaAulaClick(item) {
    const c = cartaoDaAula(item);
    if (!c) return;
    await criarFlashcard(c);
    falar('Flashcard criado. Está em Flashcards.');
  }

  async function guardarTopico(item, topico) {
    const c = cartaoDoTopico(item, topico, resposta);
    if (!c) return;
    await criarFlashcard(c);
    setTopicoAberto(null);
    setResposta('');
    falar('Flashcard criado. Está em Flashcards.');
  }

  async function partilhar() {
    const r = await partilharTexto({ titulo: 'Sumários das aulas', texto: sumariosParaTexto(visiveis) });
    falar(r === 'copiado' ? 'Texto copiado. Cola onde quiseres.' : r === 'partilhado' ? 'Enviado.' : 'Não consegui partilhar. Tenta imprimir.');
  }

  return (
    <div className={`sumarios-pagina ${darkMode ? 'dark' : ''}`}>
      <BotaoVoltar />
      <header className="sumarios-header">
        <h1 className="sumarios-titulo">Sumários</h1>
        <span className="sumarios-sub">Tudo o que escreveste sobre as aulas, por cadeira. Escreves o sumário ao abrir uma aula no Calendário.</span>
      </header>

      <div className="sumarios-filtros no-print" role="tablist" aria-label="Cadeira">
        <button type="button" role="tab" aria-selected={cadeiraId === 'todas'} className={`sumarios-chip ${cadeiraId === 'todas' ? 'ativo' : ''}`} onClick={() => setCadeiraId('todas')}>Todas <b>{todos.length}</b></button>
        {cadeirasS1.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={cadeiraId === c.id} className={`sumarios-chip ${cadeiraId === c.id ? 'ativo' : ''}`} style={{ '--c': coresCadeiras[c.id] }} onClick={() => setCadeiraId(c.id)}>
            {c.abrev} <b>{contagem[c.id] || 0}</b>
          </button>
        ))}
      </div>

      <div className="sumarios-barra no-print">
        <input className="sumarios-pesquisa" type="search" placeholder="Procurar num sumário, nota ou dúvida" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} aria-label="Pesquisar nos sumários" />
        <button type="button" onClick={partilhar} disabled={visiveis.length === 0}>Partilhar texto</button>
        <button type="button" onClick={() => window.print()} disabled={visiveis.length === 0}>Imprimir ou PDF</button>
      </div>
      {aviso && <p className="sumarios-aviso no-print" role="status">{aviso}</p>}

      {!carregado && <p className="sumarios-vazio">A carregar...</p>}
      {carregado && todos.length === 0 && (
        <div className="sumarios-vazio sumarios-vazio--grande">
          <Icone nome="pena" tamanho={44} />
          <p>Ainda não escreveste nenhum sumário.</p>
          <button type="button" onClick={() => navigate('/calendario')}>Abrir o calendário</button>
        </div>
      )}
      {carregado && todos.length > 0 && visiveis.length === 0 && <p className="sumarios-vazio">Nada encontrado.</p>}

      <div className="sumarios-lista">
        {visiveis.map((i, n) => (
          <article key={i.chave} className="sumarios-cartao" style={{ '--c': coresCadeiras[i.cadeiraId] || 'var(--gold)', animationDelay: `${Math.min(n, 8) * 40}ms` }}>
            <header>
              <span className="sumarios-cartao__cadeira">{nomeCurtoCadeira(i.cadeiraId)}</span>
              <b>{i.titulo}</b>
              <time>{dataBonita(i.data)}</time>
            </header>
            {i.topicos.length > 0 && (
              <ul className="sumarios-topicos">
                {i.topicos.map((t, k) => (
                  <li key={`${t}-${k}`}>
                    <span>{t}</span>
                    <button type="button" className="sumarios-mini no-print" onClick={() => { setTopicoAberto({ chave: i.chave, k }); setResposta(''); }} aria-label={`Criar flashcard do tópico ${t}`}>+ cartão</button>
                    {topicoAberto?.chave === i.chave && topicoAberto.k === k && (
                      <div className="sumarios-resposta no-print">
                        <textarea rows={2} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Escreve a resposta deste cartão" aria-label="Resposta do cartão" />
                        <div>
                          <button type="button" onClick={() => guardarTopico(i, t)} disabled={!resposta.trim()}>Criar</button>
                          <button type="button" className="sumarios-mini" onClick={() => setTopicoAberto(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {i.nota && <p><b>Nota:</b> {i.nota}</p>}
            {i.tpc && <p><b>Trabalho para casa:</b> {i.tpc}</p>}
            {i.duvida && <p><b>Dúvida:</b> {i.duvida}</p>}
            <footer className="no-print">
              {i.topicos.length > 0 && <button type="button" onClick={() => cartaoDaAulaClick(i)}>Flashcard da aula</button>}
              <button type="button" onClick={() => navigate('/calendario', { state: { data: i.data } })} disabled={!i.data}>Abrir no calendário</button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
