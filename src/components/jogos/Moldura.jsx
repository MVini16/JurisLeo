// as peças que os quatro jogos partilham: a moldura (cabeçalho com pontos e sair) e o ecrã do fim com as recompensas
import { useEffect, useState } from 'react';
import { nivelDeCarreira, mensagemQuase } from '../../services/jogosMeta.js';
import { RARIDADES } from '../../data/selos.js';
import { tocarSom } from '../../services/som.js';

export function Moldura({ jogo, skin, titulo, pontos, subtitulo, aoSair, children, extraCab }) {
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
        {extraCab}
        <span className="jg-pontos" key={pontos} aria-label={`${pontos} pontos`}>{pontos}<small> pts</small></span>
      </header>
      <div className="jg-corpo">{children}</div>
    </div>
  );
}

// número que sobe até ao valor final (os pontos "a contar" dão mais gosto)
function useContagem(alvo, duracao = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      setValor(Math.round(alvo * (1 - (1 - t) ** 3)));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo, duracao]);
  return valor;
}

function BarraDeNivel({ xp, rotuloExtra }) {
  const n = nivelDeCarreira(xp);
  return (
    <div className="jg-nivel" role="img" aria-label={`${n.titulo}, ${n.xpNoNivel} pontos de experiência neste nível`}>
      <div className="jg-nivel__topo">
        <b>{n.titulo}</b>
        <small>{n.proximoTitulo ? `faltam ${n.xpParaProximo} XP para ${n.proximoTitulo}` : 'nível máximo'}{rotuloExtra}</small>
      </div>
      <div className="jg-nivel__barra"><i style={{ width: `${Math.min(100, n.fracao * 100)}%` }} /></div>
    </div>
  );
}

// `revisao`: lista de { titulo, certa, fonte } do que falhou. `meta` vem de terminarJogada (services/jogosLocal.js)
export function FimDeJogo({ jogo, skin, titulo, destaque, resumo, revisao = [], meta, sugerirPausa = false, aoOutraVez, aoSair }) {
  const [aberta, setAberta] = useState(false);
  const pontosVisiveis = useContagem(meta.pontos);
  const xpAntes = meta.perfil.xp - meta.xpGanho;
  const xpAgora = aberta ? meta.perfil.xp : xpAntes + meta.xpBase + meta.bonusDiario;

  function abrirDespacho() {
    setAberta(true);
    tocarSom('caixa');
    setTimeout(() => { if (meta.subiuDeNivel) tocarSom('nivel'); else if (meta.selo) tocarSom('selo'); }, 700);
  }

  useEffect(() => { if (meta.novoRecorde) tocarSom('combo'); else tocarSom('martelo'); }, [meta.novoRecorde]);

  return (
    <div className="jg" data-skin={skin} style={{ '--jg-cor': jogo.cor }} role="dialog" aria-label="Fim do jogo">
      <div className="jg-confetis" aria-hidden="true">{Array.from({ length: meta.novoRecorde || meta.perfeita ? 40 : 14 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
      <div className="jg-fim">
        <p className="jg-fim__jogo">{titulo}</p>
        {destaque && <h2 className="jg-fim__destaque">{destaque}</h2>}
        <p className="jg-fim__pontos">{pontosVisiveis}<small> pontos</small></p>
        {meta.novoRecorde && <p className="jg-fim__recorde">Novo recorde!</p>}
        <p className="jg-fim__quase">{mensagemQuase({ pontos: meta.pontos, melhor: meta.melhorAntes, novoRecorde: meta.novoRecorde })}</p>
        {resumo && <p className="jg-fim__resumo">{resumo}</p>}

        <section className="jg-recompensa" aria-label="Recompensas">
          <p className="jg-xp">
            <b>+{meta.xpBase} XP</b>
            {meta.perfeita && <span>Jogada perfeita</span>}
            {meta.bonusDiario > 0 && <span>Audiência do dia +{meta.bonusDiario}</span>}
            {aberta && meta.caixa.multiplicador > 1 && <span className="jg-xp__mult">x{meta.caixa.multiplicador} = {meta.xpBase * meta.caixa.multiplicador} XP</span>}
          </p>
          <BarraDeNivel xp={xpAgora} />

          {!aberta ? (
            <button type="button" className="jg-despacho" onClick={abrirDespacho}>
              <span className="jg-despacho__selo" aria-hidden="true">?</span>
              <span>Abrir o despacho do dia</span>
              <small>Pode dobrar, triplicar ou mais o teu XP</small>
            </button>
          ) : (
            <div className="jg-despacho jg-despacho--aberto" role="status">
              <b>{meta.caixa.rotulo}</b>
              <span>{meta.caixa.multiplicador === 1 ? 'Desta vez sem bónus. Tenta outra vez.' : `O teu XP multiplicou por ${meta.caixa.multiplicador}.`}</span>
            </div>
          )}

          {aberta && meta.subiuDeNivel && (
            <p className="jg-subiu" role="status">Subiste: {meta.nivelDepois.titulo}!</p>
          )}
          {aberta && meta.selo && (
            <div className={`jg-novo-selo jg-raridade--${meta.selo.raridade}`} role="status">
              <small>Novo selo · {RARIDADES[meta.selo.raridade].rotulo}</small>
              <b>{meta.selo.latim}</b>
              <span>{meta.selo.significado}</span>
            </div>
          )}
          {aberta && meta.conquistasNovas.length > 0 && (
            <p className="jg-conquistas" role="status">Conquista: {meta.conquistasNovas.length === 1 ? 'nova' : 'novas'}. Vê o separador Conquistas nos jogos.</p>
          )}
        </section>

        {sugerirPausa && <p className="jg-pausa" role="note">Já jogaste mais de 25 minutos. Uma pausa de cinco minutos ajuda a fixar o que aprendeste.</p>}

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
          <button type="button" className="jg-botao jg-botao--forte jg-botao--mais" onClick={aoOutraVez}>Mais uma!</button>
          <button type="button" className="jg-botao" onClick={aoSair}>Voltar aos jogos</button>
        </div>
      </div>
    </div>
  );
}
