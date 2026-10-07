// as peças que os quatro jogos partilham: a moldura (cabeçalho com pontos e sair) e o ecrã do fim
import { useEffect } from 'react';

export function Moldura({ jogo, skin, titulo, pontos, subtitulo, aoSair, children }) {
  // trava o scroll da página por baixo enquanto o jogo está aberto
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, []);

  return (
    <div className="jg" data-skin={skin} style={{ '--jg-cor': jogo.cor }} role="dialog" aria-label={titulo}>
      <header className="jg-cab">
        <button type="button" className="jg-sair" onClick={aoSair} aria-label="Sair do jogo">✕</button>
        <div className="jg-cab__texto">
          <b>{titulo}</b>
          {subtitulo && <small>{subtitulo}</small>}
        </div>
        <span className="jg-pontos" key={pontos} aria-label={`${pontos} pontos`}>{pontos}<small> pts</small></span>
      </header>
      <div className="jg-corpo">{children}</div>
    </div>
  );
}

// `revisao`: lista de { titulo, certa, fonte } do que falhou, para ela voltar a ler
export function FimDeJogo({ jogo, skin, titulo, pontos, novoRecorde, melhor, resumo, destaque, revisao = [], aoOutraVez, aoSair }) {
  return (
    <div className="jg" data-skin={skin} style={{ '--jg-cor': jogo.cor }} role="dialog" aria-label="Fim do jogo">
      <div className="jg-confetis" aria-hidden="true">{Array.from({ length: novoRecorde ? 34 : 14 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
      <div className="jg-fim">
        <p className="jg-fim__jogo">{titulo}</p>
        {destaque && <h2 className="jg-fim__destaque">{destaque}</h2>}
        <p className="jg-fim__pontos">{pontos}<small> pontos</small></p>
        {novoRecorde ? <p className="jg-fim__recorde">Novo recorde!</p> : <p className="jg-fim__melhor">O teu melhor: {melhor}</p>}
        {resumo && <p className="jg-fim__resumo">{resumo}</p>}

        {revisao.length > 0 && (
          <section className="jg-revisao" aria-label="Para rever">
            <h3>Para rever</h3>
            <ul>
              {revisao.map((r, i) => (
                <li key={i}>
                  <b>{r.titulo}</b>
                  <span>{r.certa}</span>
                  {r.fonte && <small>{r.fonte}</small>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="jg-fim__botoes">
          <button type="button" className="jg-botao jg-botao--forte" onClick={aoOutraVez}>Jogar outra vez</button>
          <button type="button" className="jg-botao" onClick={aoSair}>Voltar aos jogos</button>
        </div>
      </div>
    </div>
  );
}
