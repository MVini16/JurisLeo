// aviso de privacidade antes da primeira revisão de texto — o texto dela vai sair do telemóvel
import { useEffect, useRef } from 'react';
import { AVISO_PRIVACIDADE, LINK_LANGUAGETOOL } from '../data/languagetool.js';

export default function AvisoPrivacidade({ onAceitar, onRecusar }) {
  const botaoAceitar = useRef(null);

  // o foco vai para a decisão, para quem usa leitor de ecrã ou teclado
  useEffect(() => { botaoAceitar.current?.focus(); }, []);

  return (
    <div className="revisao-fundo" onClick={onRecusar}>
      <div
        className="revisao-aviso"
        role="dialog"
        aria-modal="true"
        aria-labelledby="revisao-aviso-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <strong id="revisao-aviso-titulo" className="revisao-aviso__titulo">{AVISO_PRIVACIDADE.titulo}</strong>
        <p className="revisao-aviso__texto">{AVISO_PRIVACIDADE.texto}</p>
        <button ref={botaoAceitar} type="button" className="revisao-botao revisao-botao--cheio" onClick={onAceitar}>
          {AVISO_PRIVACIDADE.aceitar}
        </button>
        <button type="button" className="revisao-botao revisao-botao--texto" onClick={onRecusar}>
          {AVISO_PRIVACIDADE.recusar}
        </button>
        <a className="revisao-credito" href={LINK_LANGUAGETOOL} target="_blank" rel="noreferrer">Correção por LanguageTool</a>
      </div>
    </div>
  );
}
