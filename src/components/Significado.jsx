// botão "significado" e folha de baixo com separadores dicionário / wikipédia (preview aprovado: opção a)
// usa a palavra selecionada no campo, ou a palavra onde está o cursor; dá para procurar outra na folha
import { useState, useEffect, useRef } from 'react';
import { useSignificado } from '../hooks/useSignificado.js';
import { termoDoCampo } from '../services/apis/wikimedia.js';
import { AVISO_FONTE, CREDITO_WIKIMEDIA } from '../data/wikimedia.js';
import CaixaErroApi from './CaixaErroApi.jsx';
import './RevisaoTexto.css';
import './Significado.css';

function Dicionario({ resultado }) {
  if (resultado.erro) return <CaixaErroApi erro={resultado.erro} tentarDepois={resultado.tentarDepois} />;
  const { dados } = resultado;
  if (!dados) return null;
  return (
    <div className="signif-caixa">
      {dados.lingua !== 'Português' && <span className="signif-lingua">Em {dados.lingua.toLowerCase()}</span>}
      {dados.classes.map((c) => (
        <div key={c.classe} className="signif-classe">
          <span className="signif-classe__nome">{c.classe}</span>
          <ol className="signif-classe__lista">
            {c.definicoes.map((d, i) => <li key={i}>{d}</li>)}
          </ol>
        </div>
      ))}
      <a href={dados.url} target="_blank" rel="noreferrer">Ver no Wikcionário</a>
    </div>
  );
}

function Wikipedia({ resultado }) {
  if (resultado.erro) return <CaixaErroApi erro={resultado.erro} tentarDepois={resultado.tentarDepois} />;
  const { dados } = resultado;
  if (!dados) return null;
  return (
    <div className="signif-caixa">
      <strong className="signif-titulo">{dados.titulo}</strong>
      {dados.descricao && <span className="signif-descricao">{dados.descricao}</span>}
      {dados.desambiguacao
        ? <p>Há vários artigos com este nome. Abre a página para escolheres o que procuras.</p>
        : <p className="signif-extrato">{dados.extrato}</p>}
      {dados.url && <a href={dados.url} target="_blank" rel="noreferrer">Ler o artigo na Wikipédia</a>}
    </div>
  );
}

export default function Significado({ texto, campoRef }) {
  const [aberta, setAberta] = useState(false);
  const [aba, setAba] = useState('dicionario');
  const [pesquisa, setPesquisa] = useState('');
  const { termo, aCarregar, dicionario, wikipedia, procurar } = useSignificado();
  const botaoFechar = useRef(null);

  useEffect(() => {
    if (aberta) botaoFechar.current?.focus();
  }, [aberta]);

  function abrir() {
    const campo = campoRef?.current;
    const palavra = campo ? termoDoCampo(texto, campo.selectionStart ?? 0, campo.selectionEnd ?? 0) : '';
    setPesquisa(palavra);
    setAba('dicionario');
    setAberta(true);
    if (palavra) procurar(palavra);
  }

  function aoProcurar(e) {
    e.preventDefault();
    if (pesquisa.trim()) procurar(pesquisa);
  }

  return (
    <>
      <button type="button" className="revisao-botao revisao-botao--rever" onClick={abrir}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /><path d="M9 8h6M9 12h4" />
        </svg>
        Significado
      </button>

      {aberta && (
        <div className="revisao-fundo revisao-fundo--folha" onClick={() => setAberta(false)}>
          <div className="revisao-folha" role="dialog" aria-modal="true" aria-labelledby="signif-titulo" onClick={(e) => e.stopPropagation()}>
            <span className="revisao-folha__pega" aria-hidden="true" />
            <div className="revisao-folha__topo">
              <strong id="signif-titulo" className="revisao-folha__titulo">Significado</strong>
              <button ref={botaoFechar} type="button" className="revisao-botao revisao-botao--texto" onClick={() => setAberta(false)}>Fechar</button>
            </div>

            <form className="signif-pesquisa" onSubmit={aoProcurar}>
              <input
                type="search"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Escreve uma palavra ou expressão"
                aria-label="Palavra a procurar"
                enterKeyHint="search"
              />
              <button type="submit" className="revisao-botao revisao-botao--cheio" disabled={!pesquisa.trim() || aCarregar}>Procurar</button>
            </form>

            <p className="signif-aviso">{AVISO_FONTE}</p>

            {termo && (
              <div className="signif-abas" role="tablist" aria-label="Fonte">
                <button type="button" role="tab" aria-selected={aba === 'dicionario'} className={`signif-aba ${aba === 'dicionario' ? 'ativa' : ''}`} onClick={() => setAba('dicionario')}>Dicionário</button>
                <button type="button" role="tab" aria-selected={aba === 'wikipedia'} className={`signif-aba ${aba === 'wikipedia' ? 'ativa' : ''}`} onClick={() => setAba('wikipedia')}>Wikipédia</button>
              </div>
            )}

            {!termo && <p className="revisao-folha__nota">Seleciona uma palavra no texto, ou escreve-a aqui em cima.</p>}
            {aCarregar && <div className="revisao-folha__esqueleto" aria-busy="true" />}
            {termo && !aCarregar && (aba === 'dicionario' ? <Dicionario resultado={dicionario} /> : <Wikipedia resultado={wikipedia} />)}

            <span className="revisao-credito">{CREDITO_WIKIMEDIA}</span>
          </div>
        </div>
      )}
    </>
  );
}
