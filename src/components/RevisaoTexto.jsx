// botão "rever texto" para qualquer campo onde ela escreve, com a folha de baixo dos erros (languagetool)
// uso: <RevisaoTexto texto={x} setTexto={setX} campo={adaptador} />
// o adaptador do campo (textarea ou editor) tem: selecao() → { inicio, fim }, selecionar(inicio, fim),
// e, no editor com formatação, substituir(inicio, fim, texto) e desfazer()
// só envia o texto quando ela carrega no botão; na primeira vez mostra o aviso de privacidade
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRevisaoTexto } from '../hooks/useRevisaoTexto.js';
import { usePalavrasConhecidas } from '../hooks/usePalavrasConhecidas.js';
import { contextoDoErro, normalizarPalavra } from '../services/apis/languagetool.js';
import { CHAVE_AVISO_PRIVACIDADE, LINK_LANGUAGETOOL, ROTULOS_TIPO } from '../data/languagetool.js';
import AvisoPrivacidade from './AvisoPrivacidade.jsx';
import CaixaErroApi from './CaixaErroApi.jsx';
import Toast from './Toast.jsx';
import './RevisaoTexto.css';

function avisoJaAceite() {
  try {
    return globalThis.localStorage?.getItem(CHAVE_AVISO_PRIVACIDADE) === 'sim';
  } catch {
    return false;
  }
}

function guardarAvisoAceite() {
  try {
    globalThis.localStorage?.setItem(CHAVE_AVISO_PRIVACIDADE, 'sim');
  } catch {
    // modo privado: o aviso volta a aparecer da próxima vez, o que não faz mal
  }
}

// o texto do botão de cada sugestão — um espaço ou nada não se lê num botão
function rotuloTroca(troca) {
  if (troca === '') return 'Apagar';
  if (!troca.trim()) return 'Um espaço só';
  return `Trocar por “${troca}”`;
}

function contagem(n) {
  return n === 1 ? '1 coisa para ver' : `${n} coisas para ver`;
}

function ItemErro({ texto, erro, onTrocar, onIgnorar, onCerta, onVer }) {
  const { antes, errado, depois } = contextoDoErro(texto, erro);
  const temPalavra = Boolean(normalizarPalavra(erro.errado)) && erro.tipo !== 'pontuacao';
  return (
    <li className="revisao-item">
      <span className={`revisao-item__tipo revisao-item__tipo--${erro.tipo}`}>{ROTULOS_TIPO[erro.tipo] ?? ROTULOS_TIPO.outro}</span>
      <p className="revisao-item__contexto">
        {antes}<mark className="revisao-item__errado">{errado}</mark>{depois}
      </p>
      <p className="revisao-item__mensagem">{erro.mensagem}</p>
      <div className="revisao-item__acoes">
        {erro.sugestoes.map((troca) => (
          <button key={troca} type="button" className="revisao-botao revisao-botao--cheio" onClick={() => onTrocar(erro, troca)}>
            {rotuloTroca(troca)}
          </button>
        ))}
        <button type="button" className="revisao-botao" onClick={() => onIgnorar(erro)}>Ignorar</button>
      </div>
      <div className="revisao-item__acoes revisao-item__acoes--secundarias">
        <button type="button" className="revisao-botao revisao-botao--texto" onClick={() => onVer(erro)}>Ver no texto</button>
        {temPalavra && (
          <button type="button" className="revisao-botao revisao-botao--texto" onClick={() => onCerta(erro)}>
            Está certa, não voltar a marcar
          </button>
        )}
      </div>
    </li>
  );
}

export default function RevisaoTexto({ texto, setTexto, campo }) {
  // os listeners das palavras conhecidas só abrem depois do primeiro toque no botão
  const [ativo, setAtivo] = useState(false);
  const [aviso, setAviso] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [selecao, setSelecao] = useState(null);
  const botaoFechar = useRef(null);

  const { conhecidas, adicionar } = usePalavrasConhecidas(ativo);
  const revisao = useRevisaoTexto(texto, setTexto, conhecidas, campo);
  const { rever } = revisao;

  // o foco vai para a folha quando abre (leitor de ecrã e teclado)
  useEffect(() => {
    if (aberta) botaoFechar.current?.focus();
  }, [aberta]);

  const comecar = useCallback((sel) => {
    setAtivo(true);
    setAberta(true);
    rever(sel);
  }, [rever]);

  function aoCarregar() {
    // se ela tiver um bocado selecionado, revê só esse bocado
    const atual = campo?.selecao();
    const sel = atual && atual.fim > atual.inicio ? atual : null;
    setSelecao(sel);
    if (!avisoJaAceite()) {
      setAviso(true);
      return;
    }
    comecar(sel);
  }

  function aoAceitarAviso() {
    guardarAvisoAceite();
    setAviso(false);
    comecar(selecao);
  }

  // fecha a folha e seleciona a palavra no campo, para ela ver o contexto todo
  function verNoTexto(erro) {
    setAberta(false);
    if (!campo) return;
    requestAnimationFrame(() => campo.selecionar(erro.inicio, erro.inicio + erro.tamanho));
  }

  const aRever = revisao.estado === 'aRever';
  const vazio = revisao.estado === 'pronto' && revisao.erros.length === 0;

  return (
    <>
      <button
        type="button"
        className="revisao-botao revisao-botao--rever"
        onClick={aoCarregar}
        disabled={aRever || revisao.bloqueado || !texto?.trim()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h10M4 12h7M4 17h6" /><path d="m14 16 2.5 2.5L21 13" />
        </svg>
        {aRever ? 'A rever…' : revisao.bloqueado ? 'Rever texto (em pausa)' : 'Rever texto'}
      </button>

      {aviso && <AvisoPrivacidade onAceitar={aoAceitarAviso} onRecusar={() => setAviso(false)} />}

      {aberta && (
        <div className="revisao-fundo revisao-fundo--folha" onClick={() => setAberta(false)}>
          <div
            className="revisao-folha"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revisao-folha-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="revisao-folha__pega" aria-hidden="true" />
            <div className="revisao-folha__topo">
              <strong id="revisao-folha-titulo" className="revisao-folha__titulo">
                {aRever && 'A rever o teu texto…'}
                {revisao.estado === 'pronto' && (vazio ? 'Tudo certo por aqui' : contagem(revisao.erros.length))}
                {revisao.estado === 'erro' && 'Não deu para rever'}
              </strong>
              <button ref={botaoFechar} type="button" className="revisao-botao revisao-botao--texto" onClick={() => setAberta(false)}>Fechar</button>
            </div>

            {selecao && revisao.estado !== 'erro' && <p className="revisao-folha__nota">Só a parte que selecionaste.</p>}

            {revisao.textoMudou && (
              <div className="revisao-folha__mudou">
                <span>Escreveste depois de rever, por isso tirei as sugestões que já não batiam certo.</span>
                {/* depois de escrever, a seleção antiga pode já não bater certo: revê-se tudo */}
                <button type="button" className="revisao-botao" onClick={() => { setSelecao(null); rever(null); }}>Rever outra vez</button>
              </div>
            )}

            {aRever && <div className="revisao-folha__esqueleto" aria-busy="true" />}

            {revisao.estado === 'erro' && <CaixaErroApi erro={revisao.erro} tentarDepois={revisao.tentarDepois} />}

            {vazio && <p className="revisao-folha__vazio">Não encontrei nada para corrigir.</p>}

            {revisao.estado === 'pronto' && revisao.erros.length > 0 && (
              <ul className="revisao-lista">
                {revisao.erros.map((erro) => (
                  <ItemErro
                    key={erro.id}
                    texto={texto}
                    erro={erro}
                    onTrocar={revisao.trocar}
                    onIgnorar={revisao.ignorar}
                    onCerta={(e) => adicionar(e.errado)}
                    onVer={verNoTexto}
                  />
                ))}
              </ul>
            )}

            <a className="revisao-credito" href={LINK_LANGUAGETOOL} target="_blank" rel="noreferrer">Correção por LanguageTool</a>
          </div>
        </div>
      )}

      {revisao.podeDesfazer && (
        <Toast
          mensagem="Palavra trocada."
          acao={{ texto: 'Desfazer', fn: revisao.desfazer }}
          duracao={6000}
          onFechar={revisao.limparDesfazer}
        />
      )}
    </>
  );
}
